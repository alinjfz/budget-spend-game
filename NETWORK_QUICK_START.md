# Quick Network Deployment Guide

Get your Counter Tracker app running on any device in minutes!

## 🚀 Quick Start (5 minutes)

### 1. Copy Project to Raspberry Pi

On your Mac:

```bash
scp -r ~/Desktop/Codes/ghahrApp pi@raspberrypi.local:/home/pi/
```

Or via USB stick if WiFi isn't available yet.

### 2. SSH into Raspberry Pi

```bash
ssh pi@raspberrypi.local
# Default password: raspberry
```

### 3. Install Backend & Frontend

```bash
cd ~/ghahrApp/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 4. Set Credentials (Important!)

Edit the `.env` file with YOUR passwords:

```bash
nano .env
```

Example `.env`:

```properties
SECRET_KEY=your-super-secret-key-here

USER_A_PASSWORD=my-password-for-user-a
USER_Z_PASSWORD=my-password-for-user-z
ADMIN_PASSWORD=my-admin-password

SERVER_HOST=0.0.0.0
SERVER_PORT=8000
```

### 5. Build Frontend

```bash
cd ~/ghahrApp/frontend
npm install
npm run build
```

### 6. Start App

```bash
cd ~/ghahrApp
./start.sh
```

You'll see:

```
🎉 Application Ready!

📱 Access from your network:
  http://192.168.1.100:8000
  http://raspberrypi.local:8000
```

## 📱 Access from Any Device

**On your phone/laptop, open:**

- `http://raspberrypi.local:8000` ← Recommended (works if WiFi changes!)
- `http://192.168.1.100:8000` ← If .local doesn't work

**Login with your credentials:**

```
User A: password-you-set
User Z: password-you-set
Admin: admin-password-you-set
```

## 🔄 Handling WiFi IP Changes

The great news: **Use the `.local` hostname instead of IP!**

```
http://raspberrypi.local:8000
```

This works even if:

- WiFi disconnects and reconnects
- Router restarts and assigns new IP
- You move to a different WiFi network (on same local network)

## 📊 Check App Status

From another device on the network:

```bash
# Check if app is running
curl http://raspberrypi.local:8000/health

# Should return: {"status": "healthy", "timestamp": "2024-11-13T..."}
```

## ✅ Verify Everything Works

1. **Frontend loads?**

   - Open `http://raspberrypi.local:8000` in browser
   - Should see login page

2. **Can login?**

   - Enter credentials
   - Should redirect to counter page

3. **Can edit counters?**

   - A user: can only edit counter A
   - Z user: can only edit counter Z
   - Admin: can edit both

4. **Data persists?**
   - Make changes
   - Stop server: `Ctrl+C`
   - Start again: `./start.sh`
   - Check data is still there

## 🛠 Auto-Start on Boot (Optional)

Run once to auto-start app on Raspberry Pi boot:

```bash
sudo cp ~/ghahrApp/counter-app.service /etc/systemd/system/
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

## 🧹 Useful Commands

**Stop app:**

```bash
# If running in terminal
Ctrl+C

# If running as service
sudo systemctl stop counter-app.service
```

**See network info:**

```bash
./network-info.sh
```

**View game state file:**

```bash
cat ~/ghahrApp/backend/game_state.json
```

**Clear game state (reset everything):**

```bash
rm ~/ghahrApp/backend/game_state.json
```

## ⚠️ Common Issues

### "Connection refused"

- App not running? → `./start.sh`
- Check if backend started: `ps aux | grep python`

### "Can't find raspberrypi.local"

- Try IP instead: Check with `hostname -I` on Pi
- Make sure both devices on same WiFi

### "Port already in use"

- Change `SERVER_PORT` in `.env` to `8001`
- Restart app

### "Login fails with correct password"

- Check `.env` has correct password
- Restart app after changing `.env`

## 📖 Full Documentation

See these files for detailed info:

- `RASPBERRY_PI_SETUP.md` - Comprehensive setup guide
- `DEPLOYMENT.md` - Production deployment tips
- `TROUBLESHOOTING.md` - Advanced troubleshooting

## 🎉 You're Done!

Your app is now accessible from any device on your local network. Passwords are secure in `.env` and never exposed in code!

## Next Steps

- [ ] Verify app works from multiple devices
- [ ] Set up auto-start if desired
- [ ] Share network info with other users
- [ ] Customize passwords in `.env`
- [ ] Bookmark `http://raspberrypi.local:8000` on each device
