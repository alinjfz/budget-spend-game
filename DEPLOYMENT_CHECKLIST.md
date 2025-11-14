# 🚀 Deployment Checklist

## What's Ready

✅ **Backend:**
- Loads credentials from .env (not hardcoded)
- Listens on 0.0.0.0:8000 (all network interfaces)
- Data persists to game_state.json
- FastAPI with JWT authentication

✅ **Frontend:**
- Auto-discovery setup page (finds server automatically)
- Stores server location in browser (never asks again)
- Works from home screen bookmark
- Survives WiFi IP changes
- Mobile responsive design

✅ **Documentation:**
- USER_SETUP_GUIDE.md - For non-technical users
- AUTO_DISCOVERY.md - Technical details
- USER_EXPERIENCE_FLOW.md - What users see
- COMMANDS.md - Copy-paste commands
- And 7+ other guides

✅ **Scripts:**
- start.sh - One-command startup
- network-info.sh - Show network info
- counter-app.service - Auto-start on boot

---

## Before First Deployment

### Backend Setup
- [ ] Copy project to Raspberry Pi
- [ ] Create virtual environment: `python3 -m venv venv`
- [ ] Install dependencies: `pip install -r requirements.txt`
- [ ] Edit `.env` with YOUR passwords:
  ```
  USER_A_PASSWORD=your-password-a
  USER_Z_PASSWORD=your-password-z
  ADMIN_PASSWORD=your-admin-password
  ```
- [ ] Test locally: `python3 main.py`

### Frontend Setup
- [ ] Navigate to frontend: `cd frontend`
- [ ] Install: `npm install`
- [ ] Build: `npm run build`
- [ ] Verify `dist` folder created with built files

### First Run
- [ ] Start backend: `cd backend && ./start.sh`
- [ ] Check health: `curl http://localhost:8000/health`
- [ ] Open browser: `http://raspberrypi.local:8000`
- [ ] See setup page: ✓ (auto-detecting server)
- [ ] Auto-detect succeeds: ✓
- [ ] Can login: ✓
- [ ] Can edit counters: ✓
- [ ] Stop and restart, data persists: ✓

---

## Testing Auto-Discovery

### Test 1: Auto-Detection on First Visit
- [ ] Fresh browser/private mode
- [ ] Open: http://raspberrypi.local:8000
- [ ] Setup page appears with spinner
- [ ] After 2-3 seconds: "Connected!" message
- [ ] Proceeds to login automatically
- [ ] No manual entry needed

### Test 2: Manual Entry (If auto-detect fails)
- [ ] Setup page shows error
- [ ] User enters: raspberrypi.local
- [ ] Enters port: 8000
- [ ] Clicks Connect
- [ ] Connects successfully
- [ ] Proceeds to login

### Test 3: Persistence After Browser Close
- [ ] Complete setup on first visit
- [ ] Close browser completely
- [ ] Reopen to same URL
- [ ] Setup page NOT shown
- [ ] Goes straight to login page
- [ ] Server location remembered ✓

### Test 4: Home Screen Works
- [ ] After setup, add to home screen
- [ ] Close browser completely
- [ ] Tap home screen icon
- [ ] App opens from bookmark
- [ ] Goes straight to login page
- [ ] No setup page shown

### Test 5: Multiple Devices
- [ ] Setup on phone
- [ ] Setup on tablet
- [ ] Setup on laptop
- [ ] All show setup page on first visit
- [ ] All proceed to login after setup
- [ ] Each device remembers server

### Test 6: WiFi IP Change
- [ ] Complete setup with .local hostname
- [ ] Note current IP: 192.168.1.100
- [ ] Restart WiFi router
- [ ] Wait for Pi to reconnect (might get new IP: 192.168.1.105)
- [ ] Reopen app from home screen
- [ ] App still works ✓ (used .local hostname!)
- [ ] .local resolved to new IP behind the scenes

### Test 7: All Three Users
- [ ] Login as User A
- [ ] A can edit counter A
- [ ] A cannot edit counter Z
- [ ] Logout
- [ ] Login as User Z
- [ ] Z can edit counter Z
- [ ] Z cannot edit counter A
- [ ] Logout
- [ ] Login as Admin
- [ ] Admin can edit both A and Z

---

## User Experience Testing

### Scenario 1: First-Time User (Non-Technical)
- [ ] Give URL: http://raspberrypi.local:8000
- [ ] User opens on phone
- [ ] Setup happens automatically
- [ ] User doesn't need to enter anything (usually)
- [ ] Proceeds to app smoothly
- [ ] User adds to home screen
- [ ] Explain: "Just tap this icon to use the app"

### Scenario 2: User on Different Device
- [ ] User opens URL on tablet
- [ ] Fresh setup happens
- [ ] Works perfectly
- [ ] Different device = different bookmark
- [ ] Each device has its own

