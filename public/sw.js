// MUSICALMENTE — SERVICE WORKER COM ATUALIZAÇÃO AUTOMÁTICA
// Versão do aplicativo: 2.2.0
// Tema da versão: Azul Celeste

const APP_VERSION = '2.2.0';
const CACHE_NAME = 'musicalmente-cache-v' + APP_VERSION;

// Recursos fundamentais em cache para inicialização instantânea e offline
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/version.json',
  '/favicon.png',
  '/favicon.ico',
  '/icon.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-512-maskable.png',
  '/apple-touch-icon.png'
];

// 1. INSTALAÇÃO: Armazena recursos fundamentais e ativa skipWaiting imediatamente
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Instalando nova versão:', APP_VERSION);
  // Garante que o novo Service Worker não fique parado em espera
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_ASSETS).catch((err) => {
        console.warn('[ServiceWorker] Aviso ao pré-carregar recursos:', err);
      });
    })
  );
});

// 2. ATIVAÇÃO: Limpeza automática de caches antigos e clients.claim()
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Ativando versão:', APP_VERSION);

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((existingCache) => {
          // Exclusão automática de caches antigos que não correspondam à versão atualmente instalada
          if (existingCache !== CACHE_NAME) {
            console.log('[ServiceWorker] Removendo cache obsoleto:', existingCache);
            return caches.delete(existingCache);
          }
        })
      );
    }).then(() => {
      // Assume imediatamente o controle de todas as páginas/abas abertas
      return self.clients.claim();
    }).then(() => {
      // Notifica as abas ativas sobre a ativação bem-sucedida
      return self.clients.matchAll({ type: 'window' }).then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'NEW_VERSION_ACTIVATED',
            version: APP_VERSION,
            cacheName: CACHE_NAME
          });
        });
      });
    })
  );
});

// 3. MENSAGENS: Comunicação bidirecional com a aplicação
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[ServiceWorker] Executando skipWaiting() solicitado pela aplicação');
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'GET_VERSION') {
    event.source?.postMessage({
      type: 'VERSION_INFO',
      version: APP_VERSION,
      cacheName: CACHE_NAME
    });
  }
});

// 4. FETCH: Estratégia de cache inteligente (Network-First para HTML e navegação, Stale-While-Revalidate para estáticos)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Ignora requisições de outros domínios de API (Firebase, Google, etc.) ou consultas dinâmicas de versão
  if (
    url.origin !== self.location.origin ||
    url.pathname === '/version.json' ||
    url.pathname.startsWith('/api/') ||
    event.request.method !== 'GET'
  ) {
    return;
  }

  // Requisições de navegação (HTML): Network-First para garantir que o usuário sempre receba a versão mais recente
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Se estiver offline, serve a versão em cache
          return caches.match('/index.html').then((cached) => {
            return cached || caches.match('/');
          });
        })
    );
    return;
  }

  // Recursos estáticos (JS, CSS, Imagens, Fontes): Cache-First com atualização em segundo plano
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clone);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
