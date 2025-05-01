const CACHE_VERSION = 'v4';
const CACHE_NAME = `city-neuro-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline.html';
const INSTALL_CACHE = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/src/main.jsx',
  '/styles.css',
  '/images/logo-192.png',
  '/images/logo-512.png',
  OFFLINE_URL
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(INSTALL_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', (event) => {
  const { request } = event;
  

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(networkResponse => {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          return networkResponse;
        })
        .catch(() => caches.match(request).then(cached => cached || caches.match(OFFLINE_URL)))
    );
    return;
  }


  event.respondWith(
    caches.match(request).then(cached => {
      return cached || fetch(request).then(networkResponse => {
        const clone = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        return networkResponse;
      }).catch(() => {
        if (request.headers.get('Accept').includes('text/html')) {
          return caches.match(OFFLINE_URL);
        }
      });
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

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