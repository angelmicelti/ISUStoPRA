const CACHE_NAME = 'isustopra-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Instalación: precache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activación: limpiar caches antiguos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => k !== CACHE_NAME ? caches.delete(k) : null))
    )
  );
  clients.claim();
});

// Fetch: cache-first con fallback a red
self.addEventListener('fetch', event => {
  const req = event.request;

  // Navegación (HTML): network-first con fallback offline
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Otros recursos: cache-first
  event.respondWith(
    caches.match(req).then(res => res || fetch(req).then(networkRes => {
      if (req.method === 'GET' && networkRes && networkRes.status === 200) {
        const copy = networkRes.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
      }
      return networkRes;
    }))
  );
});
