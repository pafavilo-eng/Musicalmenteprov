import { Language, Question, ShuffledQuestion, ClefType } from '../types';
import { questionsPart1 } from './questionsPart1';
import { questionsPart2 } from './questionsPart2';
import { questionsPart3 } from './questionsPart3';
import { questionsPart4 } from './questionsPart4';
import { questionsClefDo } from './questionsClefDo';

// Exact classification mapping based on authentic question content
export const CLEF_QUESTION_IDS: Record<ClefType, Set<number>> = {
  sol: new Set([27, 28, 31, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 67, 68, 69, 70, 84, 85]),
  fa: new Set([29, 30, 32, 46, 47, 48, 49, 50, 51, 52, 53, 54, 71, 72, 73, 74, 75, 76, 86, 87]),
  do: new Set([33, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121]),
};

// Helper to determine the clef classification of a question
export function getQuestionClef(q: Question): ClefType | undefined {
  if (q.clave) return q.clave;
  if (CLEF_QUESTION_IDS.sol.has(q.id)) return 'sol';
  if (CLEF_QUESTION_IDS.fa.has(q.id)) return 'fa';
  if (CLEF_QUESTION_IDS.do.has(q.id)) return 'do';
  return undefined;
}

// All questions with their explicit clef tags populated
export const ALL_QUESTIONS: Question[] = [
  ...questionsPart1,
  ...questionsPart2,
  ...questionsPart3,
  ...questionsPart4,
  ...questionsClefDo,
].map((q) => {
  const clave = getQuestionClef(q);
  return {
    ...q,
    clave,
  };
});

// Helper to shuffle an array (Fisher-Yates)
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Format raw question to shuffled alternatives format
function formatQuestionForMatch(q: Question, lang: Language): ShuffledQuestion {
  const translation = q.translations[lang] || q.translations['pt-BR'];
  const originalOptions = translation.options;
  const correctText = originalOptions[q.correctIndex];

  // Shuffle alternatives
  const shuffledOptions = shuffleArray(originalOptions);
  const newCorrectIndex = shuffledOptions.indexOf(correctText);

  return {
    id: q.id,
    category: q.category,
    difficulty: q.difficulty,
    question: translation.question,
    options: shuffledOptions,
    correctOptionIndex: newCorrectIndex,
    explanation: translation.explanation,
    clave: q.clave,
    staffData: q.staffData,
  };
}

// Select questions filtered by the selected Clef:
// - Questions specific to this clef appear for this clef
// - Questions specific to other clefs NEVER appear
// - General questions (not specific to any clef) are available to ALL clefs
export function selectMatchQuestionsByClef(
  clef: ClefType,
  lang: Language,
  requestedCount: number = 20
): { questions: ShuffledQuestion[]; totalAvailable: number; hasEnough: boolean } {
  // 1. Specific questions for this clef
  const specificClefQuestions = ALL_QUESTIONS.filter((q) => q.clave === clef);

  // 2. General music theory questions not tied to a specific clef (available to all)
  const generalQuestions = ALL_QUESTIONS.filter((q) => !q.clave);

  // Total eligible question pool: strictly specific to this clef + general theory
  const eligibleQuestions = [...specificClefQuestions, ...generalQuestions];
  const totalAvailable = eligibleQuestions.length;
  const hasEnough = totalAvailable >= requestedCount;

  // 3. Balanced draw: combine clef-specific questions with general music theory
  const shuffledSpecific = shuffleArray(specificClefQuestions);
  const shuffledGeneral = shuffleArray(generalQuestions);

  // Target: about 50-60% clef-specific questions, complemented by general theory
  const targetSpecificCount = Math.min(shuffledSpecific.length, Math.ceil(requestedCount * 0.55));
  const targetGeneralCount = requestedCount - targetSpecificCount;

  const chosenSpecific = shuffledSpecific.slice(0, targetSpecificCount);
  const chosenGeneral = shuffledGeneral.slice(0, targetGeneralCount);

  let picked = [...chosenSpecific, ...chosenGeneral];
  if (picked.length < requestedCount) {
    const remainingSpecific = shuffledSpecific.slice(targetSpecificCount);
    picked = [...picked, ...remainingSpecific.slice(0, requestedCount - picked.length)];
  }

  // Shuffle the final selection so clef and general questions appear in dynamic order
  const finalQuestions = shuffleArray(picked).slice(0, requestedCount);
  const formatted = finalQuestions.map((q) => formatQuestionForMatch(q, lang));

  return {
    questions: formatted,
    totalAvailable,
    hasEnough,
  };
}

// Select general match questions
export function selectMatchQuestions(lang: Language, count: number = 20): ShuffledQuestion[] {
  const shuffledQuestions = shuffleArray(ALL_QUESTIONS).slice(0, count);
  return shuffledQuestions.map((q) => formatQuestionForMatch(q, lang));
}
