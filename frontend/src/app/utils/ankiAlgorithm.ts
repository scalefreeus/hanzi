import { Hanzi } from '../types/hanzi';

/**
 * Anki의 SuperMemo 2 알고리즘을 기반으로 한 간격 반복 알고리즘
 */

// 기본 설정값
const DEFAULT_EASE_FACTOR = 2.5;
const MIN_EASE_FACTOR = 1.3;
const INITIAL_INTERVAL = 1;
const SECOND_INTERVAL = 6;

/**
 * 새로운 한자 카드 초기화
 */
export function initializeNewCard(hanzi: Hanzi): Hanzi {
  return {
    ...hanzi,
    easeFactor: DEFAULT_EASE_FACTOR,
    interval: 0,
    repetitions: 0,
    nextReviewDate: null,
    lastReviewDate: null,
    isLearned: false,
  };
}

/**
 * 복습 결과에 따라 카드 상태 업데이트
 */
export function updateCardAfterReview(
  hanzi: Hanzi,
  difficulty: 'again' | 'hard' | 'good' | 'easy'
): Hanzi {
  const now = new Date();
  let newInterval: number;
  let newRepetitions: number;
  
  // 기본값 설정 (선택적 필드 처리)
  const currentEaseFactor = hanzi.easeFactor ?? DEFAULT_EASE_FACTOR;
  const currentRepetitions = hanzi.repetitions ?? 0;
  const currentInterval = hanzi.interval ?? 0;
  
  let newEaseFactor: number = currentEaseFactor;

  switch (difficulty) {
    case 'again':
      // 틀렸을 때: 처음부터 다시 시작
      newRepetitions = 0;
      newInterval = INITIAL_INTERVAL;
      newEaseFactor = Math.max(currentEaseFactor - 0.2, MIN_EASE_FACTOR);
      break;

    case 'hard':
      // 어려웠을 때: 간격을 1.2배로 증가, ease factor 감소
      newRepetitions = currentRepetitions + 1;
      if (currentRepetitions === 0) {
        newInterval = INITIAL_INTERVAL;
      } else if (currentRepetitions === 1) {
        newInterval = SECOND_INTERVAL;
      } else {
        newInterval = Math.ceil(currentInterval * 1.2);
      }
      newEaseFactor = Math.max(currentEaseFactor - 0.15, MIN_EASE_FACTOR);
      break;

    case 'good':
      // 보통일 때: 정상적인 간격 증가
      newRepetitions = currentRepetitions + 1;
      if (currentRepetitions === 0) {
        newInterval = INITIAL_INTERVAL;
      } else if (currentRepetitions === 1) {
        newInterval = SECOND_INTERVAL;
      } else {
        newInterval = Math.ceil(currentInterval * currentEaseFactor);
      }
      break;

    case 'easy':
      // 쉬웠을 때: 간격을 더 크게 증가, ease factor 증가
      newRepetitions = currentRepetitions + 1;
      if (currentRepetitions === 0) {
        newInterval = 4; // 첫 번째가 쉬우면 4일 후
      } else if (currentRepetitions === 1) {
        newInterval = Math.ceil(SECOND_INTERVAL * 1.3);
      } else {
        newInterval = Math.ceil(currentInterval * currentEaseFactor * 1.3);
      }
      newEaseFactor = currentEaseFactor + 0.15;
      break;
  }

  // 다음 복습 날짜 계산
  const nextReviewDate = new Date(now);
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

  return {
    ...hanzi,
    easeFactor: newEaseFactor,
    interval: newInterval,
    repetitions: newRepetitions,
    nextReviewDate,
    lastReviewDate: now,
    isLearned: newRepetitions >= 2, // 2번 이상 성공하면 학습 완료로 간주
  };
}

/**
 * 오늘 복습해야 할 카드들 필터링
 */
export function getCardsForReview(cards: Hanzi[]): Hanzi[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return cards.filter(card => {
    if (!card.nextReviewDate) return false;
    const reviewDate = new Date(card.nextReviewDate);
    reviewDate.setHours(0, 0, 0, 0);
    return reviewDate <= today;
  });
}

/**
 * 새로운 카드들 (아직 학습하지 않은 카드) 필터링
 */
export function getNewCards(cards: Hanzi[]): Hanzi[] {
  return cards.filter(card => (card.repetitions ?? 0) === 0 && !card.nextReviewDate);
}

/**
 * 학습 통계 계산
 */
export function calculateStudyStats(cards: Hanzi[]) {
  const total = cards.length;
  const newCards = getNewCards(cards).length;
  const reviewCards = getCardsForReview(cards).length;
  const learnedCards = cards.filter(card => card.isLearned).length;
  const matureCards = cards.filter(card => (card.repetitions ?? 0) >= 3).length;

  return {
    total,
    newCards,
    reviewCards,
    learnedCards,
    matureCards,
    progressPercentage: total > 0 ? Math.round((learnedCards / total) * 100) : 0,
  };
}

/**
 * 다음 복습 날짜까지 남은 일수 계산
 */
export function getDaysUntilNextReview(card: Hanzi): number | null {
  if (!card.nextReviewDate) return null;
  
  const today = new Date();
  const reviewDate = new Date(card.nextReviewDate);
  const diffTime = reviewDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * 학습 세션을 위한 카드 순서 정렬
 * 우선순위: 복습 카드 > 새 카드
 */
export function sortCardsForStudy(cards: Hanzi[]): Hanzi[] {
  const reviewCards = getCardsForReview(cards);
  const newCards = getNewCards(cards);
  
  // 복습 카드는 마지막 복습일 기준으로 정렬 (오래된 것부터)
  reviewCards.sort((a, b) => {
    if (!a.lastReviewDate && !b.lastReviewDate) return 0;
    if (!a.lastReviewDate) return -1;
    if (!b.lastReviewDate) return 1;
    return a.lastReviewDate.getTime() - b.lastReviewDate.getTime();
  });
  
  // 새 카드는 ID 순서대로 정렬
  newCards.sort((a, b) => a.id.localeCompare(b.id));
  
  return [...reviewCards, ...newCards];
}
