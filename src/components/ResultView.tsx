import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { ClefType, Language, MatchResult, UserProfile } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { soundService } from '../services/soundService';
import { getAvatarById } from '../data/avatars';
import { AvatarDisplay } from './AvatarDisplay';
import { ShareCardModal } from './ShareCardModal';
import { Trophy, RotateCcw, Award, Share2, Home, Flame, Clock, CheckCircle, XCircle, Star } from 'lucide-react';
import { ScoreTrophyBadge } from './ScoreTrophyBadge';
import { getUserTotalScore } from '../services/scoreTrophyService';

interface ResultViewProps {
  result: MatchResult;
  currentUser: UserProfile;
  lang: Language;
  selectedClef?: ClefType;
  onPlayAgain: () => void;
  onViewRanking: () => void;
  onGoHome: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({
  result,
  currentUser,
  lang,
  selectedClef,
  onPlayAgain,
  onViewRanking,
  onGoHome,
}) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const t = TRANSLATIONS[lang];
  const avatar = getAvatarById(currentUser.avatarId);

  // Play celebration effects
  useEffect(() => {
    soundService.playVictory();

    // Trigger colorful confetti shower
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#fbbf24', '#f59e0b', '#6366f1', '#10b981', '#ec4899'],
    });

    const timer = setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      });
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  const incorrectCount = result.totalQuestions - result.correctCount;
  const isNewRecord = result.score > (currentUser.highScore || 0);

  return (
    <div
      className="w-full max-w-md mx-auto flex flex-col min-h-screen px-3.5 pt-4 select-none"
      style={{
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px) + 2.5rem, 3.5rem)',
        paddingLeft: 'max(env(safe-area-inset-left, 0px), 0.875rem)',
        paddingRight: 'max(env(safe-area-inset-right, 0px), 0.875rem)',
      }}
    >
      {/* 3D Celebration Banner */}
      <div className="text-center relative mb-5">
        {/* Animated 3D Floating Trophy */}
        <div className="relative inline-block mx-auto mb-2 animate-pulse-glow">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 shadow-2xl border-4 border-white flex items-center justify-center">
            <Trophy className="w-14 h-14 text-amber-950 drop-shadow-md" />
          </div>
          <span className="absolute -top-3 -right-3 text-3xl">✨</span>
          <span className="absolute -bottom-2 -left-3 text-2xl">🎵</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold font-display text-indigo-950">
          {t.matchCompleted}
        </h1>

        {selectedClef && (
          <div className="inline-flex items-center gap-1.5 mt-1.5 px-3 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200 text-xs font-bold font-display">
            <span>{selectedClef === 'sol' ? '𝄞 Clave de Sol' : selectedClef === 'fa' ? '𝄢 Clave de Fá' : '𝄡 Clave de Dó'}</span>
          </div>
        )}

        {isNewRecord && (
          <div className="inline-block mt-1 px-3 py-1 bg-amber-400 text-amber-950 text-xs font-display font-extrabold rounded-full shadow-sm animate-bounce">
            🌟 {t.newRecord}
          </div>
        )}
      </div>

      {/* Main Score Claymorphism Card */}
      <div className="card-clay rounded-3xl p-5 mb-5 text-center">
        {/* Avatar Profile Lockup */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <AvatarDisplay
            avatar={avatar}
            size="lg"
            className="w-14 h-14"
          />
          <div className="text-left">
            <h3 className="font-display font-bold text-base text-slate-900">
              {currentUser.name}
            </h3>
            <p className="text-xs text-slate-500">
              {avatar.name} ({avatar.instrumentOrRole})
            </p>
          </div>
        </div>

        {/* Big Score Display */}
        <div className="py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-100 via-yellow-100/70 to-amber-50 border border-amber-300 mb-4 shadow-inner">
          <span className="text-xs sm:text-sm font-bold text-amber-800 uppercase tracking-wider block font-display">
            {t.finalScore}
          </span>
          <span className="text-4xl sm:text-5xl font-black font-display text-amber-950 tabular-nums">
            {result.score}
          </span>
          <span className="text-xs font-semibold text-amber-700 ml-1">
            {t.points}
          </span>

          {/* Cumulative Total Score & Current Trophy Badge */}
          <div className="mt-2.5 pt-2.5 border-t border-amber-200/80 flex items-center justify-between gap-2 flex-wrap">
            <div className="text-xs text-amber-900 font-bold flex items-center gap-1.5">
              <Star size={15} className="fill-amber-400 text-amber-600" />
              <span>{t.totalAccumulatedScore}:</span>
              <span className="font-extrabold text-amber-950 tabular-nums">
                {getUserTotalScore(currentUser).toLocaleString()} pts
              </span>
            </div>
            <ScoreTrophyBadge user={currentUser} size="sm" variant="pill" />
          </div>
        </div>

        {/* 2x2 Grid of Performance Metrics */}
        <div className="grid grid-cols-2 gap-2.5 text-left">
          {/* Correct vs Incorrect */}
          <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <div className="text-[10px] text-emerald-800 font-semibold">{t.correctAnswers}</div>
              <div className="text-sm font-bold font-display text-emerald-950 tabular-nums">
                {result.correctCount} / {result.totalQuestions}
              </div>
            </div>
          </div>

          {/* Accuracy */}
          <div className="p-2.5 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center gap-2">
            <Award className="w-6 h-6 text-indigo-600 shrink-0" />
            <div>
              <div className="text-[10px] text-indigo-800 font-semibold">{t.accuracy}</div>
              <div className="text-sm font-bold font-display text-indigo-950 tabular-nums">
                {result.accuracy}%
              </div>
            </div>
          </div>

          {/* Highest Combo */}
          <div className="p-2.5 rounded-2xl bg-orange-50 border border-orange-100 flex items-center gap-2">
            <Flame className="w-6 h-6 text-orange-600 shrink-0" />
            <div>
              <div className="text-[10px] text-orange-800 font-semibold">{t.highestCombo}</div>
              <div className="text-sm font-bold font-display text-orange-950 tabular-nums">
                {result.maxCombo}x
              </div>
            </div>
          </div>

          {/* Total Time */}
          <div className="p-2.5 rounded-2xl bg-sky-50 border border-sky-100 flex items-center gap-2">
            <Clock className="w-6 h-6 text-sky-600 shrink-0" />
            <div>
              <div className="text-[10px] text-sky-800 font-semibold">{t.totalTime}</div>
              <div className="text-sm font-bold font-display text-sky-950 tabular-nums">
                {result.totalTimeSeconds} {t.secondsShort}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {/* Play Again (Primary 3D button) */}
        <button
          type="button"
          onClick={() => {
            soundService.playTap();
            onPlayAgain();
          }}
          className="w-full py-3.5 px-4 rounded-2xl text-white font-display font-bold text-base btn-3d-amber flex items-center justify-center gap-2 cursor-pointer shadow-lg"
        >
          <RotateCcw size={18} />
          <span>{t.playAgain}</span>
        </button>

        {/* View Ranking */}
        <button
          type="button"
          onClick={() => {
            soundService.playTap();
            onViewRanking();
          }}
          className="w-full py-3 px-4 rounded-2xl text-white font-display font-bold text-sm btn-3d-indigo flex items-center justify-center gap-2 cursor-pointer shadow-md"
        >
          <Trophy size={16} />
          <span>{t.ranking}</span>
        </button>

        {/* Share Button */}
        <button
          type="button"
          onClick={() => {
            soundService.playTap();
            setShowShareModal(true);
          }}
          className="w-full py-3 px-4 rounded-2xl text-slate-800 font-display font-bold text-sm btn-3d-white flex items-center justify-center gap-2 cursor-pointer border border-slate-200"
        >
          <Share2 size={16} className="text-amber-500" />
          <span>{t.shareResult}</span>
        </button>

        {/* Home Menu */}
        <button
          type="button"
          onClick={() => {
            soundService.playTap();
            onGoHome();
          }}
          className="w-full py-2.5 text-center text-xs font-display font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
        >
          {t.returnToMenu}
        </button>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <ShareCardModal
          currentUser={currentUser}
          matchResult={result}
          lang={lang}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
};
