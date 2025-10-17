const CACHE_NAME = 'stark-fitness-v1.2.1-dev';
// Core assets to precache for dev builds
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

self.addEventListener('install', (event) => {
  console.log('Dev Service Worker: Installing');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_CACHE_URLS).catch(() => Promise.all(STATIC_CACHE_URLS.map((u) => cache.add(u).catch(() => null)))))
      .catch((error) => console.error('Dev Service Worker: Cache installation failed:', error))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Dev Service Worker: Activating');
  event.waitUntil(
    caches.keys().then((cacheNames) => Promise.all(cacheNames.map((cacheName) => {
      if (cacheName !== CACHE_NAME) return caches.delete(cacheName);
      return null;
    })))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) return;
  const requestUrl = new URL(event.request.url);

  if (event.request.mode === 'navigate') {
    event.respondWith(caches.match('./dev.html').then((r) => r || caches.match('./index.html') || fetch(event.request)));
    return;
  }

  if (requestUrl.origin === self.location.origin && /\.(js|css|png|jpg|jpeg|svg|webp|json)$/.test(requestUrl.pathname)) {
    event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((res) => {
      if (res && res.ok) { const c = res.clone(); caches.open(CACHE_NAME).then((cache) => cache.put(event.request, c)); }
      return res;
    }).catch(() => new Response('Offline', { status: 503 }))));
    return;
  }

  event.respondWith(fetch(event.request).catch(() => caches.match(event.request).then((r) => r || new Response('Offline', { status: 503 }))));
});
