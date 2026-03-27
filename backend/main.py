"""
Budget Craving — shared budget tracking game for couples.

Each partner gets the same starting budget and logs what they spend.
Whoever runs out of their budget first is "more craving" and loses.
Admin can configure the budget and reset the game at any time.
"""
from fastapi import FastAPI, HTTPException, status, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import Optional, List
import jwt
import os
import logging
import json
from dotenv import load_dotenv
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

app = FastAPI(
    title="Budget Craving API",
    description="Per-player budget tracking game — whoever spends their budget first loses",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_router = APIRouter(prefix="/api")

# --- Configuration ---

SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-me")
ALGORITHM = "HS256"
TOKEN_EXPIRE_MINUTES = 30
DEFAULT_BUDGET = float(os.getenv("DEFAULT_BUDGET", "500"))

USERS = {
    "A": {"password": os.getenv("USER_A_PASSWORD", "password"), "role": "A"},
    "Z": {"password": os.getenv("USER_Z_PASSWORD", "password"), "role": "Z"},
    "admin": {"password": os.getenv("ADMIN_PASSWORD", "password"), "role": "admin"},
}


# --- Data models ---

class Transaction(BaseModel):
    player: str       # "A" or "Z"
    amount: float
    description: str  # what they craved
    timestamp: str


class GameState(BaseModel):
    # Each player has their own independent budget
    budget_a: float
    budget_z: float
    initial_budget: float    # same starting amount for both players
    spent_a: float = 0.0
    spent_z: float = 0.0
    transactions: List[Transaction] = []
    game_over: bool = False
    loser: Optional[str] = None   # "A", "Z", or "tie" — who ran out first
    last_updated: Optional[str] = None
    last_updated_by: Optional[str] = None


class LoginRequest(BaseModel):
    username: str
    password: str


class SpendRequest(BaseModel):
    amount: float
    description: str
    player: Optional[str] = None  # admin only: "A" or "Z"


class ResetRequest(BaseModel):
    budget: Optional[float] = None  # admin can override the starting budget


# --- State persistence ---

STATE_FILE = Path("game_state.json")


def load_game_state() -> GameState:
    if STATE_FILE.exists():
        try:
            with open(STATE_FILE, "r") as f:
                data = json.load(f)
                return GameState(**data)
        except Exception as e:
            logger.warning(f"Could not load game_state.json, starting fresh: {e}")
    return _default_state()


def _default_state() -> GameState:
    return GameState(
        budget_a=DEFAULT_BUDGET,
        budget_z=DEFAULT_BUDGET,
        initial_budget=DEFAULT_BUDGET,
        last_updated=datetime.utcnow().isoformat(),
    )


def save_game_state(state: GameState) -> None:
    try:
        with open(STATE_FILE, "w") as f:
            json.dump(state.dict(), f, indent=2)
        logger.info(
            f"State saved — A: ${state.budget_a:.2f} remaining, "
            f"Z: ${state.budget_z:.2f} remaining"
        )
    except Exception as e:
        logger.error(f"Failed to persist game state: {e}")


game_state = load_game_state()


# --- Auth helpers ---

def create_token(username: str) -> str:
    payload = {
        "sub": username,
        "exp": datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRE_MINUTES),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> str:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if not username:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        return username
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


def current_user(authorization: Optional[str] = None) -> dict:
    if not authorization:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authorization header missing")
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise ValueError("Invalid scheme")
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Expected 'Bearer <token>'")

    username = decode_token(token)
    if username not in USERS:
        raise HTTPException(status_code=401, detail="User not found")

    return {"id": username, "role": USERS[username]["role"]}


# --- Endpoints ---

@api_router.get("/health")
async def health():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}


@api_router.post("/auth/login")
async def login(req: LoginRequest):
    user = USERS.get(req.username)
    if not user or user["password"] != req.password:
        logger.warning(f"Failed login attempt for username: '{req.username}'")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")

    logger.info(f"User '{req.username}' logged in")
    return {
        "user": {"id": req.username, "role": user["role"]},
        "token": create_token(req.username),
    }


@api_router.get("/auth/me")
async def me(authorization: str = Header(None)):
    return current_user(authorization)


