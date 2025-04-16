// service-worker.js
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst } from 'workbox-strategies';

// Precache assets
precacheAndRoute(self.__WB_MANIFEST);

// Cache API requests with a CacheFirst strategy
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'image-cache',
    plugins: [
      {
        cacheWillUpdate: async ({ response }) => {
          if (response && response.status === 404) {
            return null; // Don't cache 404 responses
          }
          return response;
        },
      },
    ],
  })
);
