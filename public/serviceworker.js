const CACHE_NAME = "community-hub-v2";
const OFFLINE_URL = "/offline.html";
const INSTALL_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/static/js/main.js',
  '/logo192.png',
  '/logo512.png'
];

// Improved install event with core assets
self.addEventListener("install", (event) => {
  self.skipWaiting(); // Force activate new SW immediately
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(INSTALL_CACHE))
      .then(() => console.log("[SW] Core assets cached"))
  );
});

// Unified fetch handler with network-first strategy
self.addEventListener("fetch", (event) => {
  const request = event.request;
  
  // Network first for navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Cache-first for assets
  event.respondWith(
    caches.match(request)
      .then(cached => cached || fetch(request))
      .catch(() => {
        if (request.headers.get('Accept').includes('text/html')) {
          return caches.match(OFFLINE_URL);
        }
      })
  );
});

// Cleanup old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(
        keys.map(key => (key !== CACHE_NAME ? caches.delete(key) : null))
      )
    ).then(() => self.clients.claim()) // Take control immediately after cleanup
  );
});

// Push notifications
self.addEventListener("push", event => {
  const data = event.data?.json() || {};
  event.waitUntil(
    self.registration.showNotification(data.title || "New Update", {
      body: data.body || "Check out what's new!",
      icon: '/logo192.png',
      badge: '/badge.png',
      vibrate: [200, 100, 200]
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});



