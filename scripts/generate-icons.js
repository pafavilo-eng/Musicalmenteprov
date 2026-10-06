import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Resvg } from '@resvg/resvg-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.resolve(rootDir, 'public');

// Sequência oficial de cores de versão
const VERSION_COLORS = [
  {
    id: 'amber',
    name: 'Ouro Musical',
    primary: '#fbbf24',
    secondary: '#f59e0b',
    themeColor: '#f59e0b',
  },
  {
    id: 'emerald',
    name: 'Esmeralda Vibrante',
    primary: '#34d399',
    secondary: '#059669',
    themeColor: '#059669',
  },
  {
    id: 'indigo',
    name: 'Índigo Real',
    primary: '#818cf8',
    secondary: '#4f46e5',
    themeColor: '#4f46e5',
  },
  {
    id: 'rose',
    name: 'Coral Rosa',
    primary: '#fb7185',
    secondary: '#e11d48',
    themeColor: '#e11d48',
  },
  {
    id: 'sky',
    name: 'Azul Celeste',
    primary: '#38bdf8',
    secondary: '#0284c7',
    themeColor: '#0284c7',
  },
  {
    id: 'purple',
    name: 'Púrpura Mágica',
    primary: '#c084fc',
    secondary: '#9333ea',
    themeColor: '#9333ea',
  },
  {
    id: 'ruby',
    name: 'Rubi Flamejante',
    primary: '#f87171',
    secondary: '#dc2626',
    themeColor: '#dc2626',
  },
  {
    id: 'teal',
    name: 'Turquesa Melódica',
    primary: '#2dd4bf',
    secondary: '#0d9488',
    themeColor: '#0d9488',
  }
];

function getThemeForVersion(versionStr) {
  const parts = versionStr.split('.').map((n) => parseInt(n, 10) || 0);
  const major = parts[0] || 0;
  const minor = parts[1] || 0;
  const patch = parts[2] || 0;
  const index = Math.abs(major * 7 + minor * 3 + patch) % VERSION_COLORS.length;
  return VERSION_COLORS[index];
}

// Obter versão a partir dos argumentos ou de src/version.ts
let version = process.argv[2];
if (!version) {
  try {
    const versionFile = fs.readFileSync(path.resolve(rootDir, 'src/version.ts'), 'utf8');
    const match = versionFile.match(/export const APP_VERSION = '([^']+)'/);
    if (match && match[1]) {
      version = match[1];
    }
  } catch {}
}
if (!version) version = '2.2.0';

const theme = getThemeForVersion(version);
console.log(`\n🎵 Gerando recursos da versão ${version} com tema "${theme.name}" (${theme.primary} -> ${theme.secondary})`);

// 1. Gera SVG do ícone com o símbolo oficial 🎵
function generateSvg({ maskable = false }) {
  const rx = maskable ? '0' : '110';
  // Centraliza o símbolo musical na área segura
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.primary}" />
      <stop offset="100%" stop-color="${theme.secondary}" />
    </linearGradient>
    <linearGradient id="noteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#fffbeb" />
    </linearGradient>
    <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="14" flood-color="#000000" flood-opacity="0.25" />
    </filter>
  </defs>

  <!-- Fundo com gradiente da versão atual -->
  <rect width="512" height="512" rx="${rx}" fill="url(#bgGrad)" />

  <!-- Borda sutil de brilho interno -->
  <rect x="8" y="8" width="496" height="496" rx="${maskable ? '0' : '104'}" fill="none" stroke="#ffffff" stroke-opacity="0.25" stroke-width="6" />

  <!-- Símbolo Oficial Musicalmente (Colcheia dupla estilizada com notas musicais) -->
  <g filter="url(#dropShadow)" fill="url(#noteGrad)">
    <path d="M 180 340 C 145 340 120 362 120 390 C 120 418 145 440 180 440 C 215 440 238 418 240 390 L 240 190 L 370 155 L 370 325 C 335 325 310 347 310 375 C 310 403 335 425 370 425 C 405 425 428 403 430 375 L 430 100 L 180 160 Z" />
  </g>

  <!-- Brilhos musicais complementares -->
  <circle cx="120" cy="120" r="10" fill="#ffffff" opacity="0.8" />
  <circle cx="410" cy="230" r="7" fill="#ffffff" opacity="0.6" />
