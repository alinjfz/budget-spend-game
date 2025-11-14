const CACHE_NAME = "counter-tracker-v1";
const API_CACHE = "counter-tracker-api-v1";
const urlsToCache = ["/", "/index.html", "/src/index.css"];

// Store the last notification state
let lastNotificationState = null;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  
  // Skip API calls - let them go through normally
  if (request.url.includes("/api/")) {
    // Cache API responses for offline support
    if (request.method === "GET") {
      event.respondWith(
        fetch(request)
          .then((response) => {
            if (response.ok) {
              const responseClone = response.clone();
              caches.open(API_CACHE).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return response;
          })
          .catch(() => {
            return caches.match(request);
          })
      );
    }
    return;
  }

  // Cache static assets with network-first strategy
  event.respondWith(
    caches
      .match(request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(request).then((response) => {
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
          return response;
        });
      })
      .catch(() => {
        // Return offline page if available
        return caches.match("/index.html");
      })
  );
});

// Handle background sync for notifications (works on Android PWA)
self.addEventListener("sync", (event) => {
  if (event.tag === "check-notifications") {
    event.waitUntil(checkNotifications());
  }
});

// Handle periodic background sync (works on Android PWA)
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "check-notifications") {
    event.waitUntil(checkNotifications());
  }
});

// Function to check for new notifications
async function checkNotifications() {
  try {
    const token = await getStoredToken();
    if (!token) return;

    const response = await fetch("/api/game/state", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      const gameState = await response.json();
      
      // Check if state changed
      if (lastNotificationState !== JSON.stringify(gameState)) {
        lastNotificationState = JSON.stringify(gameState);
        
        // Send notification to all clients
        const clients = await self.clients.matchAll();
        clients.forEach((client) => {
          client.postMessage({
            type: "STATE_UPDATE",
            payload: gameState,
          });
        });
      }
    }
  } catch (error) {
    console.error("Error checking notifications:", error);
  }
}

// Get stored token from clients
async function getStoredToken() {
  const clients = await self.clients.matchAll();
  return new Promise((resolve) => {
    if (clients.length > 0) {
      clients[0].postMessage({ type: "GET_TOKEN" });
      const handler = (event) => {
        if (event.data.type === "TOKEN_RESPONSE") {
          self.removeEventListener("message", handler);
          resolve(event.data.token);
        }
      };
      self.addEventListener("message", handler);
      setTimeout(() => resolve(null), 2000);
    } else {
      resolve(null);
    }
  });
}

// Handle messages from clients
self.addEventListener("message", (event) => {
  if (event.data.type === "CHECK_STATE") {
    checkNotifications().catch(console.error);
  } else if (event.data.type === "SHOW_NOTIFICATION") {
    // Show browser notification from client request
    const { title, options } = event.data;
    self.registration.showNotification(title, {
      ...options,
      requireInteraction: false,
    });
  }
});

self.addEventListener("push", (event) => {
  const options = {
    body: event.data ? event.data.text() : "Counter Updated",
    icon: "/favicon.svg",
    badge: "/favicon.svg",
    tag: "counter-notification",
    requireInteraction: false,
  };

  event.waitUntil(
    self.registration.showNotification("Counter Tracker", options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === "/" && "focus" in client) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow("/");
        }
      })
  );
});
