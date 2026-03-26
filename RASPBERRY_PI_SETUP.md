# Raspberry Pi Setup

Deploy Counter Tracker to a Raspberry Pi so any device on your local network can access it.

## Requirements

- Raspberry Pi 3B+ or newer (tested on Pi 4)
- Raspberry Pi OS (Lite works fine)
- Python 3.8+
- Node.js 16+

## 1. Transfer the project

From your development machine:

```bash
scp -r /path/to/counter-tracker pi@raspberrypi.local:/home/pi/
```

Or clone directly on the Pi if the repo is on GitHub:

```bash
ssh pi@raspberrypi.local
git clone https://github.com/yourusername/counter-tracker.git
cd counter-tracker
```

## 2. Install system dependencies

```bash
sudo apt update && sudo apt install -y python3-venv nodejs npm
```

## 3. Set up the backend

```bash
cd ~/counter-tracker/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Configure your environment:

```bash
cp .env.example .env
nano .env
```

Set at minimum:

```ini
SECRET_KEY=<generate with: python3 -c "import secrets; print(secrets.token_hex(32))">
USER_A_PASSWORD=your-password
USER_Z_PASSWORD=your-password
ADMIN_PASSWORD=your-admin-password
```

## 4. Build the frontend

```bash
cd ~/counter-tracker/frontend
npm install
npm run build
```

This creates `frontend/dist/`. The backend serves these files on the same port (8000).

## 5. Start the app

```bash
cd ~/counter-tracker
./start.sh
```

Open on any device on the same WiFi:

```
http://raspberrypi.local:8000
```

## Auto-start on boot (optional)

Install the systemd service so the app starts automatically after a reboot:

```bash
# Update the paths in counter-app.service if your username isn't 'pi'
sudo cp counter-app.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable counter-tracker
sudo systemctl start counter-tracker
```

Check status and logs:

```bash
sudo systemctl status counter-tracker
sudo journalctl -u counter-tracker -f
```

## Why `raspberrypi.local` instead of an IP

The Pi's IP address can change when the router restarts. The `.local` hostname uses mDNS (Bonjour on macOS/iOS, Avahi on Linux, built-in on Windows 10+) to always resolve to the current IP. Bookmarks using `.local` keep working across reboots and IP changes.

If `.local` doesn't resolve on a particular device, fall back to the IP:

```bash
# On the Pi
hostname -I
```

## Changing your hostname (optional)

```bash
sudo raspi-config
# System Options → Hostname → e.g. "counter-tracker"
```

Then access at `http://counter-tracker.local:8000`.

## Troubleshooting

**Port 8000 already in use**

```bash
lsof -i :8000
kill -9 <PID>
```

**Can't reach `raspberrypi.local`**

```bash
# From another device
ping raspberrypi.local
# If no response, use the IP from: hostname -I (on the Pi)
```

**Login fails after changing `.env`**

Restart the service after editing credentials:

```bash
sudo systemctl restart counter-tracker
# or: kill the process and run ./start.sh again
```

**Data not persisting**

Check that the backend process has write permission to `backend/game_state.json`. The file is created on the first counter update.
