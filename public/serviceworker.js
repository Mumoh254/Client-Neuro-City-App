const CACHE_NAME = "community-hub-v2";
const OFFLINE_URL = "/offline.html";
const BASE_URL = "https://neuro-apps-api-express-js-production-redy.onrender.com/apiV1/smartcity-ke";

// URLs to cache during the installation process
const INSTALL_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/images/logo.png',
  '/src/main.jsx',
  '/images/nairobi.png',
  '/styles.css',
  '/offline.html', // Ensure offline page is cached
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(INSTALL_CACHE))
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Handle API requests or dynamic content fetching
  if (request.url.includes('/apiV1/')) {
    // For requests to /jobs and /get-news endpoints
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME)
            .then((cache) => cache.put(request, responseClone));
          return networkResponse;
        })
        .catch(() => caches.match(request))  // Return cached response if offline
    );
  } else {
    // Handle assets (static files)
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request)
            .then((networkResponse) => {
              const responseClone = networkResponse.clone();
              if (request.url.startsWith('http')) {
                caches.open(CACHE_NAME)
                  .then((cache) => cache.put(request, responseClone));
              }
              return networkResponse;
            })
            .catch(() => caches.match(OFFLINE_URL));  // Fallback to offline page
        })
    );
  }
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      )
    )
    .then(() => self.clients.claim())
    .catch((error) => console.error('[SW] Error during activation', error))
  );
});

// Handle push notifications
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'New Update', {
      body: data.body || 'Check out what\'s new!',
      icon: '/logo192.png',
      badge: '/badge.png',
      vibrate: [200, 100, 200],
      data: {
        url: data.url || '/',
      },
    })
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});

// Handle background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-updates') {
    event.waitUntil(
      fetch(`${BASE_URL}/sync-data`)
        .then((response) => response.json())
        .then((data) => {
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put('/api/sync-data', new Response(JSON.stringify(data)));
            });
        })
        .catch((error) => console.error('[SW] Sync error:', error))
    );
  }
});
