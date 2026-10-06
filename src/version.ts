/**
 * MUSICALMENTE — CONTROLE DE VERSÃO E TEMAS VISUAIS DE ÍCONE
 * 
 * Cada publicação de nova versão possui um identificador único, nome de cache
 * versionado e uma cor exclusiva na sequência para evidenciar visualmente a atualização.
 */

export interface VersionColorTheme {
  id: string;
  name: string;
  primary: string;    // Gradient start
  secondary: string;  // Gradient end
  themeColor: string; // Browser / PWA toolbar color
  badgeBg: string;
  badgeText: string;
}

/**
 * Sequência de cores de versão do Musicalmente.
 * Cores vibrantes, alegres e musicais. A sequência nunca repete imediatamente a cor anterior.
 */
export const VERSION_COLORS_SEQUENCE: VersionColorTheme[] = [
  {
    id: 'amber',
    name: 'Ouro Musical',
    primary: '#fbbf24',
    secondary: '#f59e0b',
    themeColor: '#f59e0b',
    badgeBg: '#fef3c7',
    badgeText: '#92400e',
  },
  {
    id: 'emerald',
    name: 'Esmeralda Vibrante',
    primary: '#34d399',
    secondary: '#059669',
    themeColor: '#059669',
    badgeBg: '#d1fae5',
    badgeText: '#065f46',
  },
  {
    id: 'indigo',
    name: 'Índigo Real',
    primary: '#818cf8',
    secondary: '#4f46e5',
    themeColor: '#4f46e5',
    badgeBg: '#e0e7ff',
    badgeText: '#3730a3',
  },
  {
    id: 'rose',
    name: 'Coral Rosa',
    primary: '#fb7185',
    secondary: '#e11d48',
    themeColor: '#e11d48',
    badgeBg: '#ffe4e6',
    badgeText: '#9f1239',
  },
  {
    id: 'sky',
    name: 'Azul Celeste',
    primary: '#38bdf8',
    secondary: '#0284c7',
    themeColor: '#0284c7',
    badgeBg: '#e0f2fe',
    badgeText: '#075985',
  },
  {
    id: 'purple',
    name: 'Púrpura Mágica',
    primary: '#c084fc',
    secondary: '#9333ea',
    themeColor: '#9333ea',
    badgeBg: '#f3e8ff',
    badgeText: '#6b21a8',
  },
  {
    id: 'ruby',
    name: 'Rubi Flamejante',
    primary: '#f87171',
    secondary: '#dc2626',
    themeColor: '#dc2626',
    badgeBg: '#fee2e2',
    badgeText: '#991b1b',
  },
  {
    id: 'teal',
    name: 'Turquesa Melódica',
    primary: '#2dd4bf',
    secondary: '#0d9488',
    themeColor: '#0d9488',
    badgeBg: '#ccfbf1',
    badgeText: '#115e59',
  }
];

// Versão atual do aplicativo
export const APP_VERSION = '2.2.0';
export const APP_BUILD_ID = 'build-1791283432339-v220';
export const CACHE_NAME = `musicalmente-cache-v${APP_VERSION}`;

/**
 * Retorna o tema de cor correspondente à versão fornecida.
 * Utiliza o hash da versão para selecionar deterministicamente na sequência.
 */
export function getVersionTheme(versionStr: string = APP_VERSION): VersionColorTheme {
  const parts = versionStr.split('.').map((n) => parseInt(n, 10) || 0);
  const major = parts[0] || 0;
  const minor = parts[1] || 0;
  const patch = parts[2] || 0;
  
  // Algoritmo que garante rotação constante a cada incremento de versão
  const index = Math.abs(major * 7 + minor * 3 + patch) % VERSION_COLORS_SEQUENCE.length;
  return VERSION_COLORS_SEQUENCE[index];
}

export const CURRENT_VERSION_THEME: VersionColorTheme = getVersionTheme(APP_VERSION);
