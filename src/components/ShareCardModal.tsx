import React, { useState } from 'react';
import { Language, MatchResult, UserProfile } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { soundService } from '../services/soundService';
import { getAvatarById } from '../data/avatars';
import { AvatarDisplay } from './AvatarDisplay';
import { X, Share2, Copy, Check, Sparkles } from 'lucide-react';
import { MusicalMenteLogo } from './MusicalMenteLogo';
import { ScoreTrophyBadge } from './ScoreTrophyBadge';
import { calculateScoreTrophy, getUserTotalScore } from '../services/scoreTrophyService';

interface ShareCardModalProps {
  currentUser: UserProfile;
  matchResult: MatchResult;
  lang: Language;
  onClose: () => void;
}

export const ShareCardModal: React.FC<ShareCardModalProps> = ({
  currentUser,
  matchResult,
  lang,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const t = TRANSLATIONS[lang];
  const avatar = getAvatarById(currentUser.avatarId);

  const shareText = `🎵 MusicalMente — ${t.iPlayedFermataQuiz}\n👤 ${currentUser.name}\n⭐ ${matchResult.score} ${t.points} | ${matchResult.correctCount}/20 ${t.correctAnswers} (${matchResult.accuracy}%)\n🔥 ${t.combo}: ${matchResult.maxCombo}x\n“${t.slogan}”`;

  const handleNativeShare = async () => {
    soundService.playTap();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'MusicalMente — Quiz Musical MSA Fase 1',
          text: shareText,
          url: window.location.href,
        });
      } catch {
        // user cancelled or share unsupported
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    soundService.playTap();
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto"
      style={{
        paddingTop: 'max(env(safe-area-inset-top, 0px), 1rem)',
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 1rem)',
        paddingLeft: 'max(env(safe-area-inset-left, 0px), 1rem)',
        paddingRight: 'max(env(safe-area-inset-right, 0px), 1rem)',
      }}
    >
      <div className="relative w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border-4 border-amber-300 max-h-[90vh] flex flex-col my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="text-lg font-bold font-display text-indigo-950 flex items-center gap-1.5">
            <Share2 className="w-5 h-5 text-amber-500" />
            {t.shareCardTitle}
          </h3>
          <button
            onClick={() => {
              soundService.playTap();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Visual Share Card */}
        <div className="mt-4 p-5 rounded-3xl bg-gradient-to-br from-amber-400 via-orange-400 to-indigo-600 text-white shadow-xl relative overflow-hidden">
          {/* Subtle background notes */}
          <span className="absolute top-2 right-4 text-4xl opacity-20">🎵</span>
          <span className="absolute bottom-2 left-4 text-4xl opacity-20">🎼</span>

          <div className="relative z-10 flex flex-col items-center text-center">
            {/* Logo */}
            <div className="flex items-center gap-1 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-display font-bold tracking-wider mb-3">
              <span>🎵</span> <MusicalMenteLogo variant="card" />
            </div>

            {/* Avatar */}
            <AvatarDisplay
              avatar={avatar}
              size="xl"
              className="w-20 h-20 rounded-2xl border-3 border-white shadow-lg mb-2"
            />

            <div className="text-lg font-bold font-display text-white">
              {currentUser.name}
            </div>
            <div className="text-xs text-amber-100 font-medium mb-2">
              {avatar.name} ({avatar.instrumentOrRole})
            </div>

            {/* Score Trophy Badge */}
            <div className="mb-3">
              <ScoreTrophyBadge user={currentUser} size="xs" variant="pill" />
            </div>

            {/* Score Box */}
            <div className="w-full grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-black/20 backdrop-blur-sm text-center">
              <div>
                <div className="text-[10px] text-amber-200 font-medium">{t.score}</div>
                <div className="text-base font-bold font-display">{matchResult.score}</div>
              </div>
              <div>
                <div className="text-[10px] text-amber-200 font-medium">{t.accuracy}</div>
                <div className="text-base font-bold font-display">{matchResult.accuracy}%</div>
              </div>
              <div>
                <div className="text-[10px] text-amber-200 font-medium">{t.combo}</div>
                <div className="text-base font-bold font-display">{matchResult.maxCombo}x</div>
              </div>
            </div>

            {/* Slogan */}
            <p className="mt-3 text-[11px] text-amber-100 font-medium italic">
              “{t.iPlayedFermataQuiz}”
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 space-y-2">
          <button
            type="button"
            onClick={handleNativeShare}
            className="w-full py-3 px-4 rounded-xl text-white font-display font-bold text-sm btn-3d-amber flex items-center justify-center gap-2 cursor-pointer"
          >
            <Share2 size={16} />
            <span>{t.shareViaSystem}</span>
          </button>

          <button
            type="button"
            onClick={copyToClipboard}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-display font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
            <span>{copied ? t.shareCopySuccess : t.copySummary}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
