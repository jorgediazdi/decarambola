/**
 * DeCarambola — Service Worker mínimo
 * Permite "Añadir a la pantalla de inicio" (PWA).
 * No implementa caché offline completo; se puede ampliar después.
 */
const CACHE_NAME = 'decarambola-v5';

self.addEventListener('install', function (event) {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE_NAME; }).map(function (k) { return caches.delete(k); })
      );
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  // Red por defecto; opcional: cachear index.html y assets clave para uso offline
  // event.respondWith(fetch(event.request).catch(...));
});
