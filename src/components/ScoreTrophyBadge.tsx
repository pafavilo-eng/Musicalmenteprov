import React from 'react';
import { calculateScoreTrophy, getUserTotalScore } from '../services/scoreTrophyService';
import { UserProfile } from '../types';

interface ScoreTrophyBadgeProps {
  score?: number;
  user?: UserProfile | null;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'pill' | 'card' | 'inline' | 'hero';
  showLabel?: boolean;
  className?: string;
  onClick?: () => void;
}

export const ScoreTrophyBadge: React.FC<ScoreTrophyBadgeProps> = ({
  score,
  user,
  size = 'md',
  variant = 'pill',
  showLabel = true,
  className = '',
  onClick,
}) => {
  const points = typeof score === 'number' ? score : getUserTotalScore(user);
  const trophy = calculateScoreTrophy(points);

  // If no trophy earned yet
  if (trophy.type === 'none') {
    if (variant === 'hero' || variant === 'card') {
      return (
        <div
          onClick={onClick}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-100/70 border border-amber-300/80 text-amber-950 font-display text-xs font-bold shadow-2xs ${className}`}
        >
          <span>🎯</span>
          <span>Rumo ao Bronze ({points.toLocaleString()} / 5.000 pts)</span>
        </div>
      );
    }
    return null; // Don't crowd small headers or pill areas if no achievement yet
  }

  // Styling maps based on tier
  const styles = {
    bronze: {
      bg: 'bg-gradient-to-r from-amber-700 via-amber-600 to-yellow-700 text-white border-amber-500 shadow-amber-900/20',
      lightBg: 'bg-amber-100 text-amber-950 border-amber-400',
      glow: 'shadow-[0_2px_10px_rgba(217,119,6,0.25)]',
      border: 'border-2 border-amber-300',
      icon: '🥉',
      name: 'Medalha de Bronze',
    },
    silver: {
      bg: 'bg-gradient-to-r from-slate-400 via-slate-300 to-slate-500 text-slate-950 border-slate-300 shadow-slate-900/20',
      lightBg: 'bg-slate-100 text-slate-900 border-slate-300',
      glow: 'shadow-[0_2px_10px_rgba(148,163,184,0.35)]',
      border: 'border-2 border-slate-200',
      icon: '🥈',
      name: 'Medalha de Prata',
    },
    gold: {
      bg: 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-amber-950 border-amber-200 shadow-amber-500/30',
      lightBg: 'bg-yellow-100 text-amber-950 border-yellow-400',
      glow: 'shadow-[0_2px_14px_rgba(245,158,11,0.4)]',
      border: 'border-2 border-yellow-300',
      icon: '🏆',
      name: trophy.label,
    },
  }[trophy.type];

  const sizeClasses = {
    xs: 'text-[11px] px-2 py-0.5 rounded-lg gap-1',
    sm: 'text-xs px-2.5 py-1 rounded-xl gap-1.5',
    md: 'text-sm px-3.5 py-1.5 rounded-2xl gap-2 font-extrabold',
    lg: 'text-base px-4 py-2.5 rounded-2xl gap-2.5 font-extrabold',
  }[size];

  if (variant === 'inline') {
    return (
      <span
        onClick={onClick}
        title={trophy.label}
        className={`inline-flex items-center gap-1 font-display font-extrabold text-amber-950 dark:text-amber-300 ${className}`}
      >
        <span className="text-base">{styles.icon}</span>
        {trophy.type === 'gold' ? (
          <span className="tabular-nums">× {trophy.goldCount}</span>
        ) : (
          showLabel && <span>{trophy.shortLabel}</span>
        )}
      </span>
    );
  }

  if (variant === 'card') {
    return (
      <div
        onClick={onClick}
        className={`p-3.5 rounded-2xl ${styles.bg} ${styles.glow} ${styles.border} flex items-center justify-between shadow-md transition-all ${className}`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-white/25 backdrop-blur-xs flex items-center justify-center text-2xl shadow-inner">
            {styles.icon}
          </div>
          <div>
            <div className="text-[11px] font-medium opacity-90 uppercase tracking-wider">
              Conquista por Pontos
            </div>
            <div className="text-base font-extrabold font-display leading-tight">
              {styles.name}
            </div>
          </div>
        </div>

        {trophy.type === 'gold' && (
          <div className="px-3 py-1 rounded-xl bg-black/20 backdrop-blur-xs font-display font-black text-lg tracking-tight tabular-nums border border-white/20">
            {trophy.goldCount}x
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      title={`${styles.name} (${points.toLocaleString()} pontos acumulados)`}
      className={`inline-flex items-center select-none font-display ${sizeClasses} ${styles.bg} ${styles.glow} ${styles.border} shadow-sm transition-all cursor-default ${
        onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
      } ${className}`}
    >
      <span className="shrink-0 text-base">{styles.icon}</span>
      {trophy.type === 'gold' ? (
        <span className="tabular-nums font-black tracking-tight">
          × {trophy.goldCount}
        </span>
      ) : showLabel ? (
        <span className="font-extrabold tracking-tight">{trophy.shortLabel}</span>
      ) : null}
    </div>
  );
};
