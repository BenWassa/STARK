const CACHE_NAME = 'stark-fitness-v1.2.1';
// Core assets to precache. Keep this list small and relevant to ensure
// the UI can render immediately when offline or when network misses occur.
const STATIC_CACHE_URLS = [
  './',
  './index.html',
  './dev.html',
  './manifest.json',
  './version.json',
  './assets/main-v2L2Q-j9.css',
  './assets/main-D-lgwDAV.js',
  './assets/main-FvcIVgt3.js',
  './assets/stark_logo_rounded--re6EBGe.png',
  './assets/stark_personhealth-Wyu-yjmC.png',
  './icons/icon-192x192.svg',
  './icons/icon-512x512.svg'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        // Use addAll but guard with catch so one missing file doesn't fail the whole install
        return cache.addAll(STATIC_CACHE_URLS).catch((err) => {
          console.warn('Service Worker: One or more assets failed to cache during install', err);
          // Attempt to cache files individually to salvage what we can
          return Promise.all(STATIC_CACHE_URLS.map((url) => cache.add(url).catch(() => null)));
        });
      })
      .catch((error) => {
        console.error('Service Worker: Cache installation failed:', error);
      })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of all clients immediately
  self.clients.claim();
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // Only handle GET requests for http/https schemes
  if (event.request.method !== 'GET' || 
      !event.request.url.startsWith('http://') && 
      !event.request.url.startsWith('https://')) {
    return;
  }

  const requestUrl = new URL(event.request.url);

  // Navigation requests: return cached shell (index/dev) for SPA routing, fallback to network
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('./dev.html').then((resp) => resp || caches.match('./index.html'))
        .then((cachedShell) => {
          return cachedShell || fetch(event.request).then((networkResp) => {
            // Cache the fetched shell for future navigations
            if (networkResp && networkResp.ok) {
              const cloned = networkResp.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
            }
            return networkResp;
          });
        }).catch(() => new Response('Offline - app shell not available', { status: 503, headers: { 'Content-Type': 'text/plain' } }))
    );
    return;
  }

  // For same-origin requests for static assets (js/css/png/svg etc.) use cache-first then network with caching
  if (requestUrl.origin === self.location.origin && /\.(js|css|png|jpg|jpeg|svg|webp|json)$/.test(requestUrl.pathname)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(event.request).then((networkResponse) => {
          if (!networkResponse || !networkResponse.ok) return networkResponse;
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return networkResponse;
        }).catch(() => {
          // If request is for an image, return a tiny SVG placeholder
          if (/\.(png|jpg|jpeg|svg|webp)$/.test(requestUrl.pathname)) {
            return new Response('<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><rect width="100%" height="100%" fill="#1f2937"/></svg>', { headers: { 'Content-Type': 'image/svg+xml' } });
          }
          return new Response('Offline - content not cached', { status: 503, headers: { 'Content-Type': 'text/plain' } });
        });
      })
    );
    return;
  }

  // Other cross-origin or API requests: network-first but don't cache
  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request).then((r) => r || new Response('Offline', { status: 503 })))
  );
});