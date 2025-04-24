const CACHE_NAME = "community-hub-v2";
const OFFLINE_URL = "/offline.html";
const INSTALL_CACHE = [
  '/',
        '/index.html',
        '/manifest.json',
        '/logo192.png',
        '/src/main.jsx'
];


self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(INSTALL_CACHE))
      .then(() => console.log("[SW] Core assets cached"))
      .catch(error => console.error("[SW] Error during installation", error))
  );
});


self.addEventListener("fetch", (event) => {
  const request = event.request;


  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => caches.match('/index.html')) 
    );
    return;
  }


  event.respondWith(
    caches.match(request)
      .then(cached => {
        if (cached) {
          return cached;  
        }
   
        return fetch(request)
          .then(networkResponse => {
       
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(request, responseClone))
              .catch(error => console.error("[SW] Error caching response", error));
            return networkResponse;
          })
          .catch(() => caches.match(OFFLINE_URL)); 
      })
  );
});


self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log(`[SW] Deleting outdated cache: ${key}`);
            return caches.delete(key); 
          }
        })
      )
    ).then(() => self.clients.claim())
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
