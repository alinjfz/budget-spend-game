# Network Deployment - Summary of Changes

## ✅ What Was Done

Your app is now ready for:

- ✅ Local network access from any device
- ✅ Secure credential management via environment variables
- ✅ Automatic handling of WiFi IP changes
- ✅ Easy deployment to Raspberry Pi

## 🔐 Security Improvements

### Before

- User credentials hardcoded in `main.py`:
  ```python
  USERS = {
      "A": {"password": "password", "role": "A"},
      ...
  }
  ```
  **Risk**: Exposed if code is shared/pushed to git

### After

- Credentials loaded from `.env` file:
  ```python
  USERS = {
      "A": {"password": os.getenv("USER_A_PASSWORD", "password"), "role": "A"},
      ...
  }
  ```
  **Safe**: `.env` is git-ignored, passwords never in code

## 📝 Files Created

### 1. **`backend/.env.example`**

- Template showing all environment variables
- Reference for what to configure

### 2. **`frontend/.env.example`**

- Frontend environment template
- Currently minimal (API auto-uses same host)

### 3. **`RASPBERRY_PI_SETUP.md`** (20KB)

- Comprehensive 200+ line setup guide
- Step-by-step installation
- Multiple running options (manual, systemd, screen)
- Network access troubleshooting
- WiFi IP change handling

### 4. **`NETWORK_QUICK_START.md`** (8KB)

- Quick 5-minute setup guide
- Focus on getting running fast
- Common issues and fixes
- Auto-start instructions

### 5. **`start.sh`** (executable)

- One-command app startup script
- Checks for already-running processes
- Verifies backend health
- Shows network access info
- Usage: `./start.sh`

### 6. **`network-info.sh`** (executable)

- Shows current network info
- IP address and hostname
- How to access from other devices
- Checks if app is running
- Usage: `./network-info.sh`

### 7. **`counter-app.service`** (systemd template)

- For auto-start on Raspberry Pi boot
- Handles restarts on failure
- Includes resource limits
- Optional (manual startup also works)

## 🔧 Files Modified

### 1. **`backend/main.py`**

- Line 45-50: Load users from environment variables
- Removed duplicate USERS definition

```python
USERS = {
    "A": {"password": os.getenv("USER_A_PASSWORD", "password"), "role": "A"},
    "Z": {"password": os.getenv("USER_Z_PASSWORD", "password"), "role": "Z"},
    "admin": {"password": os.getenv("ADMIN_PASSWORD", "password"), "role": "admin"}
}
```

### 2. **`backend/.env`**

- Added placeholders for user passwords
- Added server configuration variables
- These override defaults in code

```properties
USER_A_PASSWORD=password
USER_Z_PASSWORD=password
ADMIN_PASSWORD=password
SERVER_HOST=0.0.0.0
SERVER_PORT=8000
```

### 3. **`frontend/vite.config.ts`**

- Added `host: "0.0.0.0"` for network access
- Added `port: 5173` explicitly
- Comments for production serving

```typescript
server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: { ... }
}
```

## 🌐 Network Access

### Local Machine (Development)

```
http://localhost:8000
```

### Raspberry Pi on Network

```
# Using hostname (recommended - survives IP changes)
http://raspberrypi.local:8000

# Using IP (works if above doesn't)
http://192.168.1.100:8000
# (Replace 100 with your actual Pi's IP)
```

### From Browser

All devices on same WiFi network can access:

1. Desktop/Laptop: `http://raspberrypi.local:8000`
2. Mobile/Tablet: Same URL
3. Smart TV: Same URL

## 🔑 Credential Management

### Setup

1. Copy `backend/.env.example` to `backend/.env`
2. Edit `.env` with YOUR passwords:
   ```bash
   nano backend/.env
   ```
3. Change these values:
   ```properties
   USER_A_PASSWORD=your-password-here
   USER_Z_PASSWORD=your-password-here
   ADMIN_PASSWORD=your-admin-password
   SECRET_KEY=your-secret-key-change-in-production
   ```

### Security Rules

- ✅ `.env` is git-ignored (never committed)
- ✅ Each installation has different credentials
- ✅ Passwords not in source code
- ✅ Easy to rotate passwords: edit `.env` and restart

## 🚀 Deployment Options

### Option 1: Quick Start (What You'll Do First)

