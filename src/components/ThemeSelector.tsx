import React from 'react';
import { AppTheme, Language } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { soundService } from '../services/soundService';
import { Check, Sun, Moon, Sparkles } from 'lucide-react';

interface ThemeSelectorProps {
  currentTheme: AppTheme;
  onSelectTheme: (theme: AppTheme) => void;
  lang?: Language;
  compact?: boolean;
}

export interface ThemeOption {
  id: AppTheme;
  titleKey: 'themeDefault' | 'themeBlack' | 'themeMossGreen';
  descKey: 'themeDefaultDesc' | 'themeBlackDesc' | 'themeMossGreenDesc';
  bgColor: string;
  previewBg: string;
  borderPreview: string;
  iconEmoji: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'blue',
    titleKey: 'themeDefault',
    descKey: 'themeDefaultDesc',
    bgColor: '#f0f7ff',
    previewBg: 'bg-[#2563eb]',
    borderPreview: 'border-blue-400',
    iconEmoji: '🔷',
  },
  {
    id: 'black',
    titleKey: 'themeBlack',
    descKey: 'themeBlackDesc',
    bgColor: '#09090b',
    previewBg: 'bg-[#18181b]',
    borderPreview: 'border-zinc-700',
    iconEmoji: '🌑',
  },
  {
    id: 'moss_green',
    titleKey: 'themeMossGreen',
    descKey: 'themeMossGreenDesc',
    bgColor: '#f2f6f3',
    previewBg: 'bg-[#2e6337]',
    borderPreview: 'border-emerald-600',
    iconEmoji: '🌿',
  },
];

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentTheme,
  onSelectTheme,
  lang = 'pt-BR',
  compact = false,
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS['pt-BR'];

  const handleSelect = (themeId: AppTheme) => {
    soundService.playTap();
    onSelectTheme(themeId);
  };

  return (
    <div
      role="radiogroup"
      aria-label={t.themeSelect}
      className={`w-full grid ${compact ? 'grid-cols-3 gap-2' : 'grid-cols-3 gap-2.5'}`}
    >
      {THEME_OPTIONS.map((opt) => {
        const isSelected = currentTheme === opt.id;
        const title = t[opt.titleKey] || opt.id;
        const desc = t[opt.descKey] || '';

        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => handleSelect(opt.id)}
            className={`relative flex flex-col items-center text-center p-2.5 sm:p-3 rounded-2xl border-2 transition-all cursor-pointer group active:scale-95 ${
              isSelected
                ? 'border-amber-400 bg-amber-500/10 shadow-md ring-2 ring-amber-400/40'
                : 'border-slate-200 hover:border-amber-300 bg-white/60 hover:bg-white'
            }`}
          >
            {/* Visual Swatch Pill */}
            <div
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl ${opt.previewBg} ${opt.borderPreview} border-2 flex items-center justify-center shadow-xs mb-1.5 transition-transform group-hover:scale-105`}
            >
              <span className="text-lg">{opt.iconEmoji}</span>
            </div>

            {/* Title */}
            <span className="font-display font-extrabold text-xs sm:text-sm text-slate-800 tracking-tight leading-tight">
              {title}
            </span>

            {/* Description (non-compact) */}
            {!compact && (
              <span className="text-[10.5px] text-slate-500 font-medium mt-0.5 line-clamp-1">
                {desc}
              </span>
            )}

            {/* Active Indicator Checkmark */}
            {isSelected && (
              <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-xs">
                <Check size={11} strokeWidth={3} />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};