@api_router.get("/game/state", response_model=GameState)
async def get_state(authorization: str = Header(None)):
    current_user(authorization)
    return game_state


@api_router.post("/game/spend")
async def spend(req: SpendRequest, authorization: str = Header(None)):
    global game_state

    user = current_user(authorization)

    if game_state.game_over:
        raise HTTPException(status_code=400, detail="Game is over. Ask admin to start a new round.")

    if req.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than zero.")

    if not req.description.strip():
        raise HTTPException(status_code=400, detail="Description cannot be empty.")

    # Determine which player is spending
    if user["role"] == "admin":
        player = (req.player or "A").upper()
        if player not in ("A", "Z"):
            raise HTTPException(status_code=400, detail="player must be 'A' or 'Z'.")
    elif user["role"] in ("A", "Z"):
        player = user["role"]
    else:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions.")

    # Validate against the player's own budget
    player_budget = game_state.budget_a if player == "A" else game_state.budget_z
    if req.amount > player_budget:
        raise HTTPException(
            status_code=400,
            detail=f"${req.amount:.2f} exceeds your remaining budget of ${player_budget:.2f}.",
        )

    # Apply spend to the correct player's budget
    if player == "A":
        game_state.budget_a = round(game_state.budget_a - req.amount, 2)
        game_state.spent_a = round(game_state.spent_a + req.amount, 2)
    else:
        game_state.budget_z = round(game_state.budget_z - req.amount, 2)
        game_state.spent_z = round(game_state.spent_z + req.amount, 2)

    game_state.transactions.append(Transaction(
        player=player,
        amount=req.amount,
        description=req.description.strip(),
        timestamp=datetime.utcnow().isoformat(),
    ))

    # Check game-over: whoever hits zero first loses
    a_done = game_state.budget_a <= 0
    z_done = game_state.budget_z <= 0

    if a_done or z_done:
        game_state.game_over = True
        if a_done and z_done:
            game_state.loser = "tie"
        elif a_done:
            game_state.loser = "A"
        else:
            game_state.loser = "Z"
        logger.info(f"Game over — loser: {game_state.loser}")

    game_state.last_updated = datetime.utcnow().isoformat()
    game_state.last_updated_by = user["id"]

    save_game_state(game_state)

    logger.info(
        f"Spend — player={player}, amount=${req.amount:.2f}, "
        f"item='{req.description}', budget_a=${game_state.budget_a:.2f}, "
        f"budget_z=${game_state.budget_z:.2f}"
    )

    return {"state": game_state, "timestamp": datetime.utcnow().isoformat()}


@api_router.post("/game/reset", response_model=GameState)
async def reset(req: ResetRequest = ResetRequest(), authorization: str = Header(None)):
    global game_state

    user = current_user(authorization)
    if user["role"] != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admin can reset the game.")

    new_budget = req.budget if (req.budget and req.budget > 0) else DEFAULT_BUDGET
    game_state = GameState(
        budget_a=new_budget,
        budget_z=new_budget,
        initial_budget=new_budget,
        last_updated=datetime.utcnow().isoformat(),
        last_updated_by=user["id"],
    )
    save_game_state(game_state)
    logger.info(f"Game reset by admin '{user['id']}'. Starting budget: ${new_budget:.2f} per player")
    return game_state


# Mount frontend static files — must come after API routes
app.include_router(api_router)

frontend_dist = Path(__file__).parent.parent / "frontend" / "dist"
if frontend_dist.exists():
    app.mount("/", StaticFiles(directory=str(frontend_dist), html=True), name="frontend")
    logger.info(f"Serving frontend from {frontend_dist}")
else:
    logger.warning("Frontend dist not found — run 'npm run build' inside frontend/")


if __name__ == "__main__":
    import uvicorn

    cert = Path(__file__).parent / "cert.pem"
    key = Path(__file__).parent / "key.pem"

    if cert.exists() and key.exists():
        logger.info("Starting with HTTPS (certificates found)")
        uvicorn.run(app, host="0.0.0.0", port=8000, ssl_certfile=str(cert), ssl_keyfile=str(key))
    else:
        logger.info("Starting with HTTP (no certificates found)")
        uvicorn.run(app, host="0.0.0.0", port=8000)
