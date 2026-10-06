import React, { useState } from 'react';
import { ClefType, Language, UserProfile } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { soundService } from '../services/soundService';
import { getAvatarById } from '../data/avatars';
import { AvatarDisplay } from './AvatarDisplay';
import { LanguageSelector } from './LanguageSelector';
import { Play, X, Clock, HelpCircle, Flame, CheckCircle2, Zap, Music2, AlertCircle } from 'lucide-react';
import { selectMatchQuestionsByClef } from '../data/questions';

interface PrepMatchModalProps {
  currentUser: UserProfile;
  lang: Language;
  onConfirmStart: (clef: ClefType) => void;
  onClose: () => void;
  onSelectLang?: (newLang: Language) => void;
}

export const PrepMatchModal: React.FC<PrepMatchModalProps> = ({
  currentUser,
  lang,
  onConfirmStart,
  onClose,
  onSelectLang,
}) => {
  const [selectedClef, setSelectedClef] = useState<ClefType>('sol');
  const t = TRANSLATIONS[lang];
  const avatar = getAvatarById(currentUser.avatarId);

  // Check question pool for chosen clef
  const pool = selectMatchQuestionsByClef(selectedClef, lang, 20);

  const clefOptions: { id: ClefType; title: string; subtitle: string; icon: string }[] = [
    {
      id: 'sol',
      title: t.clefSolTitle || 'CLAVE DE SOL',
      subtitle: t.clefSolDesc || 'Agudos (Violino, Flauta, Soprano)',
      icon: '𝄞',
    },
    {
      id: 'fa',
      title: t.clefFaTitle || 'CLAVE DE FÁ',
      subtitle: t.clefFaDesc || 'Graves (Violoncelo, Baixo, Órgão pedaleira)',
      icon: '𝄢',
    },
    {
      id: 'do',
      title: t.clefDoTitle || 'CLAVE DE DÓ',
      subtitle: t.clefDoDesc || 'Médios (Viola de arco, Hinário)',
      icon: '𝄡',
    },
  ];

  const handleStart = () => {
    soundService.playTap();
    onConfirmStart(selectedClef);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/75 backdrop-blur-sm animate-fade-in overflow-y-auto"
      style={{
        paddingTop: 'max(env(safe-area-inset-top, 0px), 1.5rem)',
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 1.5rem)',
        paddingLeft: 'max(env(safe-area-inset-left, 0px), 1rem)',
        paddingRight: 'max(env(safe-area-inset-right, 0px), 1rem)',
      }}
    >
      <div className="relative w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border-4 border-blue-400 text-center flex flex-col items-center my-auto">
        {/* Close Button */}
        <button
          onClick={() => {
            soundService.playTap();
            onClose();
          }}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          aria-label={t.close}
        >
          <X size={18} />
        </button>

        {/* 3D Avatar Companion */}
        <div className="relative w-20 h-20 rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-blue-100 mb-2 -mt-12 flex items-center justify-center">
          <AvatarDisplay
            avatar={avatar}
            photoUrl={currentUser.photoUrl}
            size="2xl"
            className="w-full h-full border-0 shadow-none rounded-none"
          />
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold font-display text-blue-950 mt-1">
          {t.readyToPlay}
        </h3>

        {/* ================================================== */}
        {/* ESCOLHA A CLAVE (SELEÇÃO OBRIGATÓRIA ANTES DO QUIZ) */}
        {/* ================================================== */}
        <div className="w-full my-3">
          <div className="flex items-center justify-center gap-1.5 mb-2">
            <span className="text-base">🎼</span>
            <span className="text-xs font-black font-display uppercase tracking-wider text-blue-900">
              {t.chooseClefTitle || 'ESCOLHA A CLAVE'}
            </span>
          </div>

          <div className="space-y-2">
            {clefOptions.map((opt) => {
              const isSelected = selectedClef === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    soundService.playTap();
                    setSelectedClef(opt.id);
                  }}
                  className={`w-full p-2.5 rounded-2xl border-2 flex items-center gap-3 transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/90 shadow-md ring-2 ring-blue-400/40 scale-[1.01]'
                      : 'border-slate-200 hover:border-blue-300 bg-slate-50/70 hover:bg-white'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl font-serif shrink-0 ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-700'
                    }`}
                  >
                    {opt.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-extrabold text-xs text-slate-900 flex items-center justify-between">
                      <span>{opt.title}</span>
                      {isSelected && (
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                          Selecionada ✓
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate mt-0.5">
                      {opt.subtitle}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Warning if fewer questions */}
          {!pool.hasEnough && (
            <div className="mt-2 p-2 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-1.5 text-left">
              <AlertCircle size={14} className="text-amber-600 shrink-0 mt-0.5" />
              <span>
                {t.notEnoughClefQuestions
                  ? t.notEnoughClefQuestions(pool.totalAvailable)
                  : `Esta clave possui ${pool.totalAvailable} perguntas disponíveis. A partida iniciará somente com perguntas desta clave.`}
              </span>
            </div>
          )}
        </div>

        {/* Rules & Summary Chips */}
        <div className="w-full my-1 space-y-1.5 text-left">
          {/* Question count for selected clef */}
          <div className="flex items-center gap-2 p-2 rounded-xl bg-blue-50/70 border border-blue-200/80 text-xs text-blue-950 font-semibold font-display">
            <div className="w-6 h-6 rounded-lg bg-blue-200 text-blue-800 flex items-center justify-center shrink-0">
              <HelpCircle size={15} />
            </div>
            <span className="leading-tight">
              {pool.questions.length} Perguntas Exclusivas (
              {selectedClef === 'sol' ? 'Clave de Sol' : selectedClef === 'fa' ? 'Clave de Fá' : 'Clave de Dó'}
              )
            </span>
          </div>

          {/* Time per question */}
          <div className="flex items-center gap-2 p-2 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-950 font-semibold font-display">
            <div className="w-6 h-6 rounded-lg bg-sky-200 text-sky-800 flex items-center justify-center shrink-0">
              <Clock size={15} />
            </div>
            <span className="leading-tight">{t.prepTimePerQuestion}</span>
          </div>

          {/* Scoring system */}
          <div className="flex items-center gap-2 p-2 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-950 font-semibold font-display">
            <div className="w-6 h-6 rounded-lg bg-indigo-200 text-indigo-800 flex items-center justify-center shrink-0">
              <Zap size={15} />
            </div>
            <span className="leading-tight">{t.prepScoringSystem}</span>
          </div>
        </div>

        {/* Optional Language Selector */}
        {onSelectLang && (
          <div className="my-2">
            <LanguageSelector
              currentLang={lang}
              onSelectLang={onSelectLang}
              compact={true}
            />
          </div>
        )}

        {/* Start Game CTA */}
        <button
          type="button"
          onClick={handleStart}
          className="w-full py-3.5 px-6 rounded-2xl text-white font-display font-extrabold text-base bg-blue-600 hover:bg-blue-700 active:bg-blue-800 flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-98 transition-all mt-2"
        >
          <Play size={20} className="fill-current" />
          <span>{t.startQuiz}</span>
        </button>
      </div>
    </div>
  );
};
