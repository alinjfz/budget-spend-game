# Command Reference Card

Quick copy-paste commands for Raspberry Pi deployment.

## Initial Setup (Run Once)

```bash
# 1. Transfer project to Pi (from your Mac)
scp -r ~/Desktop/Codes/ghahrApp pi@raspberrypi.local:/home/pi/

# 2. SSH into Pi
ssh pi@raspberrypi.local

# 3. Install Python dependencies (on Pi)
cd ~/ghahrApp/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 4. Set your credentials (on Pi)
nano backend/.env
# Edit these variables:
# USER_A_PASSWORD=your-password-a
# USER_Z_PASSWORD=your-password-z
# ADMIN_PASSWORD=your-admin-password
# Save: Ctrl+O, Enter, Ctrl+X

# 5. Install and build frontend (on Pi)
cd ~/ghahrApp/frontend
npm install
npm run build
```

## Running the App

### Option 1: Quick Start (Easiest)

```bash
# On Pi
cd ~/ghahrApp
./start.sh

# Access from any device on network
# http://raspberrypi.local:8000
```

### Option 2: Auto-Start on Boot

```bash
# Install service (one time)
cd ~/ghahrApp
sudo cp counter-app.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable counter-app.service

# Start service
sudo systemctl start counter-app.service

# Check status
sudo systemctl status counter-app.service

# View logs
sudo journalctl -u counter-app.service -f

# Stop service
sudo systemctl stop counter-app.service
```

### Option 3: Manual/Development

```bash
# On Pi
cd ~/ghahrApp/backend
source venv/bin/activate
python3 main.py
```

## Accessing the App

### From Any Device (Mac, Windows, Linux, iOS, Android)

```
http://raspberrypi.local:8000
```

### Alternative (if .local doesn't work)

```bash
# Find Pi's IP
ssh pi@raspberrypi.local "hostname -I"

# Then use that IP
http://192.168.1.100:8000
```

## Testing & Debugging

```bash
# Check app is running
ps aux | grep python

# Health check from another device
curl http://raspberrypi.local:8000/health

# View backend logs (real-time)
tail -f ~/ghahrApp/backend/backend.log

# See current game state
cat ~/ghahrApp/backend/game_state.json

# View all recent logs
sudo journalctl -u counter-app.service -n 50

# Check Pi's IP address
hostname -I

# Check available ports
netstat -tuln | grep 8000
```

## Updating Credentials

```bash
# Edit credentials
nano ~/ghahrApp/backend/.env

# Restart to apply
sudo systemctl restart counter-app.service
# OR manually: stop old process and ./start.sh
```

## Network Management

```bash
# Show network info on Pi
cd ~/ghahrApp && ./network-info.sh

# Find Pi from another device
ping raspberrypi.local

# SSH from Mac
ssh pi@raspberrypi.local

# Copy file from Pi to Mac
scp pi@raspberrypi.local:/home/pi/ghahrApp/backend/game_state.json ~/Downloads/

# Copy file from Mac to Pi
scp ~/Desktop/file.txt pi@raspberrypi.local:/home/pi/ghahrApp/
```

## Data Management

```bash
# Backup game state
cp ~/ghahrApp/backend/game_state.json ~/ghahrApp/backend/game_state.json.backup

# Reset game data
rm ~/ghahrApp/backend/game_state.json
# Then restart app (or use admin reset button)

# View game state
cat ~/ghahrApp/backend/game_state.json | python3 -m json.tool

# Export game state
cp ~/ghahrApp/backend/game_state.json ~/game_data_backup_$(date +%Y%m%d_%H%M%S).json
```

## Troubleshooting

```bash
# Is backend running?
curl http://raspberrypi.local:8000/health

# Port in use?
lsof -i :8000

# Kill process on port 8000
lsof -i :8000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Check connectivity
ping raspberrypi.local
ping -c 5 192.168.1.100

# Backend errors?
grep ERROR ~/ghahrApp/backend/backend.log | tail -20

# View system logs
sudo journalctl -xe

# Check disk space
df -h

# Check RAM
free -h

# Restart all (nuclear option)
sudo reboot
```

## Environment File Templates

### backend/.env

```properties
SECRET_KEY=your-secret-key-change-this-in-production

# User Credentials - CHANGE THESE!
USER_A_PASSWORD=secure-password-for-user-a
USER_Z_PASSWORD=secure-password-for-user-z
ADMIN_PASSWORD=secure-password-for-admin

# Server Configuration
SERVER_HOST=0.0.0.0
SERVER_PORT=8000
```

## Quick Aliases (Add to ~/.bashrc on Pi)

```bash
# Add to ~/.bashrc on Pi:
alias counter-start="cd ~/ghahrApp && ./start.sh"
alias counter-stop="sudo systemctl stop counter-app.service"
alias counter-status="sudo systemctl status counter-app.service"
alias counter-logs="sudo journalctl -u counter-app.service -f"
alias counter-net="cd ~/ghahrApp && ./network-info.sh"
alias counter-state="cat ~/ghahrApp/backend/game_state.json"

# Then reload
source ~/.bashrc

# Use as:
# counter-start
# counter-status
# counter-logs
# etc.
```

## Common Errors & Fixes

| Error                          | Fix                                                                          |
| ------------------------------ | ---------------------------------------------------------------------------- |
| `Connection refused`           | App not running: `./start.sh`                                                |
| `Port 8000 in use`             | Kill it: `lsof -i :8000 \| grep LISTEN \| awk '{print $2}' \| xargs kill -9` |
| `Can't find raspberrypi.local` | Try IP instead: `hostname -I` on Pi                                          |
| `Login fails`                  | Check `.env` has correct passwords                                           |
| `WiFi disconnected`            | Use `.local` hostname (works after reconnect)                                |
| `Low memory`                   | Restart Pi: `sudo reboot`                                                    |
| `Slow response`                | Check disk: `df -h` (ensure >1GB free)                                       |

## One-Liner Commands

```bash
# Everything from Mac -> Pi in one shot
scp -r ~/Desktop/Codes/ghahrApp pi@raspberrypi.local:/home/pi/ && \
ssh pi@raspberrypi.local "cd ~/ghahrApp && ./start.sh"

# Update frontend and restart
cd ~/ghahrApp/frontend && npm run build && \
ssh pi@raspberrypi.local "sudo systemctl restart counter-app.service"

# Backup game state locally
scp pi@raspberrypi.local:/home/pi/ghahrApp/backend/game_state.json \
  ~/Desktop/backup_$(date +%Y%m%d_%H%M%S).json

# Check all three users can login
for user in A Z admin; do \
  echo "Testing $user..." && \
  curl -s -X POST http://raspberrypi.local:8000/auth/login \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"$user\",\"password\":\"password\"}" | python3 -m json.tool; \
done
```

---

**Need help?** Check the full guides:

- Quick start: `NETWORK_QUICK_START.md`
- Full setup: `RASPBERRY_PI_SETUP.md`
- Troubleshooting: `TROUBLESHOOTING.md`
