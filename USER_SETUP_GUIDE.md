# User Setup Guide

This guide is for people using the app, not setting it up.

## First-time setup

1. Open the link your admin gave you (e.g. `http://raspberrypi.local:8000`) in your browser
2. You'll see a brief "Searching for server..." screen — this is normal and only happens once
3. Once connected, you'll be taken to the login page
4. Log in with the username and password your admin provided

The app remembers the server after the first connection, so you won't see the setup screen again.

## Add to home screen

**iPhone / iPad (Safari):**
1. Open the app URL in Safari
2. Tap the Share button (box with arrow pointing up)
3. Tap "Add to Home Screen"
4. Tap "Add"

**Android (Chrome):**
1. Open the app URL in Chrome
2. Tap the three-dot menu
3. Tap "Install app" or "Add to Home Screen"

After adding to your home screen, the app opens in full-screen without the browser UI — similar to a native app. It also works offline once cached.

## If the app stops working

- Make sure your device is on the same WiFi as the server
- The server (Raspberry Pi) might be off — ask your admin
- If you recently changed WiFi networks, the `.local` hostname should still work. If not, try opening the app in the browser first before using the home screen shortcut

## FAQ

**Do I need to enter the server address every time?**
No. It's saved in your browser after the first connection.

**Does it work offline?**
The UI loads from cache when offline, but you can't update counters without a connection to the server.

**I cleared my browser data and now it asks for setup again**
That's expected — clearing browser data removes the saved server address. Just go through the setup once more.
