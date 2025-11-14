"""
Counter Tracker API - Enhanced Backend with State Management
"""
from fastapi import FastAPI, HTTPException, status, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import Optional
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

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

app = FastAPI(
    title="Counter Tracker API",
    description="Real-time counter tracking with notifications",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import APIRouter for organizing endpoints
from fastapi import APIRouter
api_router = APIRouter(prefix="/api")

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Load user credentials from environment
USERS = {
    "A": {"password": os.getenv("USER_A_PASSWORD", "password"), "role": "A"},
    "Z": {"password": os.getenv("USER_Z_PASSWORD", "password"), "role": "Z"},
    "admin": {"password": os.getenv("ADMIN_PASSWORD", "password"), "role": "admin"}
}
class GameState(BaseModel):
    counter_a: int
    counter_z: int
    max_value: int = 100
    game_over: bool = False
    last_updated: Optional[str] = None
    last_updated_by: Optional[str] = None

# File-based persistence
STATE_FILE = Path("game_state.json")

def load_game_state():
    """Load game state from file or create new"""
    if STATE_FILE.exists():
        try:
            with open(STATE_FILE, 'r') as f:
                data = json.load(f)
                return GameState(**data)
        except Exception as e:
            logger.error(f"Error loading state: {e}")
            return get_default_state()
    return get_default_state()

def get_default_state():
    """Get default game state"""
    return GameState(
        counter_a=100,
        counter_z=100,
        max_value=100,
        game_over=False,
        last_updated=datetime.utcnow().isoformat(),
        last_updated_by=None
    )

def save_game_state(state: GameState):
    """Save game state to file"""
    try:
        with open(STATE_FILE, 'w') as f:
            json.dump(state.dict(), f)
        logger.info(f"Game state saved: A={state.counter_a}, Z={state.counter_z}")
    except Exception as e:
        logger.error(f"Error saving state: {e}")

# Load initial game state
game_state = load_game_state()

# Schemas
class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    user: dict
    token: str

class UpdateRequest(BaseModel):
    delta: int
    counter: Optional[str] = None  # For admin: 'a' or 'z', optional for A/Z users

class GameResponse(BaseModel):
    state: GameState
    notification: Optional[str] = None
    timestamp: str

# JWT Token Functions
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return username
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_current_user(authorization: Optional[str] = None):
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No authorization header"
        )
    
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise ValueError("Invalid scheme")
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header"
        )
    
    username = verify_token(token)
    if username not in USERS:
        raise HTTPException(status_code=401, detail="User not found")
    
    return {
        "id": username,
        "role": USERS[username]["role"]
    }

# Routes
@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

@api_router.post("/auth/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """User login endpoint"""
    user = USERS.get(request.username)
    if not user or user["password"] != request.password:
        logger.warning(f"Failed login attempt for user: {request.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": request.username},
        expires_delta=access_token_expires
    )
    
    logger.info(f"User {request.username} logged in")
    return {
        "user": {
            "id": request.username,
            "role": user["role"]
        },
        "token": access_token
    }

@api_router.get("/auth/me")
async def get_me(authorization: str = Header(None)):
    user = get_current_user(authorization)
    return user

@api_router.get("/game/state", response_model=GameState)
async def get_game_state(authorization: str = Header(None)):
    user = get_current_user(authorization)
    return game_state

@api_router.post("/game/update", response_model=GameResponse)
async def update_game(request: UpdateRequest, authorization: str = Header(None)):
    """Update counter based on user role"""
    global game_state
    
    user = get_current_user(authorization)
    
    # Validate delta
    if request.delta == 0:
        raise HTTPException(status_code=400, detail="Delta cannot be zero")
    
    # Determine which counter to update based on user role
    if user["role"] not in ["A", "Z", "admin"]:
        raise HTTPException(status_code=403, detail="Invalid role")
    
    notification = None
    old_state_a = game_state.counter_a
    old_state_z = game_state.counter_z
    
    try:
        if user["role"] == "A":
            # User A can only modify counter A
            new_value = game_state.counter_a + request.delta
            new_value = max(0, min(new_value, game_state.max_value))
            game_state.counter_a = new_value
            
            if new_value == 0 and old_state_a > 0:
                game_state.game_over = True
                notification = "🎮 User A is done! Game Over!"
            else:
                notification = f"👤 User A changed counter to {new_value}"
                
        elif user["role"] == "Z":
            # User Z can only modify counter Z
            new_value = game_state.counter_z + request.delta
            new_value = max(0, min(new_value, game_state.max_value))
            game_state.counter_z = new_value
            
            if new_value == 0 and old_state_z > 0:
                game_state.game_over = True
                notification = "🎮 User Z is done! Game Over!"
            else:
                notification = f"👤 User Z changed counter to {new_value}"
                
        elif user["role"] == "admin":
            # Admin can modify both counters - use 'counter' parameter or last action hint
            # If counter parameter provided, use it; otherwise determine by increment/decrement pattern
            counter_to_update = request.counter.lower() if request.counter else "a"
            
            if counter_to_update == "z":
                # Update counter Z
                new_value = game_state.counter_z + request.delta
                new_value = max(0, min(new_value, game_state.max_value))
                game_state.counter_z = new_value
                notification = f"🔧 Admin updated counter Z to {new_value}"
            else:
                # Default to counter A
                new_value = game_state.counter_a + request.delta
                new_value = max(0, min(new_value, game_state.max_value))
                game_state.counter_a = new_value
                notification = f"🔧 Admin updated counter A to {new_value}"
        
        # Update timestamp and save to file
        game_state.last_updated = datetime.utcnow().isoformat()
        game_state.last_updated_by = user["id"]
        save_game_state(game_state)
        
        logger.info(f"Game updated by {user['id']}: delta={request.delta}, A={game_state.counter_a}, Z={game_state.counter_z}")
        
    except Exception as e:
        logger.error(f"Error updating game: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")
    
    return GameResponse(
        state=game_state,
        notification=notification,
        timestamp=datetime.utcnow().isoformat()
    )

@api_router.post("/game/reset", response_model=GameState)
async def reset_game(authorization: str = Header(None)):
    """Reset game state (admin only)"""
    global game_state
    
    user = get_current_user(authorization)
    
    if user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin can reset the game"
        )
    
    game_state = GameState(
        counter_a=100,
        counter_z=100,
        max_value=100,
        game_over=False,
        last_updated=datetime.utcnow().isoformat(),
        last_updated_by=user["id"]
    )
    
    # Save to file
    save_game_state(game_state)
    logger.info(f"Game reset by admin {user['id']}")
    return game_state

# Include API router BEFORE mounting static files
app.include_router(api_router)

# Mount frontend static files (must be last)
frontend_dist_path = Path(__file__).parent.parent / "frontend" / "dist"
if frontend_dist_path.exists():
    app.mount("/", StaticFiles(directory=str(frontend_dist_path), html=True), name="frontend")
    logger.info(f"Frontend mounted from {frontend_dist_path}")
else:
    logger.warning(f"Frontend dist folder not found at {frontend_dist_path}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )
