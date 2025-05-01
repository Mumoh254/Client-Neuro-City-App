const CACHE_VERSION = 'v3';
const CACHE_NAME = `community-hub-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline.html';
const BASE_URL = 'https://neuro-apps-api-express-js-production-redy.onrender.com/apiV1/smartcity-ke';

const INSTALL_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/images/logo.png',
  '/src/main.jsx',
  '/images/nairobi.png',
  '/styles.css',
  '/offline.html',
];

self.addEventListener('fetch', (event) => {
  if (!event.request.url.startsWith('http') || 
      event.request.url.includes('chrome-extension://')) {
    return;
  }

  const { request } = event;

  // Network-first for navigation
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(networkResponse => {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(request, clone))
            .catch(err => console.warn('Cache put error:', err));
          return networkResponse;
        })
        .catch(() => {
          return caches.match(request)
            .then(cached => cached || caches.match(OFFLINE_URL));
        })
    );
    return;
  }

  // API handling
  if (request.url.includes('/apiV1/')) {
    event.respondWith(
        fetch(request)
          .then(response => {
            const clone = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(request, clone))
              .catch(err => console.warn('API cache error:', err));
            return response;
          })
          .catch(() => caches.match(request))
    );
    return;
  }


  // Cache-first for assets
  event.respondWith(
    caches.match(request).then(cached => {
      return cached || fetch(request).then(networkResponse => {
        const clone = networkResponse.clone();
        caches.open(CACHE_NAME)
          .then(cache => cache.put(request, clone))
          .catch(err => console.warn('Asset cache error:', err));
        return networkResponse;
      }).catch(() => caches.match(OFFLINE_URL));
    })
  );
});

// Rest of your event handlers remain the same...
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