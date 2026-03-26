# Troubleshooting

## Backend

**Port 8000 already in use**
```bash
lsof -i :8000
kill -9 <PID>
```

**`ModuleNotFoundError`**
```bash
# Make sure the virtual environment is active
source backend/venv/bin/activate
pip install -r backend/requirements.txt
```

**`Cannot find SECRET_KEY`**
```bash
# .env file must exist in the backend directory
cp backend/.env.example backend/.env
nano backend/.env
```

**401 Unauthorized on API calls**

Token expired (30-minute lifetime) or not being sent. Log out and log back in. In DevTools → Network, verify the `Authorization: Bearer <token>` header is present on requests.

**CORS errors in browser console**

The frontend dev server (port 5173) proxies API calls through Vite to port 8000. Make sure the backend is running. Check `vite.config.ts` proxy config if you changed ports.

## Frontend

**`npm: command not found`**

Install Node.js 18+ from [nodejs.org](https://nodejs.org).

**Blank page or module errors**

```bash
rm -rf frontend/node_modules
npm install --prefix frontend
```

**Service Worker not registering**

Service Workers require HTTPS in production. In development (`localhost`) HTTP is fine. If it still fails, unregister from DevTools → Application → Service Workers and reload.

## Authentication

**Wrong username or password**

Default dev credentials: `A / password`, `Z / password`, `admin / password`. If you changed them in `.env`, use those instead. Note: username is case-sensitive (`A`, not `a`).

**User can't modify a counter**

Permissions are enforced server-side by role. User A can only modify `counter_a`, User Z can only modify `counter_z`. Admin can modify both.

## Mobile / iOS

**"Add to Home Screen" not available**

Must use Safari on iOS (Chrome on iOS doesn't expose the share sheet for PWA installation). Confirm the app has the correct meta tags in `index.html`.

**Notch / safe area not handled**

The viewport meta tag includes `viewport-fit=cover`. If content is getting clipped, check that `env(safe-area-inset-*)` is applied in your CSS.

## Raspberry Pi / Network

**Can't reach `raspberrypi.local`**

Both devices must be on the same WiFi network. Try the IP directly:
```bash
# On the Pi
hostname -I
```

mDNS (`.local`) may not work on older Android devices or some corporate networks. Use the IP in those cases.

**Game state resets after restart**

`game_state.json` is written to the backend directory on every update. Check that the process has write permission:
```bash
ls -la ~/counter-tracker/backend/game_state.json
```

**App crashes and doesn't restart**

If using the systemd service, it will restart automatically on failure (`Restart=on-failure`). Check logs:
```bash
sudo journalctl -u counter-tracker --since "10 minutes ago"
```
