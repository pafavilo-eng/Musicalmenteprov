import React, { useState, useEffect } from 'react';
import { Language, PublicPresence, UserProfile } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { soundService } from '../services/soundService';
import { getAvatarById } from '../data/avatars';
import { AvatarDisplay } from './AvatarDisplay';
import { Play, Trophy, Award, BookOpen, Settings, User, Sparkles, Flame, Users, ShieldCheck, ChevronRight } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { firebaseService, isAdminUser } from '../services/firebaseService';
import { MusicalMenteLogo } from './MusicalMenteLogo';
import { ScoreTrophyBadge } from './ScoreTrophyBadge';
import { calculateScoreTrophy, getUserTotalScore } from '../services/scoreTrophyService';

interface HomeHubProps {
  currentUser: UserProfile;
  lang: Language;
  onStartQuiz: () => void;
  onOpenRanking: () => void;
  onOpenProfile: () => void;
  onOpenAchievements: () => void;
  onOpenHowToPlay: () => void;
  onOpenSettings: () => void;
  onOpenOnlineUsers: () => void;
  onOpenDeveloperArea?: () => void;
}

export const HomeHub: React.FC<HomeHubProps> = ({
  currentUser,
  lang,
  onStartQuiz,
  onOpenRanking,
  onOpenProfile,
  onOpenAchievements,
  onOpenHowToPlay,
  onOpenSettings,
  onOpenOnlineUsers,
  onOpenDeveloperArea,
}) => {
  const t = TRANSLATIONS[lang];
  const avatar = getAvatarById(currentUser.avatarId);
  const isDevAdmin = isAdminUser(currentUser);

  // Live online users count
  const [onlineCount, setOnlineCount] = useState<number>(1);
  const [previewAvatars, setPreviewAvatars] = useState<string[]>([]);

  useEffect(() => {
    const unsub = firebaseService.subscribeToPublicPresence((list) => {
      const activeList = list.filter((p) => p.isOnline);
      // Ensure at least 1 (the current user)
      const count = Math.max(1, activeList.length);
      setOnlineCount(count);

      // Extract up to 3 avatars for preview
      const avs = activeList.slice(0, 3).map((p) => p.avatarId);
      setPreviewAvatars(avs.length > 0 ? avs : [currentUser.avatarId]);
    });

    return () => {
      unsub();
    };
  }, [currentUser.avatarId]);

  return (
    <div
      className="w-full max-w-md mx-auto flex flex-col min-h-screen px-3.5 pt-3 select-none"
      style={{
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px) + 2rem, 3rem)',
        paddingLeft: 'max(env(safe-area-inset-left, 0px), 0.875rem)',
        paddingRight: 'max(env(safe-area-inset-right, 0px), 0.875rem)',
      }}
    >
      {/* 🌟 MENSAGEM DE BOAS-VINDAS PERSONALIZADA COM NOME REAL */}
      <div className="mb-3 p-3.5 rounded-2xl bg-white border-2 border-blue-200/80 shadow-xs flex items-center justify-between gap-3 transition-all">
        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-extrabold font-display text-blue-950 truncate">
            {t.welcomeGreeting ? t.welcomeGreeting(currentUser.name) : `Olá, ${currentUser.name}!`} 👋
          </h2>
          <p className="text-xs text-blue-700 font-medium mt-0.5">
            {t.welcomeSubtitle || 'Seja bem-vindo ao Quiz Musical!'}
          </p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0 text-xl shadow-xs">
          🎼
        </div>
      </div>

      {/* 3D Hero Scene Container */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl border-3 border-blue-400 bg-blue-100 mb-3 aspect-16/9 flex flex-col justify-end p-4 text-white">
        <img
          src="/assets/images/hero_fermata_world.jpg"
          alt="Mundo 3D MusicalMente"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Measured dark gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/35 to-transparent"></div>

        {/* Floating notes */}
        <span className="absolute top-3 left-4 text-2xl animate-float-note">🎵</span>
        <span className="absolute top-6 right-5 text-2xl animate-float-note" style={{ animationDelay: '1.2s' }}>🎶</span>
        <span className="absolute top-12 left-1/3 text-xl animate-float-note" style={{ animationDelay: '0.6s' }}>𝄞</span>

        {/* Content over Hero */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-500 text-white text-xs font-display font-extrabold uppercase tracking-wider mb-1 shadow-sm border border-blue-300">
            <span>🌟</span> MSA Fase 1
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display leading-tight drop-shadow-md">
            <MusicalMenteLogo variant="hero" />
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 font-medium drop-shadow">
            “{t.slogan}”
          </p>
        </div>
      </div>

      {/* 🏆 PLAYER SCORE & TROPHY CARD */}
      <div className="mb-3">
        <button
          type="button"
          onClick={() => {
            soundService.playTap();
            onOpenProfile();
          }}
          className="w-full p-3 rounded-2xl bg-white hover:bg-blue-50/60 border-2 border-blue-200/90 hover:border-blue-400 font-display flex items-center justify-between shadow-xs transition-all cursor-pointer group active:scale-[0.98]"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <AvatarDisplay
              avatar={avatar}
              photoUrl={currentUser.photoUrl}
              size="sm"
              className="w-10 h-10 rounded-xl border-2 border-blue-300 shrink-0"
            />
            <div className="text-left min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-extrabold text-sm text-slate-800 truncate">
                  {currentUser.name}
                </span>
                <ScoreTrophyBadge user={currentUser} size="xs" variant="pill" />
              </div>
              <div className="text-xs text-blue-900 font-semibold tabular-nums flex items-center gap-1">
                <span>⭐ {t.totalAccumulatedScore}:</span>
                <span className="font-black text-blue-950 font-display text-sm">
                  {getUserTotalScore(currentUser).toLocaleString()}
                </span>
                <span className="text-[11px] font-medium text-slate-500">{t.points}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0">
            <ChevronRight size={18} />
          </div>
        </button>
      </div>

      {/* Primary Big Call-to-Action: JOGAR AGORA */}
      <div className="mb-3">
        <button
          type="button"
          onClick={() => {
            soundService.playTap();
            onStartQuiz();
          }}
          className="w-full py-4 px-6 rounded-2xl text-white font-display font-extrabold text-lg sm:text-xl btn-3d-amber flex items-center justify-center gap-3 cursor-pointer shadow-xl tracking-wide group"
        >
          <div className="w-10 h-10 rounded-xl bg-white/25 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Play size={24} className="fill-current ml-0.5" />
          </div>
          <span>{t.play}</span>
          <span className="text-amber-200 text-lg">🎵</span>
        </button>
      </div>

      {/* 🟢 SEÇÃO: USUÁRIOS ONLINE (Exibe quem está online em tempo real) */}
      <div className="mb-3">
        <button
          type="button"
          onClick={() => {
            soundService.playTap();
            onOpenOnlineUsers();
          }}
          className="w-full p-3 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-amber-50/60 border-2 border-emerald-300 hover:border-emerald-400 font-display flex items-center justify-between shadow-xs transition-all cursor-pointer group active:scale-[0.98]"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
              <Users size={18} />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{t.onlineUsers}</span>
              </div>
              <div className="text-[10px] text-emerald-700 font-medium">
                {onlineCount === 1 ? '1 Músico ativo agora' : `${onlineCount} Músicos ativos agora`}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Mini avatar stack preview */}
            <div className="flex -space-x-1.5 overflow-hidden">
              {previewAvatars.map((avId, idx) => (
                <AvatarDisplay
                  key={idx}
                  avatar={avId}
                  size="xs"
                  className="w-6 h-6 border-2 border-white inline-block shadow-2xs"
                />
              ))}
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-xl">
              Ver lista 🟢
            </span>
          </div>
        </button>
      </div>

      {/* PWA Install Banner */}
      <div className="mb-3">
        <PWAInstallButton lang={lang} variant="banner" />
      </div>

      {/* Secondary Grid Buttons: RANKING, PERFIL, CONQUISTAS, COMO JOGAR */}
      <div className="grid grid-cols-2 gap-2.5 mb-3">
        {/* RANKING */}
        <button
          type="button"
          onClick={() => {
            soundService.playTap();
            onOpenRanking();
          }}
          className="p-3.5 rounded-2xl bg-white hover:bg-blue-50/70 border-2 border-blue-200/80 hover:border-blue-400 font-display text-left flex items-center gap-3 shadow-xs transition-all cursor-pointer group active:scale-[0.98]"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-100 group-hover:bg-blue-500 group-hover:text-white text-blue-800 flex items-center justify-center shrink-0 border border-blue-200 transition-colors">
            <Trophy size={20} />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-sm text-slate-800 truncate">
              {t.ranking}
            </div>
            <div className="text-[11px] text-slate-500 truncate">
              Top Músicos
            </div>
          </div>
        </button>

        {/* CONQUISTAS */}
        <button
          type="button"
          onClick={() => {
            soundService.playTap();
            onOpenAchievements();
          }}
          className="p-3.5 rounded-2xl bg-white hover:bg-blue-50/70 border-2 border-blue-200/80 hover:border-blue-400 font-display text-left flex items-center gap-3 shadow-xs transition-all cursor-pointer group active:scale-[0.98]"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-100 group-hover:bg-amber-400 group-hover:text-amber-950 text-amber-800 flex items-center justify-center shrink-0 border border-amber-200 transition-colors">
            <Award size={20} />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-sm text-slate-800 truncate">
              {t.achievements}
            </div>
            <div className="text-[11px] text-slate-500 truncate">
              {currentUser.unlockedAchievements?.length || 0}/8 Medalhas
            </div>
          </div>
        </button>

        {/* MEU PERFIL */}
        <button
          type="button"
          onClick={() => {
            soundService.playTap();
            onOpenProfile();
          }}
          className="p-3.5 rounded-2xl bg-white hover:bg-blue-50/70 border-2 border-blue-200/80 hover:border-blue-400 font-display text-left flex items-center gap-3 shadow-xs transition-all cursor-pointer group active:scale-[0.98]"
        >
          <div className="w-10 h-10 rounded-xl bg-sky-100 group-hover:bg-sky-500 group-hover:text-white text-sky-800 flex items-center justify-center shrink-0 border border-sky-200 transition-colors">
            <User size={20} />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-sm text-slate-800 truncate">
              {t.profile}
            </div>
            <div className="text-[11px] text-slate-500 truncate">
              Avatar & Conta
            </div>
          </div>
        </button>

        {/* COMO JOGAR */}
        <button
          type="button"
          onClick={() => {
            soundService.playTap();
            onOpenHowToPlay();
          }}
          className="p-3.5 rounded-2xl bg-white hover:bg-blue-50/70 border-2 border-blue-200/80 hover:border-blue-400 font-display text-left flex items-center gap-3 shadow-xs transition-all cursor-pointer group active:scale-[0.98]"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-100 group-hover:bg-indigo-500 group-hover:text-white text-indigo-800 flex items-center justify-center shrink-0 border border-indigo-200 transition-colors">
            <BookOpen size={20} />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-sm text-slate-800 truncate">
              {t.howToPlay}
            </div>
            <div className="text-[11px] text-slate-500 truncate">
              8 Passos Fáceis
            </div>
          </div>
        </button>
      </div>

      {/* ⚙️ ÁREA DO DESENVOLVEDOR (Exclusiva para administradores) */}
      {isDevAdmin && (
        <div className="mb-3">
          <button
            type="button"
            onClick={() => {
              soundService.playTap();
              if (onOpenDeveloperArea) onOpenDeveloperArea();
            }}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-600 hover:to-amber-600 text-slate-950 font-display font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-md border-2 border-amber-300 cursor-pointer transition-all active:scale-[0.98]"
          >
            <span className="text-xl">⚙️</span>
            <span>{t.developerArea}</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-bold">
              Admin
            </span>
          </button>
        </div>
      )}

      {/* Settings Row */}
      <button
        type="button"
        onClick={() => {
          soundService.playTap();
          onOpenSettings();
        }}
        className="w-full py-3 px-4 rounded-2xl bg-slate-100/90 hover:bg-slate-200/90 text-slate-700 font-display font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
      >
        <Settings size={18} />
        <span>{t.settings}</span>
      </button>
    </div>
  );
};
