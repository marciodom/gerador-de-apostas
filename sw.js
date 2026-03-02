const CACHE_NAME = 'gerador-apostas-v1';

const urlsToCache = [
  '/gerador-de-apostas/',
  '/gerador-de-apostas/index.html',
  '/gerador-de-apostas/data.json',
  '/gerador-de-apostas/manifest.json',
  '/gerador-de-apostas/icons/icone-192.png',
  '/gerador-de-apostas/icons/icone-512.png'
];

// ===============================
// INSTALAÇÃO
// ===============================
self.addEventListener('install', event => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// ===============================
// ATIVAÇÃO
// ===============================
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// ===============================
// FETCH
// ===============================
self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);

  // Network First para data.json (sempre tenta atualizar)
  if (requestUrl.pathname.endsWith('data.json')) {
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache First para os demais recursos
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});