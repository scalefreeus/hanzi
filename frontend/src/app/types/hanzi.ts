export type HSKLevel = 'HSK1' | 'HSK2' | 'HSK3' | 'HSK4' | 'HSK5' | 'HSK6';

export interface Hanzi {
  id: string;
  character: string;
  meaning: string;
  meaning_ko: string;
  pinyin: string;
  level: HSKLevel;
  isLearned: boolean;
} 