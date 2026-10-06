import React from 'react';
import { Achievement, Language, UserProfile } from '../types';
import { ACHIEVEMENTS } from '../data/achievements';
import { TRANSLATIONS } from '../i18n/translations';
import { soundService } from '../services/soundService';
import { Award, ArrowLeft, CheckCircle2, Lock, Trophy, Star } from 'lucide-react';
import { ScoreTrophyBadge } from './ScoreTrophyBadge';
import { calculateScoreTrophy, getUserTotalScore } from '../services/scoreTrophyService';

interface AchievementsViewProps {
  currentUser: UserProfile;
  lang: Language;
  onBack: () => void;
}

export const AchievementsView: React.FC<AchievementsViewProps> = ({
  currentUser,
  lang,
  onBack,
}) => {
  const t = TRANSLATIONS[lang];
  const unlocked = currentUser.unlockedAchievements || [];
  const totalScore = getUserTotalScore(currentUser);
  const trophyInfo = calculateScoreTrophy(totalScore);

  return (
    <div
      className="w-full max-w-md mx-auto flex flex-col min-h-screen px-3.5 pt-3 select-none"
      style={{
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px) + 2rem, 3rem)',
        paddingLeft: 'max(env(safe-area-inset-left, 0px), 0.875rem)',
        paddingRight: 'max(env(safe-area-inset-right, 0px), 0.875rem)',
      }}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => {
            soundService.playTap();
            onBack();
          }}
          className="p-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 shadow-sm border border-slate-200 cursor-pointer transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-2">
          <Award className="w-6 h-6 text-amber-500" />
          <h2 className="text-xl font-bold font-display text-indigo-950">
            {t.achievementsTitle}
          </h2>
        </div>
        <div className="w-8"></div>
      </div>

      {/* 🏆 Section: Conquistas Cumulativas por Pontos */}
      <div className="mb-4">
        <ScoreTrophyBadge user={currentUser} variant="card" />

        <div className="mt-2 p-3.5 rounded-2xl bg-white border border-amber-200/80 shadow-xs space-y-2">
          <div className="text-xs font-bold font-display text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
            <Star size={14} className="fill-amber-400 text-amber-500" />
            <span>Regras das Medalhas & Troféus por Pontuação</span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-700">
            <div className={`flex items-center justify-between p-1.5 rounded-xl ${totalScore >= 5000 && totalScore < 10000 ? 'bg-amber-100/90 font-bold border border-amber-300' : ''}`}>
              <span className="flex items-center gap-1.5">
                <span className="text-base">🥉</span>
                <span>A partir de 5.000 pts</span>
              </span>
              <span className="text-[11px] font-semibold text-slate-500">1 Medalha de Bronze</span>
            </div>

            <div className={`flex items-center justify-between p-1.5 rounded-xl ${totalScore >= 10000 && totalScore < 15000 ? 'bg-slate-200/90 font-bold border border-slate-300' : ''}`}>
              <span className="flex items-center gap-1.5">
                <span className="text-base">🥈</span>
                <span>A partir de 10.000 pts</span>
              </span>
              <span className="text-[11px] font-semibold text-slate-500">1 Medalha de Prata (substitui bronze)</span>
            </div>

            <div className={`flex items-center justify-between p-1.5 rounded-xl ${totalScore >= 15000 ? 'bg-yellow-100/90 font-bold border border-yellow-300' : ''}`}>
              <span className="flex items-center gap-1.5">
                <span className="text-base">🏆</span>
                <span>A cada 15.000 pts (acumulável)</span>
              </span>
              <span className="text-[11px] font-semibold text-amber-900">1 Troféu de Ouro por nível</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Card for 8 Method Badges */}
      <div className="card-clay rounded-3xl p-4 mb-4 text-center">
        <div className="text-xs sm:text-sm font-bold font-display text-amber-900 mb-1.5">
          {t.unlockedCount(unlocked.length, ACHIEVEMENTS.length)}
        </div>
        <div className="w-full h-3 bg-amber-100 rounded-full overflow-hidden p-0.5 border border-amber-200">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all duration-500"
            style={{ width: `${(unlocked.length / ACHIEVEMENTS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Grid of 8 Achievements */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 overflow-y-auto pr-1">
        {ACHIEVEMENTS.map((ach) => {
          const isUnlocked = unlocked.includes(ach.id);
          const title = t[ach.titleKey as keyof typeof t] as string;
          const desc = t[ach.descKey as keyof typeof t] as string;

          return (
            <div
              key={ach.id}
              className={`p-3.5 rounded-2xl border-2 flex items-start gap-3 transition-all ${
                isUnlocked
                  ? 'bg-white border-amber-300 shadow-md scale-[1.01]'
                  : 'bg-slate-50/70 border-slate-200 opacity-70'
              }`}
            >
              {/* 3D Medal Icon */}
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md border-2 border-white ${
                isUnlocked
                  ? `bg-gradient-to-br ${ach.color} text-2xl`
                  : 'bg-slate-200 text-slate-400 text-xl'
              }`}>
                {isUnlocked ? ach.icon : <Lock size={18} />}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center gap-1">
                  <h4 className="font-display font-bold text-xs text-slate-900 leading-tight">
                    {title}
                  </h4>
                  {isUnlocked && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  {desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
