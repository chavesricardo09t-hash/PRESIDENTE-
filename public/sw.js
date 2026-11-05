// Service Worker del Paso 0: red primero; si no hay red, usa la caché.
const NOMBRE_CACHE = 'presidente-v0.1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((claves) => Promise.all(claves.filter((c) => c !== NOMBRE_CACHE).map((c) => caches.delete(c))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (evento) => {
  const peticion = evento.request;
  if (peticion.method !== 'GET' || !peticion.url.startsWith(self.location.origin)) return;

  evento.respondWith(
    fetch(peticion)
      .then((respuesta) => {
        if (respuesta.ok) {
          const copia = respuesta.clone();
          caches
            .open(NOMBRE_CACHE)
            .then((cache) => cache.put(peticion, copia))
            .catch(() => {});
        }
        return respuesta;
      })
      .catch(() =>
        caches
          .match(peticion, { ignoreSearch: true })
          .then((guardada) => guardada || caches.match('./', { ignoreSearch: true })),
      ),
  );
});
