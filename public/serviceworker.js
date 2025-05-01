const CACHE_VERSION = 'v3';
const CACHE_NAME = `community-hub-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline.html';
const BASE_URL = 'https://neuro-apps-api-express-js-production-redy.onrender.com/apiV1/smartcity-ke';

// URLs to cache during installation (add content hashes in production)
const INSTALL_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/images/logo.png',
  '/src/main.jsx',
  '/images/nairobi.png',
  '/styles.css',
  '/offline.html',
  // Add hashed assets (e.g., '/main.a1b2c3.js') in production
];

// Install and cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(INSTALL_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Activate and clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => 
      Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log(`Clearing old cache: ${cache}`);
            return caches.delete(cache);
          }
        })
      )
    )
    .then(() => self.clients.claim())
    .catch((error) => console.error('Activation failed:', error))
  );
});

// Network-first for HTML, cache-first for assets
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Network-first for HTML pages
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME)
            .then((cache) => cache.put(request, responseClone));
          return networkResponse;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match(OFFLINE_URL)))
    );
    return;
  }

  // API requests
  if (request.url.includes('/apiV1/')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME)
            .then((cache) => cache.put(request, responseClone));
          return networkResponse;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Cache-first for static assets
  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request).then((networkResponse) => {
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME)
          .then((cache) => cache.put(request, responseClone));
        return networkResponse;
      });
      return cached || networkFetch.catch(() => caches.match(OFFLINE_URL));
    })
  );
});

// Push notifications (unchanged)
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'New Update', {
      body: data.body || 'Check out what\'s new!',
      icon: '/logo192.png',
      badge: '/badge.png',
      vibrate: [200, 100, 200],
      data: { url: data.url || '/' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data?.url || '/'));
});

// Background sync (unchanged)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-updates') {
    event.waitUntil(
      fetch(`${BASE_URL}/sync-data`)
        .then((response) => response.json())
        .then((data) => {
          caches.open(CACHE_NAME)
            .then((cache) => cache.put('/api/sync-data', new Response(JSON.stringify(data))));
        })
        .catch((error) => console.error('Sync failed:', error))
    );
  }
});