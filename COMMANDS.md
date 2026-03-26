# Command Reference

Quick copy-paste commands for Raspberry Pi deployment.

## Deployment

```bash
# Transfer project to Pi
scp -r /path/to/counter-tracker pi@raspberrypi.local:/home/pi/

# SSH into Pi
ssh pi@raspberrypi.local

# First-time setup
cd ~/counter-tracker/backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt

cd ~/counter-tracker/frontend
npm install && npm run build

# Start app
cd ~/counter-tracker
./start.sh
```

## Service management

```bash
# Install systemd service
sudo cp counter-app.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable counter-tracker
sudo systemctl start counter-tracker

# Common service commands
sudo systemctl status counter-tracker
sudo systemctl restart counter-tracker
sudo systemctl stop counter-tracker
sudo journalctl -u counter-tracker -f
```

## Networking

```bash
# Show Pi network info
./network-info.sh

# Check Pi is reachable
ping raspberrypi.local

# Health check from another device
curl http://raspberrypi.local:8000/health

# Find Pi's IP if .local doesn't work
ssh pi@raspberrypi.local "hostname -I"
```

## Debugging

```bash
# Check if backend is running
ps aux | grep python

# Kill process on port 8000
lsof -i :8000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# View live logs (manual run)
tail -f ~/counter-tracker/backend/backend.log

# View game state
cat ~/counter-tracker/backend/game_state.json | python3 -m json.tool
```

## Data management

```bash
# Backup game state
cp backend/game_state.json backend/game_state.json.bak

# Reset game data (or use the admin button in the UI)
rm backend/game_state.json
```

## Updating credentials

```bash
nano ~/counter-tracker/backend/.env
sudo systemctl restart counter-tracker
```
