# Counter Tracker

A real-time, role-based score tracking system deployable on a **Raspberry Pi** — accessible from any device on your local network, or anywhere in the world with a one-command tunnel.

Built with a **Python FastAPI backend** and a **React + TypeScript PWA frontend**. The backend serves the frontend as static files on a single port, supports optional HTTPS via self-signed certificates, and persists state to disk across restarts. No database required.

---

## Why this exists

Most web app tutorials assume a cloud server. This project takes the opposite approach: deploy everything on a $35 Raspberry Pi sitting on your desk, make it accessible to mobile devices over WiFi without anyone typing an IP address, and optionally expose it to the internet without port forwarding.

The architecture — Python REST API + JWT auth + React SPA + PWA + edge deployment — mirrors the stack used to deploy real-time AI inference endpoints at the edge. If you've ever wondered how ML models get served on embedded hardware, this project covers the same patterns.

---

## What it does

Two players (A and Z) each control their own counter. The server enforces who can write to which counter — role permissions are checked on every request, not just on login. An admin can control both counters and reset the game.

| Role | Can do |
|------|--------|
| A | Increment / decrement Counter A |
| Z | Increment / decrement Counter Z |
| Admin | Control both counters, reset game |

State is persisted to `game_state.json` on every update so the scores survive a server restart.

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.8+, FastAPI, Uvicorn, PyJWT, Pydantic |
| Frontend | React 18, TypeScript, Vite, Axios |
| Auth | JWT (HS256), role-based access control |
| PWA | Service Worker, Web App Manifest, offline caching |
| Deployment | Raspberry Pi, systemd, mDNS (`.local` hostname) |
| Security | TLS auto-detection — HTTPS if certs present, HTTP otherwise |

---

## Quick start (local development)

**Prerequisites:** Python 3.8+, Node.js 18+

```bash
git clone https://github.com/yourusername/counter-tracker.git
cd counter-tracker
```

**Backend:**

```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # edit .env and change the passwords
python3 main.py
```

**Frontend** (separate terminal):

```bash
cd frontend
npm install
npm run dev
```

Or run both at once from the project root:

```bash
npm install && npm run dev
```

