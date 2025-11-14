# 🎯 What Users See (Step by Step)

## User Journey

### Scenario 1: First Time Opening App

```
┌─────────────────────────────────────────────────────────────┐
│ User taps link: http://raspberrypi.local:8000              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  ╔═══════════════════════════════════════════════════════╗  │
│  ║        Counter Tracker                               ║  │
│  ║        First time setup                              ║  │
│  ║                                                       ║  │
│  ║                    🔄 (spinning)                      ║  │
│  ║                                                       ║  │
│  ║        Searching for server...                       ║  │
│  ║        Make sure Raspberry Pi is running             ║  │
│  ╚═══════════════════════════════════════════════════════╝  │
└─────────────────────────────────────────────────────────────┘
          (Auto-detecting... 2-3 seconds)
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  ╔═══════════════════════════════════════════════════════╗  │
│  ║        ✅                                             ║  │
│  ║                                                       ║  │
│  ║        Connected!                                    ║  │
│  ║        Server found and configured                   ║  │
│  ║                                                       ║  │
│  ║        Loading app...                                ║  │
│  ╚═══════════════════════════════════════════════════════╝  │
└─────────────────────────────────────────────────────────────┘
          (Automatic, no user action)
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  ╔═══════════════════════════════════════════════════════╗  │
│  ║        Counter Tracker                               ║  │
│  ║                                                       ║  │
│  ║        Username: [    A         ]                    ║  │
│  ║        Password: [    ●●●●●●   ]                    ║  │
│  ║                                                       ║  │
│  ║                    [ Login ]                          ║  │
│  ║                                                       ║  │
│  ║        ☐ Remember me                                 ║  │
│  ╚═══════════════════════════════════════════════════════╝  │
└─────────────────────────────────────────────────────────────┘
                   (Login page appears)
```

### Scenario 2: User Adds to Home Screen

```
After successful login and usage:

User Menu → Share → Add to Home Screen

Later...

[Home Screen Icon]
   Counter Tracker
```

### Scenario 3: Reopening from Home Screen

```
User taps home screen icon
                ↓
App loads in browser
                ↓
App checks localStorage: "apiBase exists!"
                ↓
Skips setup page completely
                ↓
┌─────────────────────────────────────────────────────────────┐
│  ╔═══════════════════════════════════════════════════════╗  │
│  ║        Counter Tracker                               ║  │
│  ║                                                       ║  │
│  ║        Username: [ A              ]                  ║  │
│  ║        Password: [ ●●●●●●        ]                  ║  │
│  ║                                                       ║  │
│  ║                    [ Login ]                          ║  │
│  ║                                                       ║  │
│  ║        ☐ Remember me                                 ║  │
│  ╚═══════════════════════════════════════════════════════╝  │
└─────────────────────────────────────────────────────────────┘
          (Login page appears instantly!)

User enters password and... boom! They're in.
```

### Scenario 4: WiFi Restarts (IP Changes)

```
Before: Raspberry Pi IP = 192.168.1.100
After WiFi restart: Raspberry Pi IP = 192.168.1.105

User taps home screen icon (doesn't know about IP change)
                ↓
App loads
                ↓
Uses .local hostname: raspberrypi.local:8000
                ↓
.local resolves to new IP: 192.168.1.105
                ↓
┌─────────────────────────────────────────────────────────────┐
│  ╔═══════════════════════════════════════════════════════╗  │
│  ║        Counter Tracker                               ║  │
│  ║                                                       ║  │
│  ║        Username: [ A              ]                  ║  │
│  ║        Password: [ ●●●●●●        ]                  ║  │
│  ║                                                       ║  │
│  ║                    [ Login ]                          ║  │
│  ║                                                       ║  │
│  ║        ☐ Remember me                                 ║  │
│  ╚═══════════════════════════════════════════════════════╝  │
└─────────────────────────────────────────────────────────────┘

Works perfectly! User doesn't notice anything changed.
```

---

## If Auto-Detection Fails

```
First time opening app
                ↓
App tries to auto-detect (can't find server)
                ↓
┌─────────────────────────────────────────────────────────────┐
│  ╔═══════════════════════════════════════════════════════╗  │
│  ║        Counter Tracker                               ║  │
│  ║        First time setup                              ║  │
│  ║                                                       ║  │
│  ║        Enter Server Details                          ║  │
│  ║                                                       ║  │
│  ║        Server IP or Hostname                         ║  │
│  ║        [  raspberrypi.local       ]                  ║  │
│  ║        (e.g., raspberrypi or 192.168.1.100)         ║  │
│  ║                                                       ║  │
│  ║        Port                                          ║  │
│  ║        [  8000      ]                                ║  │
│  ║        (usually 8000)                                ║  │
│  ║                                                       ║  │
│  ║              [ Connect ]                             ║  │
│  ║                                                       ║  │
│  ║        ✓ Try Again                                   ║  │
│  ╚═══════════════════════════════════════════════════════╝  │
│                                                             │
│        Need help?                                          │
│        • Use hostname: raspberrypi.local:8000             │
│        • Make sure Raspberry Pi is running                │
│        • All devices on same WiFi network                 │
└─────────────────────────────────────────────────────────────┘

User just enters: raspberrypi.local (pre-filled!)
                ↓
Clicks Connect
                ↓
Works!
```

