import { ScoreTrophyAchievement } from '../types';

/**
 * Calculates the total score for a user profile, safely falling back to highScore
 * if totalScore has not yet been initialized.
 */
export function getUserTotalScore(user?: { totalScore?: number; highScore?: number } | null): number {
  if (!user) return 0;
  if (typeof user.totalScore === 'number' && !isNaN(user.totalScore) && user.totalScore > 0) {
    return user.totalScore;
  }
  if (typeof user.highScore === 'number' && !isNaN(user.highScore)) {
    return user.highScore;
  }
  return 0;
}

/**
 * Regras do Sistema de Medalhas e Troféus por Pontuação:
 *
 * 1. ATÉ 4.999 PONTOS:
 *    - Nenhuma medalha/troféu.
 *
 * 2. A PARTIR DE 5.000 PONTOS (até 9.999 pontos):
 *    - Conceder 1 MEDALHA DE BRONZE (🥉).
 *
 * 3. A PARTIR DE 10.000 PONTOS (até 14.999 pontos):
 *    - A medalha de bronze é SUBSTITUÍDA por 1 MEDALHA DE PRATA (🥈).
 *    - Não mostrar bronze e prata simultaneamente.
 *
 * 4. A PARTIR DE 15.000 PONTOS:
 *    - A medalha de prata é SUBSTITUÍDA por 1 TROFÉU DE OURO (🏆).
 *    - A partir de 15.000 pontos, o troféu de ouro passa a ser ACUMULÁVEL.
 *
 * Fórmula de Acumulação do Ouro:
 * Quantidade de troféus de ouro = parte inteira da pontuação total ÷ 15.000 (Math.floor(pontuacao / 15000)).
 *
 * Exemplos:
 *  - 14.999 pontos -> medalha de prata
 *  - 15.000 pontos -> 1 troféu de ouro (🏆 × 1)
 *  - 16.500 pontos -> 1 troféu de ouro (🏆 × 1)
 *  - 29.999 pontos -> 1 troféu de ouro (🏆 × 1)
 *  - 30.000 pontos -> 2 troféus de ouro (🏆 × 2)
 *  - 44.999 pontos -> 2 troféus de ouro (🏆 × 2)
 *  - 45.000 pontos -> 3 troféus de ouro (🏆 × 3)
 *  - 60.000 pontos -> 4 troféus de ouro (🏆 × 4)
 *  - 100.000 pontos -> 6 troféus de ouro (🏆 × 6)
 */
export function calculateScoreTrophy(score: number): ScoreTrophyAchievement {
  const points = Math.max(0, Math.floor(score || 0));

  // ATÉ 4.999 PONTOS
  if (points < 5000) {
    return {
      type: 'none',
      label: 'Rumo à Medalha de Bronze',
      shortLabel: '',
      goldCount: 0,
      iconEmoji: '',
      badgeText: '',
      nextGoal: {
        targetPoints: 5000,
        pointsRemaining: 5000 - points,
        nextTierName: 'Medalha de Bronze',
      },
    };
  }

  // A PARTIR DE 5.000 PONTOS (até 9.999)
  if (points < 10000) {
    return {
      type: 'bronze',
      label: 'Medalha de Bronze',
      shortLabel: 'Bronze',
      goldCount: 0,
      iconEmoji: '🥉',
      badgeText: '🥉 Bronze',
      nextGoal: {
        targetPoints: 10000,
        pointsRemaining: 10000 - points,
        nextTierName: 'Medalha de Prata',
      },
    };
  }

  // A PARTIR DE 10.000 PONTOS (até 14.999)
  if (points < 15000) {
    return {
      type: 'silver',
      label: 'Medalha de Prata',
      shortLabel: 'Prata',
      goldCount: 0,
      iconEmoji: '🥈',
      badgeText: '🥈 Prata',
      nextGoal: {
        targetPoints: 15000,
        pointsRemaining: 15000 - points,
        nextTierName: 'Troféu de Ouro',
      },
    };
  }

  // A PARTIR DE 15.000 PONTOS (Acumulável)
  const goldCount = Math.floor(points / 15000);
  const nextTarget = (goldCount + 1) * 15000;

  return {
    type: 'gold',
    label: goldCount === 1 ? '1 Troféu de Ouro' : `${goldCount} Troféus de Ouro`,
    shortLabel: 'Ouro',
    goldCount,
    iconEmoji: '🏆',
    badgeText: `🏆 × ${goldCount}`,
    nextGoal: {
      targetPoints: nextTarget,
      pointsRemaining: nextTarget - points,
      nextTierName: `${goldCount + 1}º Troféu de Ouro`,
    },
  };
}
