import React, { useState, useEffect, useRef } from 'react';
import { ClefType, Language, MatchResult, ShuffledQuestion, UserProfile } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { soundService } from '../services/soundService';
import { getAvatarById } from '../data/avatars';
import { AvatarDisplay } from './AvatarDisplay';
import { StaffVisualizer } from './StaffVisualizer';
import { FeedbackModal } from './FeedbackModal';
import { Timer, Flame, Award, HelpCircle, Music2 } from 'lucide-react';
import { firebaseService } from '../services/firebaseService';

interface QuizViewProps {
  questions: ShuffledQuestion[];
  currentUser: UserProfile;
  lang: Language;
  selectedClef?: ClefType;
  onFinishMatch: (result: MatchResult) => void;
  onExitQuiz: () => void;
}

const QUESTION_TIME_LIMIT = 30; // 30 seconds per question

export const QuizView: React.FC<QuizViewProps> = ({
  questions,
  currentUser,
  lang,
  selectedClef,
  onFinishMatch,
  onExitQuiz,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_LIMIT);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isTimeout, setIsTimeout] = useState(false);
  const [lastPointsEarned, setLastPointsEarned] = useState(0);

  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<any>(null);

  const t = TRANSLATIONS[lang];
  const currentQ = questions[currentIndex];
  const avatar = getAvatarById(currentUser.avatarId);

  // Timer countdown
  useEffect(() => {
    if (showFeedback) return;

    setTimeLeft(QUESTION_TIME_LIMIT);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, showFeedback]);

  // Handle timeout (30 seconds expired)
  const handleTimeout = () => {
    setIsTimeout(true);
    setSelectedOption(null);
    setCombo(0);
    setLastPointsEarned(0);
    soundService.playIncorrect();
    setShowFeedback(true);

    if (currentUser?.id) {
      firebaseService.recordAnswerScore({
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatarId: currentUser.avatarId,
        photoUrl: currentUser.photoUrl,
        questionId: currentQ.id,
        isCorrect: false,
        pointsAdded: 0,
        currentTotalScore: currentUser.totalScore || 0,
        matchScore: score,
        clef: currentQ.clave || selectedClef,
        reason: 'Tempo esgotado',
        combo: 0,
        accuracy: Math.round((correctCount / (currentIndex + 1)) * 100),
        totalCorrect: currentUser.totalCorrect || 0,
      });
    }
  };

  // Option selection
  const handleSelectOption = (idx: number) => {
    if (selectedOption !== null || showFeedback) return;
    if (timerRef.current) clearInterval(timerRef.current);

    setSelectedOption(idx);
    const isCorrect = idx === currentQ.correctOptionIndex;
    let points = 0;

    if (isCorrect) {
      const newCombo = combo + 1;
      setCombo(newCombo);
      if (newCombo > maxCombo) setMaxCombo(newCombo);
      const newCorrectCount = correctCount + 1;
      setCorrectCount(newCorrectCount);

      // Scoring: base 100 + speed bonus up to 50 + combo bonus
      let comboMultiplier = 1.0;
      if (newCombo === 2) comboMultiplier = 1.2;
      else if (newCombo === 3) comboMultiplier = 1.5;
      else if (newCombo === 4) comboMultiplier = 2.0;
      else if (newCombo >= 5) comboMultiplier = 2.5;

      const speedBonus = Math.floor((timeLeft / QUESTION_TIME_LIMIT) * 50);
      points = Math.round((100 + speedBonus) * comboMultiplier);

      setLastPointsEarned(points);
      const newScore = score + points;
      setScore(newScore);

      if (newCombo >= 3) {
        soundService.playCombo(newCombo);
      } else {
        soundService.playCorrect();
      }

      // Record real-time score in database & persistent scoreHistory
      if (currentUser?.id) {
        firebaseService.recordAnswerScore({
          userId: currentUser.id,
          userName: currentUser.name,
          userAvatarId: currentUser.avatarId,
          photoUrl: currentUser.photoUrl,
          questionId: currentQ.id,
          isCorrect: true,
          pointsAdded: points,
          currentTotalScore: currentUser.totalScore || 0,
          matchScore: newScore,
          clef: currentQ.clave || selectedClef,
          reason: newCombo >= 2 ? `Acerto com Combo ${newCombo}x (+${points} pts)` : `Resposta correta (+${points} pts)`,
          combo: newCombo,
          accuracy: Math.round((newCorrectCount / (currentIndex + 1)) * 100),
          totalCorrect: (currentUser.totalCorrect || 0) + 1,
        });
      }
    } else {
      setCombo(0);
      setLastPointsEarned(0);
      soundService.playIncorrect();

      if (currentUser?.id) {
        firebaseService.recordAnswerScore({
          userId: currentUser.id,
          userName: currentUser.name,
          userAvatarId: currentUser.avatarId,
          photoUrl: currentUser.photoUrl,
          questionId: currentQ.id,
          isCorrect: false,
          pointsAdded: 0,
          currentTotalScore: currentUser.totalScore || 0,
          matchScore: score,
          clef: currentQ.clave || selectedClef,
          reason: 'Resposta incorreta',
          combo: 0,
          accuracy: Math.round((correctCount / (currentIndex + 1)) * 100),
          totalCorrect: currentUser.totalCorrect || 0,
        });
      }
    }

    setIsTimeout(false);
    setShowFeedback(true);
  };

  // Advance to next question or complete match
  const handleAdvance = () => {
    setShowFeedback(false);
    setSelectedOption(null);
    setIsTimeout(false);

    if (currentIndex + 1 < questions.length) {
      soundService.playNextQuestion();
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Completed all 20 questions!
      const totalTime = Math.round((Date.now() - startTimeRef.current) / 1000);
      const accuracy = Math.round((correctCount / questions.length) * 100);

      const finalResult: MatchResult = {
        id: 'match_' + Date.now(),
        date: new Date().toISOString(),
        score,
        correctCount,
        totalQuestions: questions.length,
        accuracy,
        maxCombo,
        totalTimeSeconds: totalTime,
      };

      onFinishMatch(finalResult);
    }
  };

  // Timer color
  const timerPercentage = (timeLeft / QUESTION_TIME_LIMIT) * 100;
  const isTimeRunningLow = timeLeft <= 7;

  return (
    <div
      className="w-full max-w-md sm:max-w-lg md:max-w-xl mx-auto flex flex-col min-h-screen px-3.5 select-none transition-all"
      style={{
        paddingTop: 'max(env(safe-area-inset-top, 0px), 14px)',
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px) + 2rem, 3rem)',
        paddingLeft: 'max(env(safe-area-inset-left, 0px), 0.875rem)',
        paddingRight: 'max(env(safe-area-inset-right, 0px), 0.875rem)',
      }}
    >
      {/* Top Header Status Bar */}
      <div className="flex items-center justify-between gap-2 p-3 bg-white/95 backdrop-blur-md rounded-2xl shadow-xs border border-blue-200/80 mb-3">
        {/* Question Counter & Clef */}
        <div className="flex items-center gap-1.5">
          <span className="text-blue-700 font-bold font-display text-sm">
            {t.questionNumber(currentIndex + 1, questions.length)}
          </span>
          {selectedClef && (
            <span className="inline-flex items-center gap-1 text-[11px] font-black font-display px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
              {selectedClef === 'sol' ? '𝄞 Sol' : selectedClef === 'fa' ? '𝄢 Fá' : '𝄡 Dó'}
            </span>
          )}
        </div>

        {/* Score */}
        <div className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 rounded-xl border border-blue-200">
          <Award className="w-4 h-4 text-blue-600" />
          <span className="font-display font-bold text-blue-950 text-xs tabular-nums">
            {score} {t.points}
          </span>
        </div>

        {/* Combo */}
        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-xl transition-all ${
          combo > 0 ? 'bg-orange-500 text-white font-bold animate-pulse' : 'bg-slate-100 text-slate-500'
        }`}>
          <Flame className="w-4 h-4 text-amber-200" />
          <span className="font-display text-xs tabular-nums">
            {combo}x
          </span>
        </div>

        {/* Exit Button */}
        <button
          type="button"
          onClick={() => {
            soundService.playTap();
            onExitQuiz();
          }}
          className="text-xs text-slate-400 hover:text-rose-600 font-display font-bold px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
        >
          {t.cancel}
        </button>
      </div>

      {/* Progress Bar & Timer */}
      <div className="space-y-1.5 mb-4">
        {/* Questions 20 steps progress */}
        <div className="w-full h-2.5 bg-blue-100 rounded-full overflow-hidden p-0.5 border border-blue-200/70">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-sky-400 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* 30-Second Countdown Bar */}
        <div className="flex items-center gap-2">
          <Timer className={`w-4 h-4 shrink-0 ${isTimeRunningLow ? 'text-rose-500 animate-bounce' : 'text-slate-500'}`} />
          <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${
                isTimeRunningLow ? 'bg-rose-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${timerPercentage}%` }}
            />
          </div>
          <span className={`text-xs font-display font-bold tabular-nums min-w-[28px] text-right ${
            isTimeRunningLow ? 'text-rose-600 font-extrabold' : 'text-slate-600'
          }`}>
            {timeLeft}{t.secondsShort}
          </span>
        </div>
      </div>

      {/* Mascot Companion Mini-Banner */}
      <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-gradient-to-r from-blue-100/90 to-blue-50 border border-blue-200/80 mb-3 shadow-xs">
        <AvatarDisplay
          avatar={avatar}
          size="sm"
          className="w-10 h-10 border-2 border-white"
        />
        <div className="flex-1 min-w-0">
          <div className="font-display font-bold text-xs text-blue-950 truncate">
            {avatar.name} ({avatar.instrumentOrRole})
          </div>
          <div className="text-[10px] text-blue-700 truncate">
            {combo >= 3 ? t.superCombo : t.tagline}
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="p-4 bg-white rounded-3xl shadow-sm border-2 border-blue-200/90 mb-4 text-center">
        <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold font-display uppercase tracking-wider mb-2 border border-blue-200">
          {t[`cat_${currentQ.category}` as keyof typeof t] as string || 'MSA Fase 1'}
        </span>
        <h2 className="text-base sm:text-lg font-bold font-display text-slate-900 leading-snug">
          {currentQ.question}
        </h2>

        {/* Musical Staff Display if applicable */}
        {currentQ.staffData && (
          <div className="mt-3">
            <StaffVisualizer
              clef={currentQ.staffData.clef}
              noteLine={currentQ.staffData.noteLine}
              noteSpace={currentQ.staffData.noteSpace}
              ledgerLine={currentQ.staffData.ledgerLine}
              noteName={currentQ.staffData.noteName}
            />
          </div>
        )}
      </div>

      {/* 4 Shuffled Alternatives */}
      <div className="space-y-2.5 flex-1">
        {currentQ.options.map((option, idx) => {
          const letter = String.fromCharCode(65 + idx); // A, B, C, D
          return (
            <button
              key={idx}
              type="button"
              onClick={() => {
                soundService.playTap();
                handleSelectOption(idx);
              }}
              className="w-full min-h-[54px] p-3 rounded-2xl bg-white hover:bg-blue-50/70 border-2 border-slate-200 hover:border-blue-400 font-display text-left flex items-center gap-3 transition-all cursor-pointer shadow-xs hover:shadow active:scale-[0.98] group"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-100 group-hover:bg-blue-600 text-blue-900 group-hover:text-white font-bold text-sm flex items-center justify-center shrink-0 border border-blue-200 transition-colors">
                {letter}
              </div>
              <span className="text-xs sm:text-sm font-semibold text-slate-800 flex-1 leading-snug">
                {option}
              </span>
            </button>
          );
        })}
      </div>

      {/* Feedback Modal Overlay */}
      {showFeedback && (
        <FeedbackModal
          isCorrect={selectedOption === currentQ.correctOptionIndex}
          isTimeout={isTimeout}
          pointsEarned={lastPointsEarned}
          comboCount={combo}
          correctAnswerText={currentQ.options[currentQ.correctOptionIndex]}
          explanation={currentQ.explanation}
          currentUser={currentUser}
          lang={lang}
          isLastQuestion={currentIndex + 1 >= questions.length}
          onAdvance={handleAdvance}
        />
      )}
    </div>
  );
};