---

## Technical Flow (What Happens Behind Scenes)

```
User Device                          Raspberry Pi

Open App
    |
    └─→ Check localStorage
           Has apiBase? NO
           Show Setup page
                |
                ├─→ Try localhost
                |   Error (CORS)
                |
                ├─→ Try .local        ✓ responds
                |   http://raspberry
                |   pi.local:8000
                |   /health
                |
                |←──────── 200 OK ─────┤
                |
                └─→ Save to localStorage:
                    apiBase = "http://raspberrypi.local:8000"
                    |
                    └─→ Set axios.defaults.baseURL
                        |
                        └─→ Proceed to Login Page

                            User login with password
                            |
                            ├─→ POST /api/auth/login ─────→ ✓
                            |←───── JWT token ────────┤
                            |
                            └─→ Success! Main page loads
```

---

## Browser Storage Details

### localStorage After Setup

```javascript
{
  "token": "eyJhbGc...(JWT token)",
  "rememberMe": "true",
  "apiBase": "http://raspberrypi.local:8000"  ← THE MAGIC LINE
}
```

### How It Persists

```
1. User closes browser
   ✓ localStorage persists

2. Device restarts
   ✓ localStorage persists

3. WiFi disconnects/reconnects
   ✓ localStorage persists
   ✓ .local hostname finds new IP

4. User opens browser again
   ✓ Reads apiBase from localStorage
   ✓ App loads with saved server
```

---

## Mobile-Specific Experience

### iOS

```
1. Safari → Open app → First setup
2. Menu → Share → Add to Home Screen
3. Home screen icon appears
4. Tap it → App opens in full screen (looks like native app!)
```

### Android

```
1. Chrome → Open app → First setup
2. Menu (3 dots) → "Install app"
3. "Add to Home Screen"
4. Home screen icon appears
5. Tap it → App opens in full screen
```

### Desktop (Bookmark)

```
1. Open app in browser → First setup
2. Bookmark it (Ctrl+D or Cmd+D)
3. Bookmark appears in bookmarks bar
4. Click it anytime → Works instantly
```

---

## Error Scenarios (User Won't See These Usually!)

### Scenario: Pi Turned Off

```
User taps home screen icon
                ↓
App loads
                ↓
Tries to reach: http://raspberrypi.local:8000/health
                ↓
Connection refused (Pi not running)
                ↓
Login page shows anyway (from cache)
                ↓
User tries to login
                ↓
"Connection refused" error
                ↓
User: "Hey, the app isn't working"
Admin: "Oh, the Pi is off. Let me restart it"
                ↓
User tries again, works!
```

### Scenario: Different WiFi Network

```
User on home WiFi:
raspberrypi.local works! ✓

User on mobile hotspot:
"Could not find server"
(Pi not on this network)

User back on home WiFi:
Works again! ✓
```

---

## What Technically Happens (For Developers)

### First Load

```javascript
// App.tsx
const setupComplete = localStorage.getItem("apiBase") ? true : false;
// setupComplete = false (first time)

return <Setup onSetupComplete={handleSetupComplete} />;
```

### Setup Component

```javascript
// Setup.tsx
const detectServer = async () => {
  try {
    const response = await fetch("http://localhost:8000/health");
    localStorage.setItem("apiBase", "http://localhost:8000");
  } catch {
    try {
      const response = await fetch("http://raspberrypi.local:8000/health");
      localStorage.setItem("apiBase", "http://raspberrypi.local:8000");
    } catch {
      // Show manual entry form
    }
  }
};
```

### After Setup

```javascript
// App.tsx
useEffect(() => {
  const apiBase = localStorage.getItem("apiBase")
  if (apiBase) {
    axios.defaults.baseURL = apiBase  ← All API calls use this!
  }
}, [setupComplete])

// Now all API calls go to the saved server automatically
```

---

## Summary: What Users Experience

| Step              | What User Sees          | What Happens Behind          |
| ----------------- | ----------------------- | ---------------------------- |
| 1. First visit    | Setup page with spinner | Auto-detecting server        |
| 2. Auto-detect    | "Connected!" message    | Saving to localStorage       |
| 3. Login          | Normal login page       | Using saved server           |
| 4. After setup    | Add to home screen      | Creating bookmark            |
| 5. Tap icon later | App opens instantly     | Reading localStorage         |
| 6. WiFi restarts  | Everything still works  | .local hostname finds new IP |

---

**Result:** Non-technical users get a seamless experience. They click once, bookmark it, and it just works forever! 🎉
