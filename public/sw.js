
const CACHE_PREFIX = 'warungflow-';
const CACHE_NAME = 'warungflow-v2';

const CORE_ASSETS = [
  '/',
  '/index.html'
];

const OPTIONAL_ASSETS = [
  '/warung-boim-logo.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-512-maskable.png',
  '/icons/apple-touch-icon.png'
];

// Install
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      await cache.addAll(CORE_ASSETS);

      // Ikon bersifat opsional untuk cache shell.
      await Promise.allSettled(
        OPTIONAL_ASSETS.map((url) => cache.add(url))
      );

      await self.skipWaiting();
    })()
  );
});

// Activate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();

      await Promise.all(
        keys
          .filter(
            (key) =>
              key.startsWith(CACHE_PREFIX) &&
              key !== CACHE_NAME
          )
          .map((key) => caches.delete(key))
      );

      await self.clients.claim();
    })()
  );
});

// Fetch
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (
    request.method !== 'GET' ||
    url.origin !== self.location.origin
  ) return;

  // Navigation: network first
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(async (response) => {
          if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put('/', response.clone());
          }

          return response;
        })
        .catch(async () => {
          return (
            await caches.match('/') ||
            await caches.match('/index.html') ||
            Response.error()
          );
        })
    );

    return;
  }

  // Static assets: cache first, then network update
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request).then(async (response) => {
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, response.clone());
        }

        return response;
      });

      return cached || network;
    })
  );
});
