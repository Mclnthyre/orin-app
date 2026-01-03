const CACHE_NAME = 'orin-v1';

const ASSETS = [
  './',
  './index.html',
  './artigo.html',
  './css/style.css',
  './js/app.js',
  './js/artigo.js',
  './manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});
