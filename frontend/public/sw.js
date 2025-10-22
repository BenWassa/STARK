// Keep the cache name aligned with the app version. Update when publishing.
const CACHE_NAME = 'stark-fitness-v1.5.0';
const STATIC_CACHE_URLS = [
  './',
  './manifest.json',
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
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .catch((error) => {
        console.error('Service Worker: Cache installation failed:', error);
      })
  );
  // Do NOT auto-activate. Allow the page to prompt the user first.
  // The waiting worker can be activated on demand by posting { type: 'SKIP_WAITING' }.
  // self.skipWaiting();
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

// Listen for messages from the client to trigger skipWaiting when the user accepts the update
self.addEventListener('message', (event) => {
  if (!event.data) return;
  if (event.data.type === 'SKIP_WAITING') {
    console.log('Service Worker: Received SKIP_WAITING message, calling skipWaiting()');
    self.skipWaiting();
  }
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // Only handle GET requests for http/https schemes
  if (event.request.method !== 'GET' || 
      !event.request.url.startsWith('http://') && 
      !event.request.url.startsWith('https://')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise, fetch from network
        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response.ok) {
              return response;
            }

            // Clone the response for caching
            const responseClone = response.clone();

            // Cache successful responses for future use
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseClone);
              });

            return response;
          })
          .catch((error) => {
            console.log('Service Worker: Fetch failed, returning offline fallback');
            // Return a basic offline page or error
            return new Response('Offline - Content not available', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});