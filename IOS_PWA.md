# iOS PWA Installation & Configuration

## Making the App iOS-Ready

### 1. Update HTML Meta Tags

The following meta tags are already in `index.html`:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="apple-mobile-web-app-capable" content="true" />
<meta
  name="apple-mobile-web-app-status-bar-style"
  content="black-translucent"
/>
<meta name="apple-mobile-web-app-title" content="Counter Tracker" />
```

### 2. Service Worker

The app includes a service worker (`public/sw.js`) that:

- Caches app shell for offline access
- Handles push notifications
- Supports background sync
- Works with iOS 11.3+

### 3. iOS Installation Steps

1. **Open in Safari**

   - Open app URL in Safari browser
   - Can be on iOS device or use Simulator

2. **Add to Home Screen**

   - Tap the Share button (arrow pointing up)
   - Select "Add to Home Screen"
   - Enter app name: "Counter Tracker"
   - Tap "Add"

3. **App will appear as:**
   - Home screen icon
   - Standalone app (no browser UI)
   - Full-screen capability
   - Status bar at top

### 4. iOS-Specific Features

#### Safe Area Support

The CSS already includes viewport configurations for safe areas (notch support):

```css
viewport-fit=cover
```

#### Status Bar Colors

```html
<meta
  name="apple-mobile-web-app-status-bar-style"
  content="black-translucent"
/>
```

Options:

- `black-translucent` (recommended for this theme)
- `black`
- `default`

#### App Icon

Add to `index.html`:

```html
<link rel="apple-touch-icon" href="/img/icon-180x180.png" />
```

Create icon images:

- 180x180 pixels (iPhone)
- PNG format
- Rounded corners (iOS applies automatically)

### 5. Push Notifications

#### Request Permission

```javascript
if ("Notification" in window && "serviceWorker" in navigator) {
  Notification.requestPermission().then((permission) => {
    console.log("Notification permission:", permission);
  });
}
```

#### Send Notification

```javascript
navigator.serviceWorker.ready.then((registration) => {
  registration.showNotification("Counter Updated", {
    body: "User A changed counter",
    icon: "/img/icon-192x192.png",
    badge: "/img/badge-72x72.png",
    tag: "counter-notification",
  });
});
```

### 6. Offline Support

The service worker caches:

- Main app shell
- CSS files
- JavaScript bundles
- API responses (optional)

Users can:

- View cached pages offline
- See cached notifications
- Sync when online

### 7. Testing on iOS Simulator

```bash
# Run on iPhone Simulator
npm run dev

# In Safari on Simulator:
# 1. Open localhost:5173
# 2. Go to Develop menu > [Device] > Simulator
# 3. Test features
```

### 8. Web App Manifest

Create `frontend/public/manifest.json`:

```json
{
  "name": "Counter Tracker",
  "short_name": "Counters",
  "description": "Real-time counter tracking",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2293bf",
  "icons": [
    {
      "src": "/img/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/img/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

Add to `index.html`:

```html
<link rel="manifest" href="/manifest.json" />
```

### 9. iOS Limitations & Workarounds

| Limitation                        | Workaround                     |
| --------------------------------- | ------------------------------ |
| No background API calls           | Use service worker sync events |
| No push notifications from server | Use client-side notifications  |
| Limited local storage (5MB)       | Use IndexedDB for more space   |
| No window.alert on PWA            | Use custom modal               |
| No localStorage sync              | Implement manual sync          |

### 10. iOS User Experience Tips

✅ **Do:**

- Use full viewport width/height
- Implement pull-to-refresh
- Use system fonts
- Test on actual device
- Support offline scenarios
- Use native colors

❌ **Don't:**

- Assume background execution
- Use hover-only interactions
- Assume persistent storage
- Use custom fonts excessively
- Ignore safe area
- Require server connection

### 11. Debugging on iOS

#### Safari Developer Tools

1. Enable on iOS: Settings > Safari > Advanced > Web Inspector
2. On Mac: Safari > Develop > [Device]
3. Inspect console, network, storage

#### Console Logging

```javascript
console.log("Debug message");
window.addEventListener("error", (e) => console.error(e));
```

#### Storage Inspection

```javascript
// Check localStorage
console.log(localStorage);

// Check IndexedDB
indexedDB.databases().then((dbs) => console.log(dbs));
```

### 12. Performance Optimization for iOS

- Minimize bundle size
- Lazy load images
- Use CSS Grid/Flexbox
- Avoid heavy animations on scroll
- Use passive event listeners
- Optimize touch targets (44x44px minimum)

### 13. Deployment for iOS

```bash
# Build production
npm run build

# Test locally
npm run preview

# Deploy to hosting
# Ensure HTTPS is enabled
# All assets gzipped
# Proper cache headers
```

### 14. Testing Checklist

- [ ] App loads on iOS Safari
- [ ] Add to Home Screen works
- [ ] App opens full-screen
- [ ] Notch/safe area handled
- [ ] Status bar color correct
- [ ] All buttons are 44x44px minimum
- [ ] Orientation changes work
- [ ] Offline page loads
- [ ] Notifications display
- [ ] Network requests work
- [ ] Storage persists
- [ ] Performance acceptable

### Resources

- [Apple Developer - Web Apps](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html)
- [MDN - Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [PWA Checklist](https://www.pwachecklist.com)
