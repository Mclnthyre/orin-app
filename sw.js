const CACHE_NAME = 'orin-v1';

const ASSETS = [
  '/',
  '/index.html',
  '/artigo.html',
  '/css/style.css',
  '/js/app.js',
  '/js/artigo.js',
  '/manifest.json'
];

// Instala e cacheia a UI
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

// Ativa e limpa caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME)
            .map(k => caches.delete(k))
      )
    )
  );
});

// Intercepta requisições
self.addEventListener('fetch', event => {
  const url = event.request.url;

  // Conteúdo dinâmico (Google Sheets)
  if (url.includes('opensheet.elk.sh')) {
    event.respondWith(
      fetch(event.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
          return res;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Arquivos estáticos
  event.respondWith(
    caches.match(event.request)
      .then(res => res || fetch(event.request))
  );
});
