import React from 'react';
import { AppTheme, Language, UserProfile } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { soundService } from '../services/soundService';
import { getAvatarById } from '../data/avatars';
import { AvatarDisplay } from './AvatarDisplay';
import { Settings, Volume2, VolumeX, Palette } from 'lucide-react';
import { MusicalMenteLogo } from './MusicalMenteLogo';
import { ScoreTrophyBadge } from './ScoreTrophyBadge';

interface MobileHeaderProps {
  currentUser: UserProfile;
  lang: Language;
  soundEffects: boolean;
  theme?: AppTheme;
  onToggleSound: () => void;
  onToggleTheme?: () => void;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  currentUser,
  lang,
  soundEffects,
  theme = 'default',
  onToggleSound,
  onToggleTheme,
  onOpenSettings,
  onOpenProfile,
}) => {
  const t = TRANSLATIONS[lang];
  const avatar = getAvatarById(currentUser.avatarId);

  return (
    <header
      className="sticky top-0 z-40 w-full bg-[var(--app-header-bg,rgba(255,255,255,0.96))] backdrop-blur-md border-b border-[var(--app-header-border,#bfdbfe)] px-3.5 pb-2.5 flex items-center justify-between shadow-xs transition-all"
      style={{
        paddingTop: 'max(env(safe-area-inset-top, 0px), 12px)',
        paddingLeft: 'max(env(safe-area-inset-left, 0px), 0.875rem)',
        paddingRight: 'max(env(safe-area-inset-right, 0px), 0.875rem)',
      }}
    >
      {/* Zone 1: Wordmark / Brand Title */}
      <div className="flex items-center gap-2 cursor-pointer">
        <span className="text-2xl">🎵</span>
        <span className="font-display font-black text-lg tracking-tight">
          <MusicalMenteLogo variant="header" />
        </span>
      </div>

      {/* Zone 2 & 3: Trophy & Quick Action Buttons */}
      <div className="flex items-center gap-1.5">
        {/* Trophy / Medal Badge if user has earned one */}
        <ScoreTrophyBadge
          user={currentUser}
          size="xs"
          variant="pill"
          onClick={onOpenProfile}
          className="cursor-pointer"
        />

        {/* Quick Theme Switcher Button */}
        {onToggleTheme && (
          <button
            type="button"
            onClick={() => {
              soundService.playTap();
              onToggleTheme();
            }}
            className="w-9 h-9 rounded-xl bg-slate-100/90 hover:bg-amber-100 text-slate-700 hover:text-amber-900 flex items-center justify-center transition-colors cursor-pointer"
            title={`${t.themeSelect} (${theme})`}
            aria-label={t.themeSelect}
          >
            <Palette size={18} />
          </button>
        )}

        {/* Sound toggle button (🔇 Áudio Desligado inicialmente / 🔊 Áudio Ligado após toque) */}
        <button
          type="button"
          onClick={onToggleSound}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
            soundEffects
              ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-300/60'
              : 'bg-slate-100 text-slate-400 hover:bg-slate-200 border border-slate-200'
          }`}
          title={soundEffects ? '🔊 Áudio Ligado (Toque para desligar sons)' : '🔇 Áudio Desligado (Toque para ativar sons)'}
          aria-label={soundEffects ? 'Áudio Ligado' : 'Áudio Desligado'}
        >
          {soundEffects ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>

        {/* Settings button */}
        <button
          type="button"
          onClick={() => {
            soundService.playTap();
            onOpenSettings();
          }}
          className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          title={t.settings}
          aria-label={t.settings}
        >
          <Settings size={18} />
        </button>

        {/* User Mini Avatar Trigger */}
        <button
          type="button"
          onClick={() => {
            soundService.playTap();
            onOpenProfile();
          }}
          className="cursor-pointer hover:scale-105 transition-transform ml-0.5"
          title={t.profile}
          aria-label={t.profile}
        >
          <AvatarDisplay
            avatar={avatar}
            photoUrl={currentUser.photoUrl}
            size="xs"
            shape="circle"
            className="w-9 h-9 rounded-full border-2 border-amber-400 shadow-2xs"
          />
        </button>
      </div>
    </header>
  );
};