</svg>`;
}

const standardSvg = generateSvg({ maskable: false });
const maskableSvg = generateSvg({ maskable: true });

// Salva icon.svg
fs.writeFileSync(path.resolve(publicDir, 'icon.svg'), standardSvg);
console.log('✓ public/icon.svg atualizado');

// 2. Renderiza PNGs com resvg
function renderPng(svgString, size) {
  const resvg = new Resvg(svgString, {
    fitTo: { mode: 'width', value: size },
  });
  return resvg.render().asPng();
}

// icon-192.png
const png192 = renderPng(standardSvg, 192);
fs.writeFileSync(path.resolve(publicDir, 'icon-192.png'), png192);
console.log('✓ public/icon-192.png gerado (192x192)');

// icon-512.png
const png512 = renderPng(standardSvg, 512);
fs.writeFileSync(path.resolve(publicDir, 'icon-512.png'), png512);
console.log('✓ public/icon-512.png gerado (512x512)');

// icon-512-maskable.png
const pngMaskable = renderPng(maskableSvg, 512);
fs.writeFileSync(path.resolve(publicDir, 'icon-512-maskable.png'), pngMaskable);
console.log('✓ public/icon-512-maskable.png gerado (512x512 maskable)');

// apple-touch-icon.png (180x180)
const pngApple = renderPng(standardSvg, 180);
fs.writeFileSync(path.resolve(publicDir, 'apple-touch-icon.png'), pngApple);
console.log('✓ public/apple-touch-icon.png gerado (180x180)');

// favicon.png (64x64)
const pngFavicon = renderPng(standardSvg, 64);
fs.writeFileSync(path.resolve(publicDir, 'favicon.png'), pngFavicon);
console.log('✓ public/favicon.png gerado (64x64)');

// 3. Atualiza public/manifest.json
const manifest = {
  id: '/',
  name: 'MusicalMente',
  short_name: 'MusicalMente',
  description: 'Quiz musical educativo para aprender, responder e superar seu recorde.',
  theme_color: theme.themeColor,
  background_color: '#fdfaf3',
  display: 'standalone',
  orientation: 'portrait',
  start_url: '/',
  scope: '/',
  icons: [
    {
      src: `/icon-192.png?v=${version}`,
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any',
    },
    {
      src: `/icon-512.png?v=${version}`,
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any',
    },
    {
      src: `/icon-512-maskable.png?v=${version}`,
      sizes: '512x512',
      type: 'image/png',
      purpose: 'maskable',
    },
  ],
};

fs.writeFileSync(path.resolve(publicDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log('✓ public/manifest.json atualizado com theme_color ' + theme.themeColor);

// 4. Cria/atualiza public/version.json
const versionInfo = {
  version: version,
  buildId: `build-${Date.now()}-v${version.replace(/\./g, '')}`,
  theme: {
    name: theme.name,
    primary: theme.primary,
    secondary: theme.secondary,
    themeColor: theme.themeColor,
  },
  cacheName: `musicalmente-cache-v${version}`,
  releasedAt: new Date().toISOString(),
};

fs.writeFileSync(path.resolve(publicDir, 'version.json'), JSON.stringify(versionInfo, null, 2));
console.log('✓ public/version.json atualizado');

// Atualiza src/version.ts para manter versão sincronizada
const versionTsPath = path.resolve(rootDir, 'src/version.ts');
if (fs.existsSync(versionTsPath)) {
  let content = fs.readFileSync(versionTsPath, 'utf8');
  content = content.replace(/export const APP_VERSION = '[^']+';/, `export const APP_VERSION = '${version}';`);
  content = content.replace(/export const APP_BUILD_ID = '[^']+';/, `export const APP_BUILD_ID = 'build-${Date.now()}-v${version.replace(/\./g, '')}';`);
  fs.writeFileSync(versionTsPath, content);
  console.log('✓ src/version.ts sincronizado com a versão ' + version);
}

// 5. Gera public/sw.js com a versão atual e o cache versionado
const swCode = `// MUSICALMENTE — SERVICE WORKER COM ATUALIZAÇÃO AUTOMÁTICA
// Versão do aplicativo: ${version}
// Tema da versão: ${theme.name}

const APP_VERSION = '${version}';
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
`;

fs.writeFileSync(path.resolve(publicDir, 'sw.js'), swCode);
console.log('✓ public/sw.js gerado com versão ' + version);

console.log(`\n🎉 Todos os recursos e ícones da versão ${version} foram gerados com sucesso!\n`);
