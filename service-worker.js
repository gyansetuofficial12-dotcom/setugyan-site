
const CACHE_NAME = 'gyan-setu-cache-v1';
const PDF_CACHE = 'pdf-cache';
const PRECACHE_URLS = [
  '/', '/index.html',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(PRECACHE_URLS.map(u => new Request(u, {cache: 'reload'})));
    }).then(()=> self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function(event) {
  const request = event.request;

  if (request.url.endsWith('.pdf')) {
    event.respondWith(
      fetch(request).then(networkResponse => {
        caches.open(PDF_CACHE).then(cache => cache.put(request, networkResponse.clone()));
        return networkResponse.clone();
      }).catch(()=> caches.open(PDF_CACHE).then(cache=> cache.match(request)).then(r=> r || new Response('PDF not available offline', {status: 404})))
    );
    return;
  }

  if (request.mode === 'navigate' || (request.headers.get('accept') && request.headers.get('accept').includes('text/html'))) {
    event.respondWith(
      caches.match(request).then(response => {
        return response || fetch(request).then(fetchRes => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(request, fetchRes.clone());
            return fetchRes;
          });
        }).catch(()=> caches.match('/index.html'));
      })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(response => {
      return response || fetch(request).then(networkResponse => {
        return caches.open(CACHE_NAME).then(cache => {
          try { cache.put(request, networkResponse.clone()); } catch(e){}
          return networkResponse;
        });
      }).catch(()=>{});
    })
  );
});