### Scenario 3: User Offline
- [ ] Close connection to WiFi
- [ ] User taps home screen icon
- [ ] App opens (from cache)
- [ ] Can't reach server
- [ ] Shows error
- [ ] Reconnect WiFi
- [ ] Try again
- [ ] Works!

---

## Network Verification

### DNS/Network
- [ ] Test from one device:
  ```bash
  ping raspberrypi.local
  ```
- [ ] Should respond: `64 bytes from 192.168.1.x`
- [ ] Test multiple devices can resolve
- [ ] IP might be different but all resolve to same .local

### Server Accessibility
- [ ] From another device on network:
  ```bash
  curl http://raspberrypi.local:8000/health
  ```
- [ ] Should return: `{"status": "healthy", ...}`

### Firewall
- [ ] Port 8000 is open
- [ ] No firewall blocks traffic
- [ ] If using Pi firewall:
  ```bash
  sudo ufw allow 8000
  ```

---

## Auto-Start Setup (Optional)

- [ ] Copy service file:
  ```bash
  sudo cp counter-app.service /etc/systemd/system/
  ```
- [ ] Enable service:
  ```bash
  sudo systemctl enable counter-app.service
  ```
- [ ] Start service:
  ```bash
  sudo systemctl start counter-app.service
  ```
- [ ] Check status:
  ```bash
  sudo systemctl status counter-app.service
  ```
- [ ] View logs:
  ```bash
  sudo journalctl -u counter-app.service -f
  ```
- [ ] Reboot Pi and verify app starts automatically:
  ```bash
  sudo reboot
  # Wait 60 seconds
  curl http://raspberrypi.local:8000/health  # Should work
  ```

---

## Pre-Launch Checklist

### Security
- [ ] Changed default passwords in .env
- [ ] SECRET_KEY is unique (not example value)
- [ ] .env is git-ignored (never committed)
- [ ] No passwords in any .py files

### Performance
- [ ] App starts in under 5 seconds
- [ ] Login response under 1 second
- [ ] Counter updates instant
- [ ] No significant lag

### Data
- [ ] game_state.json created after first update
- [ ] Data persists after restart
- [ ] No data loss observed

### Documentation
- [ ] USER_SETUP_GUIDE.md is clear for non-tech users
- [ ] All users received setup instructions
- [ ] Support contact info provided to users

### Deployment
- [ ] All files on Raspberry Pi
- [ ] Dependencies installed (venv)
- [ ] Frontend built (dist/ folder)
- [ ] Service running (manual or systemd)

---

## Going Live

### Day Before
- [ ] Do full test of everything
- [ ] Verify all users can access from their devices
- [ ] Test WiFi restart scenario
- [ ] Make sure nobody has old bookmarks with IP addresses

### Launch Day
- [ ] Send setup instructions to all users
- [ ] Provide URL: http://raspberrypi.local:8000
- [ ] Tell them: "Open once to set up, then add to home screen"
- [ ] Be available first few hours for questions
- [ ] Monitor logs: `sudo journalctl -u counter-app.service -f`

### First Week
- [ ] Monitor for errors
- [ ] Help any users having issues
- [ ] Check if Raspberry Pi is staying stable
- [ ] Verify data persistence working
- [ ] Monitor Pi resource usage

---

## Rollback Plan

If something breaks:

```bash
# Stop service
sudo systemctl stop counter-app.service

# Or if running manually
Ctrl+C

# View error logs
sudo journalctl -u counter-app.service -n 50

# Restore from backup (if you have one)
cp game_state.json.backup game_state.json

# Restart
sudo systemctl start counter-app.service
```

---

## Post-Deployment Monitoring

### Weekly Checks
- [ ] App still responding: `curl http://raspberrypi.local:8000/health`
- [ ] Check logs for errors: `sudo journalctl -u counter-app.service`
- [ ] Disk usage: `df -h` (ensure >1GB free)
- [ ] Memory: `free -h`

### Monthly Checks
- [ ] Backup game_state.json:
  ```bash
  cp game_state.json game_state.json.backup_$(date +%Y%m%d)
  ```
- [ ] Test WiFi restart scenario
- [ ] Test access from multiple devices
- [ ] Review any user feedback

---

## Success Criteria

✅ **You'll know it's working when:**

1. **First-time user experience:**
   - User opens URL
   - Sees setup page
   - Auto-detects server (or manual entry works)
   - Proceeds to login
   - No confusion about IPs or tech stuff

2. **Home screen experience:**
   - User adds to home screen
   - Taps icon later
   - App works instantly
   - From any device
   - Even after WiFi restarts

3. **Support load:**
   - No more "why doesn't my bookmark work?" messages
   - No more "what's the IP address?" questions
   - Users just add to home screen and forget
   - App just works

---

## You're Ready! 🎉

Follow this checklist, and you'll have a production-ready app that non-technical users can actually use without frustration.

The auto-discovery + .local hostname combo is the key. It means:
- No IP confusion ✓
- Survives WiFi issues ✓
- Works from home screen ✓
- Just works! ✓

Good luck! 🚀
