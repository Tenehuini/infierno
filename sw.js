// Cache offline: el juego funciona sin conexión una vez abierto.
// Al publicar cambios, subir el número de CACHE para que los celulares bajen los archivos nuevos.
const CACHE = 'infierno-v1';
const FILES = [
  './', 'index.html', 'styles.css', 'app.js', 'cards.js', 'manifest.json',
  'assets/fondo.webp', 'assets/icon-192.png', 'assets/icon-512.png',
  'assets/cards/alma1.webp', 'assets/cards/alma2.webp', 'assets/cards/alma3.webp', 'assets/cards/alma4.webp', 'assets/cards/carta10.webp', 'assets/cards/carta11.webp', 'assets/cards/carta12.webp', 'assets/cards/carta1.webp', 'assets/cards/carta2.webp', 'assets/cards/carta3.webp', 'assets/cards/carta4.webp', 'assets/cards/carta5.webp', 'assets/cards/carta6.webp', 'assets/cards/carta7.webp', 'assets/cards/carta8.webp', 'assets/cards/carta9.webp', 'assets/cards/carta_dorso.webp', 'assets/cards/demonio1.webp', 'assets/cards/demonio2.webp', 'assets/cards/demonio3.webp', 'assets/cards/demonio4.webp', 'assets/cards/demonio5.webp', 'assets/cards/salida.webp',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES.map((f) => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Red primero (para recibir actualizaciones); si no hay conexión, usa el caché.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const req = new Request(e.request, { cache: 'no-cache' });
  e.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