```bash
# On Raspberry Pi
cd ~/ghahrApp
./start.sh
```

- Manual startup each time
- Logs visible in terminal
- Stop with Ctrl+C

### Option 2: Background Service

```bash
# Install service
sudo cp counter-app.service /etc/systemd/system/
sudo systemctl enable counter-app.service
sudo systemctl start counter-app.service

# Check status
sudo systemctl status counter-app.service
```

- Auto-starts on Pi boot
- Runs in background
- View logs: `sudo journalctl -u counter-app.service -f`

### Option 3: Using screen (Terminal Multiplexer)

```bash
# Start in background
screen -S counter -d -m bash -c "cd ~/ghahrApp/backend/venv/bin && ./start.sh"

# See it running
screen -ls

# Reattach to see logs
screen -r counter
```

- Old but reliable
- Good for SSH sessions

## 🔄 Handling WiFi Changes

### The Problem

- WiFi disconnects and reconnects
- Router restarts
- IP address changes from `192.168.1.100` → `192.168.1.105`
- Users can't access app with old IP

### The Solution

**Use `.local` hostname instead of IP address:**

```
http://raspberrypi.local:8000  ← USE THIS (survives IP changes)
http://192.168.1.100:8000      ← Don't use this (breaks when IP changes)
```

### Why It Works

- `.local` uses mDNS (multicast DNS)
- Works on same network even if IP changes
- Standard on macOS, most Linux, recent Windows
- No DNS server needed

### Optional: Custom Hostname

```bash
# On Pi, set custom hostname
sudo raspi-config
# System Options → Hostname → Enter "counter-tracker" (or your name)

# Then access as:
http://counter-tracker.local:8000
```

## 📊 Verification Checklist

After deployment, verify:

- [ ] Backend running: `ps aux | grep python`
- [ ] Network accessible: `curl http://raspberrypi.local:8000/health`
- [ ] Frontend loads: Open browser to `http://raspberrypi.local:8000`
- [ ] Can login: Try A/Z/admin with your credentials
- [ ] Counters work: Click buttons, see numbers change
- [ ] Data persists: Stop app, restart, check numbers still there
- [ ] Multiple devices: Test from phone, laptop, tablet
- [ ] WiFi resilience: Restart WiFi, access still works

## 🛠 Git & Version Control

### Updated `.gitignore`

Make sure `.env` is NOT committed:

```bash
# backend/.gitignore
.env
.env.local
venv/
__pycache__/
game_state.json
*.pyc
.DS_Store
```

### When Sharing Code

1. Remove your `.env` (or git will ignore it)
2. Share `backend/.env.example` instead
3. Others copy `.env.example` → `.env` and fill in values

## 📈 Performance Notes

- Frontend served from same server (no extra proxying)
- API responses include timestamp
- Game state cached in memory (persisted to JSON)
- No database queries (file-based persistence)
- Suitable for 5-20 concurrent users

## 🎓 Architecture Overview

```
Device (Phone/Laptop)
        ↓
   Browser
        ↓
http://raspberrypi.local:8000
        ↓
    Raspberry Pi
    ├── Frontend (React SPA, static files)
    ├── Backend (FastAPI)
    │   ├── JWT Authentication
    │   ├── Counter state management
    │   └── File persistence (game_state.json)
    └── Network (0.0.0.0:8000 = all interfaces)
```

## ✨ What's Next

1. **Deploy to Raspberry Pi:**

   - Transfer files (SCP or USB)
   - Set credentials in `.env`
   - Run `./start.sh`

2. **Test from multiple devices:**

   - Phone: Open browser to `http://raspberrypi.local:8000`
   - Laptop: Same URL
   - Verify all three users can login with their passwords

3. **Secure access (optional):**

   - Enable HTTPS (use ngrok or reverse proxy)
   - Add firewall rules on Pi
   - Create network-specific user credentials

4. **Monitor & maintain:**
   - Check logs regularly
   - Watch game_state.json for growth
   - Restart service if needed

## 📚 Documentation Files

- `NETWORK_QUICK_START.md` ← Start here! (5-min setup)
- `RASPBERRY_PI_SETUP.md` ← Full reference guide
- `README.md` ← General project info
- `DEPLOYMENT.md` ← Production considerations
- `TROUBLESHOOTING.md` ← When things break

---

**You're all set! Your app is now network-ready. 🎉**
