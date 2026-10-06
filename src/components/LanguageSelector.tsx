import React from 'react';
import { Language } from '../types';
import { soundService } from '../services/soundService';

interface LanguageSelectorProps {
  currentLang: Language;
  onSelectLang: (lang: Language) => void;
  compact?: boolean;
}

export const LANGUAGE_OPTIONS: { code: Language; label: string; flag: string; shortLabel: string }[] = [
  { code: 'pt-BR', label: 'Português (Brasil)', flag: '🇧🇷', shortLabel: 'PT-BR' },
  { code: 'fr-CA', label: 'Français (Canada)', flag: '🇨🇦', shortLabel: 'FR-CA' },
  { code: 'en-CA', label: 'English (Canada)', flag: '🇨🇦', shortLabel: 'EN-CA' },
];

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLang,
  onSelectLang,
  compact = false,
}) => {
  return (
    <div
      role="radiogroup"
      aria-label="Seletor de idioma"
      className={`w-full max-w-[360px] mx-auto flex items-center justify-between gap-1.5 p-1.5 bg-amber-100/90 rounded-2xl border-2 border-amber-200 shadow-xs box-border overflow-hidden`}
    >
      {LANGUAGE_OPTIONS.map((item) => {
        const isSelected = currentLang === item.code;
        return (
          <button
            key={item.code}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => {
              soundService.playTap();
              onSelectLang(item.code);
            }}
            className={`flex-1 min-h-[44px] flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl transition-all cursor-pointer select-none text-center min-w-0 active:scale-95 ${
              isSelected
                ? 'bg-white text-indigo-950 shadow-md font-black border border-amber-200/60 scale-[1.02]'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/50 font-bold'
            }`}
            title={item.label}
          >
            <span className="text-lg sm:text-xl shrink-0" role="img" aria-label={item.label}>
              {item.flag}
            </span>
            <span className="font-display tracking-tight uppercase text-xs sm:text-[13px] truncate">
              {item.shortLabel}
            </span>
          </button>
        );
      })}
    </div>
  );
};
