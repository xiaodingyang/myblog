const CACHE_NAME = 'blog-v1';
const SHELL_URLS = ['/', '/articles', '/favicon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(SHELL_URLS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
  )));
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const { request } = e;

  // Skip non-GET
  if (request.method !== 'GET') return;

  // API requests: Network First
  if (request.url.includes('/api/')) {
    e.respondWith(fetch(request).then(res => {
      const clone = res.clone();
      caches.open(CACHE_NAME).then(c => c.put(request, clone));
      return res;
    }).catch(() => caches.match(request)));
    return;
  }

  // Static resources: Cache First
  e.respondWith(caches.match(request).then(cached => {
    if (cached) return cached;
    return fetch(request).then(res => {
      if (res.ok) {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(request, clone));
      }
      return res;
    });
  }));
});
