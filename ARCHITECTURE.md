# Architecture

## System overview

Counter Tracker is a single-server application. The Python FastAPI backend handles authentication, game logic, state persistence, and serves the compiled React frontend as static files — all on port 8000. No separate web server or reverse proxy is required.

```
Any device on the network
        │
        │  HTTP or HTTPS (auto-detected)
        ▼
FastAPI — port 8000
  ├── /api/*              REST endpoints (auth + game)
  └── /*                  React SPA (served from frontend/dist/)
```

### Why single-port?

On a Raspberry Pi with limited resources, running one process instead of two (backend + nginx) simplifies deployment and reduces memory use. FastAPI's `StaticFiles` mount handles the frontend with minimal overhead.

---

## Authentication

JWT-based, stateless. Implementation: `PyJWT`, algorithm `HS256`.

**Login flow:**
1. Client sends `POST /api/auth/login` with `{ username, password }`
2. Server looks up the user from the `USERS` dict (populated from `.env` on startup)
3. If credentials match, server signs a JWT containing `{ sub: username, exp: now + 30min }`
4. Client stores token in `localStorage` and sends it as `Authorization: Bearer <token>` on every request

**Token validation:**
Every protected endpoint calls `get_current_user(authorization)`, which:
- Splits the `Authorization` header into `scheme` + `token`
- Calls `jwt.decode()` — raises `ExpiredSignatureError` or `InvalidTokenError` on failure
- Returns `{ id, role }` extracted from the decoded payload

The role is read from the token payload on every request, not from a session store. This makes the system stateless and horizontally scalable (though not needed at Pi scale).

---

## Role-based access control

Roles: `A`, `Z`, `admin`.

RBAC is enforced inside the `POST /api/game/update` handler, not just at the route level:

```python
if user["role"] == "A":
    # Can only write to counter_a
    game_state.counter_a = clamp(new_value, 0, max_value)

elif user["role"] == "Z":
    # Can only write to counter_z
    game_state.counter_z = clamp(new_value, 0, max_value)

elif user["role"] == "admin":
    # Uses request.counter ("a" or "z") to determine target
```

A valid User A token physically cannot update `counter_z` — the server ignores any client-side attempt. This is the correct place to enforce permissions (in the handler), not on the client.

---

## State management

**In memory:** Game state is a Pydantic `GameState` model held as a module-level global. Python's GIL ensures single-writer safety under Uvicorn's default single-worker setup.

**On disk:** After every write, `save_game_state()` serializes the model to `game_state.json`. On startup, `load_game_state()` reads it back. This gives crash-safe persistence without a database.

```python
class GameState(BaseModel):
    counter_a: int
    counter_z: int
    max_value: int = 100
    game_over: bool = False
    last_updated: Optional[str] = None
    last_updated_by: Optional[str] = None
```

**Game-over condition:** When a counter reaches 0, `game_over` is set to `True` and a notification string is returned in the response. The frontend reads this field to show the end-of-game state.

**Limitation:** Multiple Uvicorn workers would split state across processes. For this use case (single Pi, small number of users), one worker is correct. A Redis or database backend would be needed for multi-worker deployments.

---

## TLS / HTTPS

At startup, `main.py` checks for `cert.pem` and `key.pem` in the backend directory:

```python
use_https = cert_path.exists() and key_path.exists()

if use_https:
    uvicorn.run(app, ssl_certfile=cert_path, ssl_keyfile=key_path, ...)
else:
    uvicorn.run(app, ...)  # HTTP fallback
```

This means HTTPS is opt-in: generate certs and the server automatically upgrades. The same code path handles both environments. The certificates are gitignored — each deployment generates its own.

---

## Frontend: server auto-discovery

On first launch (when `localStorage["apiBase"]` is empty), the `Setup` component probes a list of candidate URLs in order:

1. `https://localhost:8000` — local dev with SSL
2. `http://localhost:8000` — local dev without SSL
3. `https://raspberrypi.local:8000` — Pi with SSL
4. `http://raspberrypi.local:8000` — Pi without SSL

Each probe hits `/api/health`. The first successful response wins, and the base URL is saved to `localStorage`. From that point on, `axios.defaults.baseURL` is set at app startup and Setup is skipped.

This means users on different devices (laptop, iPhone) each auto-find the server once, then never think about it again.

---

## Frontend: app state machine

`App.tsx` manages three states:

```
  setupNeeded (no apiBase in localStorage)
       │
       ▼ server found
  loggedOut (no valid token)
       │
       ▼ login
  loggedIn → polling /game/state on interval
```

There is no React Router. Page transitions are controlled by React state (`setupComplete`, `user`). This keeps the bundle small and avoids client-side routing complexity for a three-page app.

---

## PWA and Service Worker

`public/sw.js` caches the app shell (HTML, CSS, JS) using a cache-first strategy. This enables:
- Offline UI load (cached resources served from browser cache)
- Faster repeat loads on slow networks (LAN or tunnel)
- "Add to Home Screen" on iOS Safari and Android Chrome

In production, the service worker is registered by `main.tsx`. It intercepts network requests and serves cached responses when offline.

**iOS caveat:** Push notifications from a server require HTTPS. Client-side notifications (triggered locally) work over HTTP.

---

## Deployment topology

### Local network (default)

```
WiFi router
  ├── Raspberry Pi  →  raspberrypi.local:8000  (mDNS)
  ├── iPhone A
  ├── Phone Z
  └── Laptop (admin)
```

mDNS (Bonjour on macOS/iOS, Avahi on Linux) resolves `raspberrypi.local` to the Pi's current IP. This survives IP changes from DHCP renewals.

### Global access (optional)

```
Internet
  └── Cloudflare Tunnel ─── Pi:8000
         (or Tailscale, ngrok)
```

No inbound firewall rule or static IP required. The Pi opens an outbound connection to the tunnel provider, which proxies external traffic in.

### systemd service

`counter-app.service` runs the backend as a non-root user with:
- `Restart=on-failure` — recovers from crashes without intervention
- `PrivateTmp=true` — isolated `/tmp`
- `NoNewPrivileges=true` — process cannot gain elevated privileges
- Output to journald for structured log querying

---

## Security notes

| Area | Current approach | Production hardening |
|------|-----------------|---------------------|
| Passwords | Plaintext in `.env` | Hash with bcrypt |
| JWT secret | Loaded from env | Rotate regularly |
| CORS | `allow_origins=["*"]` (dev) | Lock to specific origins |
| TLS | Self-signed cert | Use Let's Encrypt via Caddy or nginx |
| State isolation | Module-level global | Redis for multi-worker |
| Auth storage | `localStorage` | `httpOnly` cookie |
