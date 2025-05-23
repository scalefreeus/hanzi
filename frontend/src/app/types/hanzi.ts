export type HSKLevel = 'HSK1' | 'HSK2' | 'HSK3' | 'HSK4' | 'HSK5' | 'HSK6';

export interface Hanzi {
  id: string;
  character: string;
  meaning: string;
  meaning_ko: string;
  pinyin: string;
  level: HSKLevel;
  isLearned: boolean;
  // Anki 알고리즘을 위한 필드들 (선택적)
  easeFactor?: number; // 난이도 계수 (기본값: 2.5)
  interval?: number; // 다음 복습까지의 간격 (일 단위)
  repetitions?: number; // 연속 성공 횟수
  nextReviewDate?: Date | null; // 다음 복습 날짜
  lastReviewDate?: Date | null; // 마지막 복습 날짜
}

export interface StudySession {
  hanziId: string;
  difficulty: 'again' | 'hard' | 'good' | 'easy'; // Anki의 4단계 난이도
  reviewDate: Date;
}

export interface FlashcardState {
  currentIndex: number;
  showAnswer: boolean;
  studyMode: 'new' | 'review' | 'all';
  sessionStats: {
    total: number;
    completed: number;
    correct: number;
    incorrect: number;
  };
}
