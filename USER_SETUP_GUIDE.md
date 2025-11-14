# User-Friendly Setup Guide

## For Users (Non-Technical)

### First Time Setup

1. **Open the app** on your phone/tablet
2. **You'll see a setup screen** - Don't worry, this is automatic! 👍
3. **The app will search** for the Raspberry Pi (takes a few seconds)
4. **If it finds it**, great! It shows "Connected!" and moves forward
5. **If not found**, enter the details:
   - **Server Hostname:** `raspberrypi.local` (just leave as is)
   - **Port:** `8000` (just leave as is)
   - Click **Connect**

### Add to Home Screen (Bookmark)

**On iPhone/iPad:**

1. Open the app URL in Safari
2. Tap the **Share** button (arrow pointing up)
3. Tap **Add to Home Screen**
4. Tap **Add**

**On Android:**

1. Open the app URL in Chrome
2. Tap the **Menu** button (three dots)
3. Tap **Install app** or **Add to Home Screen**
4. Tap **Install**

**On Desktop:**

- Just bookmark it normally (Ctrl+D or Cmd+D)

### That's It! ✅

After first setup, the app will:

- ✅ Remember the server location
- ✅ Work even if WiFi disconnects and reconnects
- ✅ Work even if Raspberry Pi gets a new IP address
- ✅ Load instantly from home screen

### Troubleshooting

**"Could not find server"**

- Make sure Raspberry Pi is powered on
- Make sure it's running the app (ask admin)
- Make sure your phone/tablet is on the **same WiFi** as the Pi
- Try entering the details manually:
  - Hostname: `raspberrypi.local`
  - Port: `8000`

**"Connection refused"**

- The Raspberry Pi might be restarting
- Wait 30 seconds and try again

**Still doesn't work?**

- Ask the person who set up the Raspberry Pi for help

---

## For Admin/Setup Person

### What's New?

Users no longer need to:

- ❌ Know the IP address
- ❌ Manually type server details
- ❌ Change anything if WiFi IP changes

### How It Works

1. **First visit:** Setup page auto-detects server or asks for hostname
2. **After setup:** Server location saved to browser (never changes)
3. **WiFi reset:** `.local` hostname works across IP changes
4. **Bookmarked:** Users just tap icon, app works

### User Experience Flow

```
First Visit (New User)
    ↓
Setup Page Appears
    ↓
Auto-detect or manual entry
    ↓
Server details saved to browser
    ↓
User can now bookmark/add to home screen
    ↓
Future visits always work automatically!
```

### IP Change Scenario

```
WiFi resets, Pi gets new IP:
  Old IP: 192.168.1.100
  New IP: 192.168.1.105

User bookmarked: raspberrypi.local:8000
    ↓
.local hostname resolves to new IP (192.168.1.105)
    ↓
App works perfectly! No user action needed.
```

### Testing

Test with multiple devices:

```bash
# On each device:
1. Open app in browser: http://raspberrypi.local:8000
2. Setup page appears
3. Auto-detects server (or you enter hostname)
4. Can login and use app
5. Add to home screen
6. Close and reopen from home screen - works!
```

### If Auto-Detect Fails

Users see the manual entry form. They should enter:

- **Hostname:** `raspberrypi.local` (most important!)
- **Port:** `8000`

The `.local` hostname works across IP changes, so this setup survives WiFi resets.

---

## Technical Details

### Storage Location

Server settings saved in browser's `localStorage`:

```
Key: "apiBase"
Value: "http://raspberrypi.local:8000"
```

This persists even after:

- Browser closes/reopens
- Device restarts
- WiFi changes

### Auto-Detection Logic

On first load, tries to connect to:

1. `http://localhost:8000` (development/same device)
2. `http://raspberrypi.local:8000` (production/network)

If found, saves and proceeds. If not, shows manual entry form.

### Manual Entry

If neither works, user can enter custom hostname or IP:

- `raspberrypi.local` (recommended)
- `raspberrypi` (hostname only, port auto-added)
- `192.168.1.100` (IP address)

---

## FAQ

**Q: What if I want to change the server?**
A: Users can clear browser cache or open dev tools and clear localStorage. Or ask admin to reset their device.

**Q: Does this work offline?**
A: No, the app needs network access to the Raspberry Pi. But app will remember the server even after offline periods.

**Q: What about security?**
A: Server location is not sensitive info (it's just a hostname on local network). Real security is the password login.

**Q: Can users share their bookmark?**
A: Yes! If they're on the same network, bookmark works for everyone (as long as they have login credentials).

---

## Sharing with Users

Tell them:

> "Open the app once, it'll ask for server details (we'll help if needed). Then add it to your home screen. After that, just tap the icon - it always works, even if our WiFi acts weird!"
