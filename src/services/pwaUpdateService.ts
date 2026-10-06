/**
 * MUSICALMENTE — SERVIÇO DE ATUALIZAÇÃO AUTOMÁTICA DA PWA
 * 
 * Gerencia o ciclo de vida do Service Worker, verificação de novas versões,
 * skipWaiting(), clients.claim() e recarregamento seguro e automático
 * sem exigir ação manual do usuário.
 */

import { APP_VERSION, CURRENT_VERSION_THEME, VersionColorTheme } from '../version';

export interface VersionInfo {
  version: string;
  buildId: string;
  theme: VersionColorTheme;
  cacheName: string;
  releasedAt: string;
}

type UpdateListener = (info: { currentVersion: string; newVersion: string }) => void;

class PWAUpdateService {
  private registration: ServiceWorkerRegistration | null = null;
  private isChecking = false;
  private listeners: Set<UpdateListener> = new Set();
  private updateCheckInterval: any = null;

  /**
   * Inicializa o registro do Service Worker e os observadores de foco/visibilidade
   */
  public async init(): Promise<void> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      console.log('[PWAUpdate] Service Worker não suportado neste navegador.');
      return;
    }

    // 1. Atualiza visualmente as tags de tema no HTML para a versão atual
    this.applyVersionThemeMeta(CURRENT_VERSION_THEME);

    try {
      // 2. Registra o Service Worker oficial versionado
      const swUrl = `/sw.js?v=${APP_VERSION}`;
      const reg = await navigator.serviceWorker.register(swUrl, { scope: '/' });
      this.registration = reg;
      console.log(`[PWAUpdate] Service Worker registrado para a versão ${APP_VERSION}`);

      // 3. Monitora novas versões encontradas
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;

        console.log('[PWAUpdate] Nova versão do Service Worker detectada...');
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed') {
            // Se já há um controlador ativo, significa que uma atualização acabou de ser baixada
            if (navigator.serviceWorker.controller) {
              console.log('[PWAUpdate] Nova versão instalada. Enviando comando SKIP_WAITING...');
              newWorker.postMessage({ type: 'SKIP_WAITING' });
            }
          }
        });
      });

      // Se já houver um worker esperando, solicita skipWaiting imediatamente
      if (reg.waiting) {
        console.log('[PWAUpdate] Service Worker em espera detectado. Solicitando skipWaiting...');
        reg.waiting.postMessage({ type: 'SKIP_WAITING' });
      }

      // 4. Quando o novo Service Worker assumir o controle (controllerchange), recarrega suavemente a página
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        console.log('[PWAUpdate] Novo Service Worker assumiu o controle. Recarregando com a nova versão...');
        
        // Evita loop de recarga verificando sessionStorage
        const reloadKey = `reloaded_for_version_${APP_VERSION}`;
        if (!sessionStorage.getItem(reloadKey)) {
          sessionStorage.setItem(reloadKey, 'true');
        }
        window.location.reload();
      });

      // 5. Escuta mensagens vindas do Service Worker (ex: confirmação de ativação)
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'NEW_VERSION_ACTIVATED') {
          console.log('[PWAUpdate] Versão ativada confirmada pelo SW:', event.data.version);
        }
      });

      // 6. Monitora o retorno ao aplicativo (ao abrir ou alternar de app)
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          console.log('[PWAUpdate] Aplicativo em primeiro plano. Verificando atualizações...');
          this.checkForUpdate();
        }
      });

      window.addEventListener('focus', () => {
        this.checkForUpdate();
      });

      window.addEventListener('online', () => {
        this.checkForUpdate();
      });

      // 7. Verificação periódica a cada 60 segundos
      if (this.updateCheckInterval) clearInterval(this.updateCheckInterval);
      this.updateCheckInterval = setInterval(() => {
        this.checkForUpdate();
      }, 60000);

      // Verificação inicial imediata
      this.checkForUpdate();
    } catch (err) {
      console.warn('[PWAUpdate] Erro ao registrar Service Worker:', err);
    }
  }

  /**
   * Verifica ativamente se existe uma nova versão publicada
   */
  public async checkForUpdate(): Promise<boolean> {
    if (this.isChecking) return false;
    this.isChecking = true;

    try {
      // 1. Força checagem no Service Worker
      if (this.registration) {
        try {
          await this.registration.update();
        } catch {}
      }

      // 2. Consulta direta ao arquivo de versão sem cache
      const response = await fetch(`/version.json?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
        },
      });

      if (response.ok) {
        const data: VersionInfo = await response.json();
        if (data.version && data.version !== APP_VERSION) {
          console.log(`[PWAUpdate] Nova versão encontrada no servidor! Atual: ${APP_VERSION}, Nova: ${data.version}`);
          
          this.notifyListeners({
            currentVersion: APP_VERSION,
            newVersion: data.version,
          });

          // Se houver um worker esperando, força ativação
          if (this.registration && this.registration.waiting) {
            this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }

          // Se o Service Worker ainda não assumiu, força o recarregamento seguro da página
          setTimeout(() => {
            const reloadGuard = `pwa_updated_to_${data.version}`;
            if (!sessionStorage.getItem(reloadGuard)) {
              sessionStorage.setItem(reloadGuard, 'true');
              window.location.reload();
            }
          }, 1500);

          return true;
        }
      }
    } catch (err) {
      // Falha silenciosa se offline
    } finally {
      this.isChecking = false;
    }

    return false;
  }

  /**
   * Aplica dinamicamente a cor do tema e favicon no documento HTML
   */
  private applyVersionThemeMeta(theme: VersionColorTheme): void {
    if (typeof document === 'undefined') return;

    // Atualiza <meta name="theme-color">
    let metaTheme = document.querySelector('meta[name="theme-color"]');
    if (!metaTheme) {
      metaTheme = document.createElement('meta');
      metaTheme.setAttribute('name', 'theme-color');
      document.head.appendChild(metaTheme);
    }
    metaTheme.setAttribute('content', theme.themeColor);

    // Atualiza links de ícones adicionando versão para forçar refresh no navegador
    const iconLinks = document.querySelectorAll<HTMLLinkElement>('link[rel*="icon"]');
    iconLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (href && !href.includes('data:')) {
        const baseUrl = href.split('?')[0];
        link.setAttribute('href', `${baseUrl}?v=${APP_VERSION}`);
      }
    });
  }

  /**
   * Registra um listener para notificações de atualização
   */
  public onUpdate(listener: UpdateListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(payload: { currentVersion: string; newVersion: string }): void {
    this.listeners.forEach((listener) => {
      try {
        listener(payload);
      } catch {}
    });
  }
}

export const pwaUpdateService = new PWAUpdateService();