Open [http://localhost:5173](http://localhost:5173). API docs at [http://localhost:8000/docs](http://localhost:8000/docs).

---

## Demo credentials

> These are development defaults. Change them in `.env` before any real deployment.

| Role | Username | Password |
|------|----------|----------|
| User A | `A` | `password` |
| User Z | `Z` | `password` |
| Admin | `admin` | `password` |

---

## Deploying to Raspberry Pi (local network)

Every device on the same WiFi can reach the app at `http://raspberrypi.local:8000` — no IP addresses, no configuration on the client side. Works on iPhone, Android, and desktop out of the box.

**On the Pi:**

```bash
# Install dependencies
sudo apt update && sudo apt install -y python3-venv nodejs npm

# Clone or copy the project
git clone https://github.com/yourusername/counter-tracker.git
cd counter-tracker

# Backend setup
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
nano .env   # set your passwords and a strong SECRET_KEY

# Build and serve frontend
cd ../frontend
npm install && npm run build

# Start
cd ..
./start.sh
```

Access from any device on the network:

```
http://raspberrypi.local:8000
```

The `.local` hostname is resolved via mDNS (Bonjour / Avahi). It keeps working even when the Pi's IP address changes after a router restart.

**Auto-start on boot:**

```bash
sudo cp counter-app.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable counter-tracker
sudo systemctl start counter-tracker
```

The service restarts automatically on failure. Logs go to journald:

```bash
sudo journalctl -u counter-tracker -f
```

---

## HTTPS (optional but recommended for PWA features)

The server auto-detects TLS certificates at startup. If `cert.pem` and `key.pem` are present in the backend directory, it starts on HTTPS. Otherwise it falls back to HTTP.

Generate a self-signed certificate:

```bash
cd backend
openssl req -x509 -newkey rsa:4096 -nodes \
  -out cert.pem -keyout key.pem \
  -days 365 -subj "/CN=raspberrypi.local"
```

Restart the server. It will log `Starting server with HTTPS (SSL/TLS)`.

> Self-signed certs work for local network use. Browsers will show a warning on first visit — tap "Advanced → Proceed" once. After that, the certificate is accepted for the session.

Some PWA features (push notifications, service worker in certain browsers) require HTTPS. For local network deployment, a self-signed cert is the simplest way to enable them.

---

## Global access (expose your Pi to the internet)

You don't need port forwarding or a static IP. Pick one:

### Option 1 — Cloudflare Tunnel (recommended, free)

Creates a permanent public HTTPS URL routed to your Pi. No inbound firewall rules needed.

```bash
# On the Pi
curl -L --output cloudflared https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64
chmod +x cloudflared
./cloudflared tunnel --url http://localhost:8000
```

You'll get a URL like `https://random-name.trycloudflare.com`. Share it with anyone.

For a permanent domain, set up a named tunnel via the Cloudflare dashboard.

### Option 2 — Tailscale (VPN mesh, best for private access)

```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up
```

All your Tailscale devices can reach the Pi at its Tailscale IP regardless of what network they're on. No public exposure.

### Option 3 — ngrok (easiest for quick demos)

```bash
ngrok http 8000
```

---

## How the app works

### Server auto-discovery

On first launch, the frontend automatically scans for the backend:

1. `https://localhost:8000` (local dev with SSL)
2. `http://localhost:8000` (local dev without SSL)
3. `https://raspberrypi.local:8000` (Pi with SSL)
4. `http://raspberrypi.local:8000` (Pi without SSL)

The found URL is saved to `localStorage`. Users never enter a server address manually.

### Authentication

Login returns a signed JWT (HS256, 30-minute expiry). The role is embedded in the token payload. Every subsequent request sends the token as `Authorization: Bearer <token>`.

Role enforcement happens server-side on every write request — not just at the route level, but inside the handler, so a User A token can never update Counter Z regardless of what the client sends.

### State persistence

Game state is a Pydantic model (`GameState`) held in memory and written to `game_state.json` after every update. On startup, the file is loaded if it exists. This gives you persistence without a database dependency — important on constrained hardware like a Pi.

### Single-port production serving

In production, the FastAPI app mounts the built React app (`frontend/dist/`) as static files on the same port 8000. One port, one process, no reverse proxy needed for basic deployments.

---

## API reference

All endpoints are prefixed with `/api`.

```
GET   /api/health          Health check (no auth required)

POST  /api/auth/login      Login → returns JWT
      Body: { username, password }

GET   /api/auth/me         Get current user info
      Header: Authorization: Bearer <token>

GET   /api/game/state      Get current counter values
      Header: Authorization: Bearer <token>

POST  /api/game/update     Update a counter
      Header: Authorization: Bearer <token>
      Body: { delta: number, counter?: "a" | "z" }
      Note: counter field only used by admin role

POST  /api/game/reset      Reset to initial state (admin only)
      Header: Authorization: Bearer <token>
```

Interactive API docs: `http://localhost:8000/docs`

---

## Project structure

```
counter-tracker/
├── backend/
│   ├── main.py            # FastAPI app — auth, RBAC, game logic, static serving
│   ├── requirements.txt
│   └── .env.example       # Configuration template
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Setup.tsx       # Auto-discovers backend URL on first launch
│   │   │   ├── Login.tsx       # JWT authentication
│   │   │   └── Main.tsx        # Game interface, polls /game/state
│   │   ├── components/
│   │   │   └── Counter.tsx     # Counter display and controls
│   │   └── App.tsx             # App state machine: setup → login → game
│   ├── public/
│   │   └── sw.js          # Service Worker for offline caching
│   ├── vite.config.ts
│   └── index.html
├── counter-app.service    # systemd unit — auto-start and auto-restart on Pi
├── network-info.sh        # Prints all network access URLs
├── start.sh               # One-command startup for Pi
└── package.json           # Root: runs frontend + backend in parallel (dev)
```

---

## Installing as a mobile app

The app is a PWA — it installs to the home screen and runs in standalone mode (no browser chrome).

**iPhone / iPad (Safari only):**
1. Open the app URL in Safari
2. Share → Add to Home Screen → Add

**Android (Chrome):**
1. Open in Chrome
2. Three-dot menu → Install app

Once installed, the app loads from the service worker cache even when offline (counter updates still require a connection to the server).

See [IOS_PWA.md](IOS_PWA.md) for configuration details.

---

## Known limitations and next steps

The current implementation is intentionally minimal — suited for a Raspberry Pi with limited RAM and no database.

| Limitation | Next step |
|---|---|
| Game state resets if `game_state.json` is deleted | SQLite via SQLAlchemy |
| Counters update only on manual refresh or polling | WebSocket (`/ws/game`) |
| Push notifications are client-side only | Server-sent events or Firebase Cloud Messaging |
| Passwords stored in plaintext in `.env` | bcrypt hashing |
| Single global state (one game at a time) | Multi-room support with room IDs |

---

## Related documentation

- [RASPBERRY_PI_SETUP.md](RASPBERRY_PI_SETUP.md) — Full Pi setup walkthrough
- [ARCHITECTURE.md](ARCHITECTURE.md) — System design and technical decisions
- [IOS_PWA.md](IOS_PWA.md) — PWA configuration and iOS specifics
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) — Common issues
- [COMMANDS.md](COMMANDS.md) — Quick reference for deployment commands

---

## License

MIT
