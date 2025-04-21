const CACHE_NAME = "community-hub-v1";
const OFFLINE_URL = "offline.html";

const ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/logo192.png',
  '/manifest.json',
  '/static/js/main.chunk.js',
  '/static/js/0.chunk.js',
  '/static/js/bundle.js',
  '/peoples/favourites',
  '/reviews',
  '/amenities'
];

// Install event 
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Caching all assets");
      return cache.addAll(ASSETS);
    })
  );
});

// network falling back to cache
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request).then((response) => {
        return response || caches.match(OFFLINE_URL);
      });
    })
  );
});

// Activate event - clear old caches
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cache) => {
          if (!cacheWhitelist.includes(cache)) {
            console.log(`[Service Worker] Deleting old cache: ${cache}`);
            return caches.delete(cache);
          }
        })
      )
    )
  );
});

// Push event - show notifications
self.addEventListener("push", (event) => {
  const data = event.data?.json() || {};
  self.registration.showNotification(data.title || "Notification", {
    body: data.body || "You have a new message.",
    icon: '/logo.png'
  });
});


self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request).then((response) => {
        if (response) return response;

        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        return caches.match(OFFLINE_URL);
      });
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('https://yourdomain.com/jobs')
  );
});