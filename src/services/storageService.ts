import { AppTheme, Language, MatchResult, RankingEntry, SoundSettings, UserProfile } from '../types';

const STORAGE_KEYS = {
  USER: 'fermataquiz_user_profile',
  MATCH_HISTORY: 'fermataquiz_matches',
  SOUND_SETTINGS: 'fermataquiz_sound_settings',
  PUBLIC_RANKINGS: 'fermataquiz_rankings_v2',
  THEME: 'musicalmente_app_theme',
  REGISTERED_EMAILS: 'musicalmente_registered_emails',
  USER_CREDENTIALS: 'musicalmente_user_credentials',
};

const INITIAL_REGISTERED_EMAILS = [
  'fabilhano@gmail.com',
  'fabipixa@gmail.com',
];

// Initial default user
export const DEFAULT_USER: UserProfile = {
  id: 'guest_student',
  name: 'Pequeno Maestro',
  loginMethod: 'guest',
  language: 'pt-BR',
  avatarId: 'bear_maestro',
  highScore: 0,
  totalScore: 0,
  totalMatches: 0,
  totalCorrect: 0,
  totalQuestionsAnswered: 0,
  maxCombo: 0,
  unlockedAchievements: [],
  createdAt: new Date().toISOString(),
};

// Default sound settings: Initially OFF as required
export const DEFAULT_SOUNDS: SoundSettings = {
  soundEffects: false,
  music: false,
  volume: 0.7,
};

// No mock or fictitious users in ranking
const INITIAL_RANKINGS: RankingEntry[] = [];

export const storageService = {
  getUser(): UserProfile | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER);
      if (data) return JSON.parse(data);
    } catch {}
    return null;
  },

  saveUser(user: UserProfile) {
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch {}
  },

  clearUser() {
    try {
      localStorage.removeItem(STORAGE_KEYS.USER);
    } catch {}
  },

  getSoundSettings(): SoundSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SOUND_SETTINGS);
      if (data) return JSON.parse(data);
    } catch {}
    return DEFAULT_SOUNDS;
  },

  saveSoundSettings(settings: SoundSettings) {
    try {
      localStorage.setItem(STORAGE_KEYS.SOUND_SETTINGS, JSON.stringify(settings));
    } catch {}
  },

  getTheme(): AppTheme {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME);
      if (saved === 'blue' || saved === 'black' || saved === 'moss_green') {
        return saved as AppTheme;
      }
      if (saved === 'dark_blue' || saved === 'default') {
        return 'blue';
      }
    } catch {}
    return 'blue';
  },

  saveTheme(theme: AppTheme) {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch {}
  },

  getMatches(): MatchResult[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MATCH_HISTORY);
      if (data) return JSON.parse(data);
    } catch {}
    return [];
  },

  saveMatch(match: MatchResult) {
    try {
      const matches = this.getMatches();
      matches.unshift(match);
      localStorage.setItem(STORAGE_KEYS.MATCH_HISTORY, JSON.stringify(matches.slice(0, 50)));
    } catch {}
  },

  getRankings(period: 'today' | 'week' | 'month' | 'all'): RankingEntry[] {
    let list: RankingEntry[] = [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PUBLIC_RANKINGS);
      list = data ? JSON.parse(data) : INITIAL_RANKINGS;
    } catch {
      list = INITIAL_RANKINGS;
    }

    if (period === 'all') {
      return list.sort((a, b) => b.score - a.score);
    }

    const filtered = list.filter(r => r.period === period || r.period === 'all');
    return filtered.sort((a, b) => b.score - a.score);
  },

  recordScoreInRanking(user: UserProfile, match: MatchResult) {
    try {
      let list: RankingEntry[] = [];
      const data = localStorage.getItem(STORAGE_KEYS.PUBLIC_RANKINGS);
      list = data ? JSON.parse(data) : [...INITIAL_RANKINGS];

      // Add user entry for today and all-time
      const newEntry: RankingEntry = {
        id: 'usr_' + Date.now(),
        name: user.name,
        avatarId: user.avatarId,
        score: match.score,
        correctCount: match.correctCount,
        accuracy: match.accuracy,
        maxCombo: match.maxCombo,
        period: 'today',
      };

      list.push(newEntry);
      localStorage.setItem(STORAGE_KEYS.PUBLIC_RANKINGS, JSON.stringify(list));
    } catch {}
  },

  getRegisteredEmails(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REGISTERED_EMAILS);
      if (data) {
        const parsed = JSON.parse(data);
        return Array.from(new Set([...INITIAL_REGISTERED_EMAILS, ...parsed]));
      }
    } catch {}
    return INITIAL_REGISTERED_EMAILS;
  },

  isEmailRegistered(email: string): boolean {
    if (!email) return false;
    const clean = email.trim().toLowerCase();
    const list = this.getRegisteredEmails();
    return list.some((e) => e.toLowerCase() === clean);
  },

  registerEmail(email: string, password?: string) {
    if (!email) return;
    const clean = email.trim().toLowerCase();
    const list = this.getRegisteredEmails();
    if (!list.some((e) => e.toLowerCase() === clean)) {
      list.push(clean);
      try {
        localStorage.setItem(STORAGE_KEYS.REGISTERED_EMAILS, JSON.stringify(list));
      } catch {}
    }
    if (password) {
      this.setUserPassword(clean, password);
    }
  },

  setUserPassword(email: string, password: string) {
    if (!email || !password) return;
    const clean = email.trim().toLowerCase();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_CREDENTIALS);
      const creds = data ? JSON.parse(data) : {};
      creds[clean] = {
        password: password,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEYS.USER_CREDENTIALS, JSON.stringify(creds));
    } catch {}
  },

  verifyUserPassword(email: string, password: string): boolean {
    if (!email || !password) return false;
    const clean = email.trim().toLowerCase();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_CREDENTIALS);
      if (data) {
        const creds = JSON.parse(data);
        if (creds[clean] && creds[clean].password) {
          return creds[clean].password === password;
        }
      }
    } catch {}
    return true; // if no custom password was set yet, allow transition
  },
};
