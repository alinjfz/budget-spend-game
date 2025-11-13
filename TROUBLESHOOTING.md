# Troubleshooting Guide

## Common Issues & Solutions

### 🔴 Backend Issues

#### 1. "Port 8000 already in use"

```bash
# Find process using the port
lsof -i :8000

# Kill the process
kill -9 <PID>

# Or use different port
uvicorn main:app --port 8001
```

#### 2. "Module not found" (Python)

```bash
# Make sure venv is activated
source venv/bin/activate

# Reinstall requirements
pip install -r requirements.txt

# Check installed packages
pip list
```

#### 3. "ImportError: No module named 'fastapi'"

```bash
# Activate virtual environment first
source venv/bin/activate

# Then run the app
uvicorn main:app --reload
```

#### 4. "Cannot find SECRET_KEY"

```bash
# Create .env file in backend directory
cat > backend/.env << EOF
SECRET_KEY=your-secret-key-here
EOF
```

#### 5. JWT Token Errors

```
Error: Invalid token
Solution: Token may have expired (30 min timeout)
→ Login again to get new token

Error: Token expired
Solution: Logout and login again
```

#### 6. CORS Errors in Console

```
Error: Access to XMLHttpRequest blocked by CORS
Solution:
- Backend must be running
- Check vite.config.ts proxy settings
- Verify http://localhost:8000 is accessible
```

---

### 🟢 Frontend Issues

#### 1. "npm: command not found"

```bash
# Install Node.js from nodejs.org
# Or use homebrew
brew install node

# Verify installation
node --version
npm --version
```

#### 2. "Port 5173 already in use"

```bash
# Kill the process
lsof -i :5173
kill -9 <PID>

# Or use different port
npm run dev -- --port 3000
```

#### 3. "Module not found" errors

```bash
# Reinstall dependencies
rm -rf node_modules
npm install

# Clear npm cache if still failing
npm cache clean --force
npm install
```

#### 4. Service Worker not registering

```javascript
// Check console for errors
console.log(navigator.serviceWorker);

// For development, clear cache:
// DevTools → Application → Service Workers → Unregister
// DevTools → Application → Cache Storage → Delete all
```

#### 5. CSS not loading

```bash
# This is usually Vite development issue
# Restart dev server
npm run dev

# Or hard refresh browser
Cmd + Shift + R (Mac)
Ctrl + Shift + R (Windows/Linux)
```

#### 6. TypeScript errors

```bash
# These are normal during development
# They won't prevent the app from running

# To check for errors explicitly
npm run build

# Fix common issues
npm run type-check  # If available
```

---

### 🔵 Authentication Issues

#### 1. "Invalid username or password"

```
Check:
✓ Username is correct (A, Z, or admin)
✓ Password is correct (default: password)
✓ No extra spaces
✓ Case-sensitive (lowercase required)

Demo credentials:
- A / password
- Z / password
- admin / password
```

#### 2. "401 Unauthorized"

```
Causes:
1. Token expired (after 30 minutes)
2. Token removed from localStorage
3. Invalid token format

Solutions:
→ Logout and login again
→ Clear browser cache
→ Check localStorage in DevTools
```

#### 3. Cannot see other user's counter

```
Check:
✓ User is logged in
✓ Correct role for accessing that counter
- User A: Can see left (A) and right (Z) but can only modify A
- User Z: Can see both but can only modify Z
- Admin: Can modify both
```

---

### 📱 Mobile & iOS Issues

#### 1. App not responsive on mobile

```css
/* Make sure viewport meta tag is in index.html */
<meta name="viewport" content="width=device-width, initial-scale=1.0" />

/* Check that CSS is mobile-first */
@media (max-width: 768px) {
  /* Tablet */
}
@media (max-width: 480px) {
  /* Phone */
}
```

#### 2. Buttons too small on iOS

```css
/* Minimum size is 44x44 pixels */
.btn {
  min-width: 44px;
  min-height: 44px;
  padding: 12px;
}
```

#### 3. Cannot add to home screen

```
Check:
✓ Using Safari (not Chrome on iOS)
✓ App has manifest.json
✓ App has apple-mobile-web-app-capable meta tag
✓ Using HTTPS (in production)

Add to index.html if missing:
<meta name="apple-mobile-web-app-capable" content="true" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
```

#### 4. Service Worker not working

```javascript
// For iOS PWA (limited support):
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => console.log("SW registered"))
      .catch((err) => console.log("SW failed:", err));
  });
}
```

#### 5. Notch not handled on iPhone X+

```html
<!-- Add to index.html -->
<meta
  name="viewport"
  content="width=device-width, 
               initial-scale=1.0,
               viewport-fit=cover"
/>
```

```css
/* Add to CSS */
body {
  padding: max(0px, env(safe-area-inset-top)) max(
      0px,
      env(safe-area-inset-right)
    )
    max(0px, env(safe-area-inset-bottom)) max(0px, env(safe-area-inset-left));
}
```

---

### 💾 Data & Storage Issues

#### 1. Data not persisting

```javascript
// Check localStorage
console.log(localStorage.getItem("token"));

// Check if localStorage is enabled
if (!window.localStorage) {
  console.error("localStorage disabled");
}
```

#### 2. Game state resets

