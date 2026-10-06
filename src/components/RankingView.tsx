import React, { useState, useEffect } from 'react';
import { Language, RankingEntry } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { soundService } from '../services/soundService';
import { getAvatarById } from '../data/avatars';
import { AvatarDisplay } from './AvatarDisplay';
import { Trophy, ShieldCheck, ArrowLeft, Radio, Loader2 } from 'lucide-react';
import { ScoreTrophyBadge } from './ScoreTrophyBadge';
import { firebaseService } from '../services/firebaseService';

interface RankingViewProps {
  lang: Language;
  onBack: () => void;
}

export const RankingView: React.FC<RankingViewProps> = ({ lang, onBack }) => {
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const t = TRANSLATIONS[lang];

  // Subscribe to REAL-TIME Firestore ranking
  useEffect(() => {
    setIsLoading(true);
    const unsub = firebaseService.subscribeToLiveRanking((liveList) => {
      setRankings(liveList);
      setIsLoading(false);
    });

    return () => {
      unsub();
    };
  }, []);

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
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => {
            soundService.playTap();
            onBack();
          }}
          className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 shadow-sm border border-slate-200 cursor-pointer transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-1.5">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-bold font-display text-indigo-950">
            {t.rankingTitle}
          </h2>
        </div>
        <div className="w-8"></div>
      </div>

      {/* Real-time sync badge */}
      <div className="flex items-center justify-between px-3 py-1.5 mb-3 rounded-xl bg-blue-50/80 border border-blue-200/70 text-xs font-semibold text-blue-900">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Tempo Real</span>
        </div>
        <span className="text-[11px] text-blue-700/80 font-medium">
          {rankings.length} {rankings.length === 1 ? 'músico conectado' : 'músicos conectados'}
        </span>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex-1 flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="text-xs font-medium">Carregando ranking em tempo real...</span>
        </div>
      )}

      {/* Top 3 Podium Highlights if available */}
      {!isLoading && rankings.length >= 3 && (
        <div className="flex items-end justify-center gap-2 mb-4 px-2 pt-6 pb-2">
          {/* 2nd place */}
          <div className="flex flex-col items-center flex-1">
            <div className="relative mb-1">
              <AvatarDisplay
                avatar={rankings[1].avatarId}
                photoUrl={rankings[1].photoUrl}
                size="md"
                className="w-12 h-12 rounded-2xl border-2 border-slate-300 shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-300 text-slate-800 text-[10px] font-bold font-display flex items-center justify-center border border-white">
                2
              </span>
            </div>
            <span className="text-[11px] font-display font-bold text-slate-800 truncate max-w-[80px]">
              {rankings[1].name}
            </span>
            <span className="text-[10px] font-bold text-blue-800 tabular-nums">
              {(rankings[1].totalScore || rankings[1].score).toLocaleString()} {t.points}
            </span>
          </div>

          {/* 1st place */}
          <div className="flex flex-col items-center flex-1 -mt-4">
            <div className="relative mb-1">
              <AvatarDisplay
                avatar={rankings[0].avatarId}
                photoUrl={rankings[0].photoUrl}
                size="lg"
                className="w-16 h-16 rounded-2xl border-3 border-amber-400 shadow-xl ring-4 ring-amber-300/40"
              />
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xl">👑</span>
              <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-400 text-amber-950 text-xs font-bold font-display flex items-center justify-center border border-white shadow">
                1
              </span>
            </div>
            <span className="text-xs font-display font-bold text-slate-900 truncate max-w-[90px]">
              {rankings[0].name}
            </span>
            <span className="text-xs font-extrabold text-blue-900 tabular-nums">
              {(rankings[0].totalScore || rankings[0].score).toLocaleString()} {t.points}
            </span>
          </div>

          {/* 3rd place */}
          <div className="flex flex-col items-center flex-1">
            <div className="relative mb-1">
              <AvatarDisplay
                avatar={rankings[2].avatarId}
                photoUrl={rankings[2].photoUrl}
                size="md"
                className="w-12 h-12 rounded-2xl border-2 border-amber-600 shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-600 text-white text-[10px] font-bold font-display flex items-center justify-center border border-white">
                3
              </span>
            </div>
            <span className="text-[11px] font-display font-bold text-slate-800 truncate max-w-[80px]">
              {rankings[2].name}
            </span>
            <span className="text-[10px] font-bold text-blue-800 tabular-nums">
              {(rankings[2].totalScore || rankings[2].score).toLocaleString()} {t.points}
            </span>
          </div>
        </div>
      )}

      {/* Leaderboard List */}
      {!isLoading && (
        <div className="space-y-2 flex-1 overflow-y-auto">
          {rankings.map((entry, idx) => {
            const displayScore = entry.totalScore ?? entry.score;
            return (
              <div
                key={entry.id || entry.userId || idx}
                className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-blue-300 transition-colors"
              >
                {/* Position */}
                <div className="w-6 text-center font-display font-extrabold text-sm text-slate-500 tabular-nums">
                  {idx + 1}
                </div>

                {/* Avatar */}
                <AvatarDisplay
                  avatar={entry.avatarId}
                  photoUrl={entry.photoUrl}
                  size="md"
                  className="w-11 h-11 rounded-xl"
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-display font-bold text-xs text-slate-800 truncate">
                    {entry.name}
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-2">
                    {entry.correctCount > 0 && (
                      <span>{entry.correctCount} acertos</span>
                    )}
                    {entry.accuracy > 0 && (
                      <>
                        <span>•</span>
                        <span>{entry.accuracy}% precisão</span>
                      </>
                    )}
                    {entry.maxCombo > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-orange-500 font-bold">🔥 {entry.maxCombo}x</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Score & Trophy */}
                <div className="text-right flex flex-col items-end gap-0.5">
                  <ScoreTrophyBadge score={displayScore} size="xs" variant="pill" />
                  <span className="font-display font-extrabold text-base text-blue-950 tabular-nums">
                    {displayScore.toLocaleString()}
                  </span>
                  <span className="block text-[10px] text-slate-400 uppercase font-sans">
                    {t.points}
                  </span>
                </div>
              </div>
            );
          })}

          {rankings.length === 0 && (
            <div className="text-center py-16 px-4 bg-white/70 rounded-3xl border border-dashed border-slate-200">
              <span className="text-3xl block mb-2">🎼</span>
              <p className="font-display font-bold text-slate-700 text-sm mb-1">
                Nenhum jogador pontuou ainda
              </p>
              <p className="text-xs text-slate-500">
                Responda às perguntas do Quiz para ser o primeiro no ranking em tempo real!
              </p>
            </div>
          )}
        </div>
      )}

      {/* Real-time database assurance */}
      <div className="mt-4 p-2.5 rounded-2xl bg-blue-50/70 border border-blue-200/60 flex items-center gap-2 text-[10px] text-blue-900">
        <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
        <span>Ranking oficial sincronizado diretamente com o banco de dados. Sem usuários fictícios.</span>
      </div>
    </div>
  );
};
