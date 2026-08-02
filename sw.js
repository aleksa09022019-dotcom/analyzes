// Простой service worker для MedScan PWA
// Кэширует главную страницу и иконки, чтобы приложение открывалось
// даже при слабом или отсутствующем интернет-соединении.
// Запросы к API (Worker) НЕ кэшируются — там всегда нужны свежие данные.

const CACHE_NAME = 'medscan-cache-v1';
const URLS_TO_CACHE = [
  './MedScan.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Никогда не кэшируем запросы к Worker'у (API-анализ, оплата) —
  // там всегда нужен свежий ответ с сервера.
  if (url.hostname.includes('workers.dev')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request);
    })
  );
});