```
Note: Current implementation stores state in memory
When backend restarts, state resets to initial values

To fix: Add database persistence
- Use SQLite, PostgreSQL, or MongoDB
- Store game state in database
- Load on server startup
```

#### 3. Quota exceeded (storage full)

```javascript
// Check storage usage
try {
  localStorage.setItem("test", "test");
  localStorage.removeItem("test");
} catch (e) {
  console.error("Storage quota exceeded");
}

// Clear cache if needed
// DevTools → Application → Storage → Clear All
```

---

### 🔄 Sync & Network Issues

#### 1. Counter updates not syncing

```
Check:
✓ Both users are on the same network
✓ Backend is running
✓ Both frontends are connected to same backend
✓ Not in offline mode

Solution:
- Manually refresh page (F5)
- Check network tab in DevTools
- Verify API calls are succeeding
```

#### 2. Cannot reach backend

```bash
# Test connection
curl http://localhost:8000/health

# Get more details
curl -v http://localhost:8000/health

# If failing:
- Check backend is running
- Check port 8000 is correct
- Check firewall settings
- Try different port: --port 8001
```

#### 3. API requests slow

```
Solutions:
1. Check network tab (DevTools → Network)
2. Look for slow requests
3. Check backend console for errors
4. Restart backend if stuck
5. Clear browser cache
```

#### 4. WebSocket connection issues

```javascript
// In browser console
console.log(navigator.connection);

// Check network conditions
// DevTools → Network → Throttling
```

---

### 🎨 Visual Issues

#### 1. Colors not showing correctly

```bash
# Clear browser cache
# DevTools → Network → Disable cache (while open)
# Or: Cmd + Shift + R (hard refresh)

# Check CSS is loaded
# DevTools → Sources → Check for CSS files
```

#### 2. Layout broken

```css
/* Check if Flexbox/Grid supported */
/* Modern browsers all support it */

/* For older browsers, add fallbacks */
.container {
  display: -webkit-flex; /* Old Safari */
  display: flex;
}
```

#### 3. Text too large/small

```css
/* Check font size in CSS */
.counter-label {
  font-size: 3rem; /* Adjust as needed */
}

/* For responsive sizing */
@media (max-width: 480px) {
  .counter-label {
    font-size: 1.5rem;
  }
}
```

#### 4. Images not showing

```
Check:
✓ Image files exist in public/ folder
✓ Path is correct (relative to public/)
✓ Image format supported (PNG, JPG, SVG)
✓ File permissions correct

Example:
public/img/icon.png → /img/icon.png
```

---

### 🎬 Animation Issues

#### 1. Animation stuttering

```css
/* Optimize animations */
.btn {
  transition: all 0.2s; /* Not too long */
  /* Use transform instead of width/height */
  transform: translateY(-2px);
}
```

#### 2. Notifications not appearing

```javascript
// Check notification permissions
Notification.permission;
// Should be "granted"

// Request if needed
Notification.requestPermission();

// Check notifications are enabled
window.Notification?.requestPermission();
```

---

## Debug Mode

### Browser DevTools

1. **Console Tab**

   - View errors and logs
   - Run JavaScript commands
   - Check API responses

2. **Network Tab**

   - Monitor API calls
   - Check response times
   - Verify CORS headers

3. **Application Tab**

   - Check localStorage
   - Inspect cookies
   - View service workers
   - Check IndexedDB

4. **Sources Tab**
   - Debug JavaScript
   - Set breakpoints
   - Step through code

### Backend Logging

```python
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# In your routes
logger.debug("Debug message")
logger.info("Info message")
logger.warning("Warning message")
logger.error("Error message")
```

### Enable Verbose Output

```bash
# Backend
uvicorn main:app --reload --log-level debug

# Frontend
npm run dev -- --debug
```

---

## Getting Help

1. **Check Browser Console**

   - F12 or Cmd+Option+I
   - Look for red error messages

2. **Check Backend Logs**

   - Look at terminal running uvicorn
   - Watch for stack traces

3. **Check Network Tab**

   - DevTools → Network
   - Reload page (Cmd+R)
   - Check for failed requests (red)

4. **Check Documentation**

   - README.md
   - ARCHITECTURE.md
   - DEPLOYMENT.md

5. **Common Fixes**
   - Restart backend: Ctrl+C, then rerun
   - Restart frontend: Ctrl+C, then npm run dev
   - Clear cache: Cmd+Shift+R
   - Clear local storage: DevTools → Application

---

## Still Having Issues?

1. **Gather Information**

   - Error message (exact text)
   - Steps to reproduce
   - Operating system
   - Browser version
   - Terminal output

2. **Check Versions**

   ```bash
   node --version
   npm --version
   python3 --version
   ```

3. **Try Fresh Install**

   ```bash
   # Backend
   rm -rf backend/venv
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt

   # Frontend
   rm -rf frontend/node_modules
   npm install
   ```

4. **Check File Permissions**
   ```bash
   # If permission denied errors
   chmod +x /path/to/file
   ```

---

## Performance Tips

### For Better Performance

```bash
# Frontend
npm run build  # Creates optimized production build

# Backend
pip install gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
```

### Monitor Performance

```javascript
// Frontend
console.time("operation");
// ... code ...
console.timeEnd("operation");

// Check page load time
window.performance.timing;
```

---

**Still stuck?** Refer to the complete documentation in the project root!
