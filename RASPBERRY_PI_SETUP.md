# Raspberry Pi Network Setup Guide

This guide will help you deploy the Counter Tracker app to a Raspberry Pi and access it from any device on your local network.

## Features

✅ Works on local network via changing IP  
✅ User credentials stored in environment variables (secure)  
✅ Automatic data persistence  
✅ Mobile-friendly design

## Prerequisites

- Raspberry Pi 4 or 5 (4GB+ RAM recommended)
- Raspberry Pi OS (Lite or Desktop)
- Python 3.8+
- Node.js 16+
- Git

## Installation Steps

### 1. Install Dependencies on Raspberry Pi

```bash
sudo apt update
sudo apt upgrade
sudo apt install python3 python3-pip python3-venv nodejs npm git
```

### 2. Clone/Transfer Project

```bash
cd ~
git clone <your-repo-url> ghahrApp
# OR transfer via SCP if not using git
cd ghahrApp
```

### 3. Setup Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Edit `backend/.env`:

```bash
nano backend/.env
```

Add/Update these variables:

```properties
SECRET_KEY=your-secret-key-here

# User Credentials
USER_A_PASSWORD=your-password-a
USER_Z_PASSWORD=your-password-z
ADMIN_PASSWORD=your-admin-password

# Server Configuration
SERVER_HOST=0.0.0.0
SERVER_PORT=8000
```

Save: `Ctrl+O`, Enter, `Ctrl+X`

### 5. Setup Frontend

```bash
cd frontend
npm install
```

### 6. Build Frontend for Production

```bash
npm run build
```

This creates a `dist` folder with optimized files.

### 7. Serve Built Frontend with Backend

Update `backend/main.py` to serve the built frontend (add at the top after imports):

```python
from fastapi.staticfiles import StaticFiles

# After app initialization, add:
app.mount("/", StaticFiles(directory="../frontend/dist", html=True), name="frontend")
```

## Running on Raspberry Pi

### Option A: Manual Run

```bash
cd ~/ghahrApp/backend
source venv/bin/activate
python3 main.py
```

Access at: `http://<raspberry-pi-ip>:8000`

Find your Raspberry Pi IP:

```bash
hostname -I
```

Example: `http://192.168.1.100:8000`

### Option B: Systemd Service (Recommended for Auto-start)

Create service file:

```bash
sudo nano /etc/systemd/system/counter-app.service
```

Paste this content:

```ini
[Unit]
Description=Counter Tracker API
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/ghahrApp/backend
Environment="PATH=/home/pi/ghahrApp/backend/venv/bin"
ExecStart=/home/pi/ghahrApp/backend/venv/bin/python3 main.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable counter-app.service
sudo systemctl start counter-app.service
```

Check status:

```bash
sudo systemctl status counter-app.service
```

View logs:

```bash
sudo journalctl -u counter-app.service -f
```

### Option C: Run in Background with `screen`

```bash
cd ~/ghahrApp/backend
source venv/bin/activate
screen -S counter -d -m python3 main.py
```

List sessions:

```bash
screen -ls
```

Reattach:

```bash
screen -r counter
```

Detach: Press `Ctrl+A`, then `D`

## Handling WiFi IP Changes

When your WiFi resets and the IP changes:

1. **Find the new IP:**

   ```bash
   hostname -I
   ```

2. **Access app at new IP:**
   ```
   http://<new-ip>:8000
   ```

**Alternative: Use hostname instead of IP**

Access via:

```
http://raspberrypi.local:8000
```

Or your custom hostname:

```
http://customname.local:8000
```

To change hostname:

```bash
sudo raspi-config
# System Options → Hostname
```

## Network Access from Other Devices

### Desktop/Laptop

```
http://192.168.1.100:8000
# Replace IP with your Raspberry Pi's IP
```

### Mobile/Tablet

1. Connect to same WiFi network
2. Open browser
3. Go to `http://<raspberry-pi-ip>:8000`
4. Login with credentials from `.env`

### Bookmarking

Create a shortcut with the `.local` hostname to avoid IP lookups:

```
http://raspberrypi.local:8000
```

## Troubleshooting

### Can't find Raspberry Pi on network

```bash
# On Raspberry Pi, find IP
hostname -I

# From another device, try ping
ping raspberrypi.local
# or
ping 192.168.1.100
```

### Port 8000 already in use

Change `SERVER_PORT` in `.env`:

```properties
SERVER_PORT=8001
```

Access at: `http://<pi-ip>:8001`

### "Connection refused" error

1. Check service status: `sudo systemctl status counter-app.service`
2. Check firewall: `sudo ufw status`
3. Allow port: `sudo ufw allow 8000`

### Users can't login

1. Verify credentials in `.env`
2. Check backend logs: `sudo journalctl -u counter-app.service -f`
3. Ensure `.env` is loaded: `cat backend/.env`

### Data not persisting

1. Check file permissions:

   ```bash
   ls -la ~/ghahrApp/backend/game_state.json
   ```

2. Ensure write permissions:
   ```bash
   chmod 666 ~/ghahrApp/backend/game_state.json
   ```

## Updating the App

```bash
cd ~/ghahrApp
git pull

# If backend changed
cd backend
pip install -r requirements.txt

# If frontend changed
cd ../frontend
npm install
npm run build

# Restart service
sudo systemctl restart counter-app.service
```

## Security Notes

- ✅ User passwords are now in `.env` (not in code)
- ✅ Never commit `.env` to git
- ⚠️ For production, use HTTPS (see below)
- ⚠️ Keep SECRET_KEY safe and unique

### Optional: Enable HTTPS for Remote Access

For accessing from outside your network, use ngrok or Cloudflare Tunnel:

```bash
# Install ngrok
# Create account at ngrok.com

# Expose app
ngrok http 8000

# Access from anywhere via ngrok URL
```

## Demo Credentials

After setup, login with credentials from your `.env`:

```
User A: username=A, password=<USER_A_PASSWORD>
User Z: username=Z, password=<USER_Z_PASSWORD>
Admin:  username=admin, password=<ADMIN_PASSWORD>
```

## Next Steps

- [ ] Install on Raspberry Pi
- [ ] Configure credentials in `.env`
- [ ] Start service
- [ ] Access from local network
- [ ] Test from multiple devices
- [ ] Set custom hostname (optional)
- [ ] Enable auto-start via systemd
