const CACHE_NAME = 'isustopra-v1';
const ASSETS = [
  '/ISUStoPRA/',
  '/ISUStoPRA/index.html',
  '/ISUStoPRA/styles.css',
  '/ISUStoPRA/main.js',
  '/ISUStoPRA/icons/icon-192.png',
  '/ISUStoPRA/icons/icon-512.png'
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('activate', e => {
  clients.claim();
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE_NAME ? caches.delete(k) : null))));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).catch(() => caches.match('/ISUStoPRA/index.html')));
    return;
  }
  e.respondWith(caches.match(req).then(r => r || fetch(req).then(res => {
    if (req.method === 'GET' && res && res.status === 200) {
      const copy = res.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
    }
    return res;
  })));
});
