const CACHE_NAME = "community-hub-v2";
const OFFLINE_URL = "/offline.html";
const INSTALL_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/static/js/main.js',
  '/logo192.png',
  '/logo512.png',
];

// Install event - Cache the core assets
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(INSTALL_CACHE))
      .then(() => console.log("[SW] Core assets cached"))
      .catch(error => console.error("[SW] Error during installation", error))
  );
});

// Fetch event - Network-first for navigation requests, Cache-first for assets
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Network-first for navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => caches.match('/index.html')) // Fallback to index.html if network fails
    );
    return;
  }

  // Cache-first for other assets (e.g., images, JS, CSS)
  event.respondWith(
    caches.match(request)
      .then(cached => {
        if (cached) {
          return cached;  // Return cached response if exists
        }
        // Otherwise, fetch from network and cache the response
        return fetch(request)
          .then(networkResponse => {
            // Clone the response because the body can only be consumed once
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(request, responseClone))
              .catch(error => console.error("[SW] Error caching response", error));
            return networkResponse;
          })
          .catch(() => caches.match(OFFLINE_URL)); // Fallback to offline page if network fails
      })
  );
});

// Activate event - Clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log(`[SW] Deleting outdated cache: ${key}`);
            return caches.delete(key); // Delete old caches
          }
        })
      )
    ).then(() => self.clients.claim()) // Take control of the page immediately
      .catch(error => console.error("[SW] Error during activation", error))
  );
});

// Push notification handling
self.addEventListener("push", event => {
  const data = event.data?.json() || {};
  event.waitUntil(
    self.registration.showNotification(data.title || "New Update", {
      body: data.body || "Check out what's new!",
      icon: '/logo192.png',
      badge: '/badge.png',
      vibrate: [200, 100, 200],
      data: {
        url: data.url || '/'
      }
    })
  );
});

// Notification click event - Open the URL from the notification
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});
