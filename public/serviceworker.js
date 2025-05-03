const CACHE_VERSION = 'v3';
const CACHE_NAME = `city-neuro-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline.html';

const INSTALL_CACHE = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/styles.css',
  '/offline.html',
  '/images/logo-192.png',
  '/images/logo-512.png',
  // You should replace these with the actual built JS/CSS file paths from dist or public folder
  '/assets/index.js', // Example built file
  '/assets/index.css' // Example built CSS file
];

// Install: Cache core files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(INSTALL_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Activate: Clean up old caches and reload open clients
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
    }).then(() => {
      self.clients.claim();
      return self.clients.matchAll({ type: 'window' }).then(clients => {
        clients.forEach(client => client.navigate(client.url));
      });
    })
  );
});

// Fetch: Network-first for navigation, cache-first for assets
self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (!request.url.startsWith('http') || request.url.startsWith('chrome-extension://')) {
    return;
  }

  // Navigation requests (e.g., SPA routes)
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

  // Static assets (images, CSS, JS)
  event.respondWith(
    caches.match(request).then(cached => {
      return cached || fetch(request).then(networkResponse => {
        const clone = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        return networkResponse;
      }).catch(() => {
        if (request.headers.get('Accept')?.includes('text/html')) {
          return caches.match(OFFLINE_URL);
        }
      });
    })
  );
});

// Manual skip waiting
self.addEventListener('message', (event) => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Push notification handler
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'New Update', {
      body: data.body || 'Check out what\'s new!',
      icon: '/images/logo-192.png',
      badge: '/images/logo-192.png',
      vibrate: [200, 100, 200],
      data: { url: data.url || '/' },
    })
  );
});

// Click on push notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data?.url || '/'));
});
