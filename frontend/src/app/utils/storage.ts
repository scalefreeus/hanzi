import { Hanzi, HSKLevel, StudySession } from '../types/hanzi';
import { initializeNewCard } from './ankiAlgorithm';

// 스토리지 키들
const HANZI_PROGRESS_KEY = 'hanzi-learning-progress';
const STUDY_SESSIONS_KEY = 'hanzi-study-sessions';
const SELECTED_LEVEL_KEY = 'hanzi-selected-level';
const SETTINGS_KEY = 'hanzi-settings';

// 설정 인터페이스
interface AppSettings {
  hideLearnedCards: boolean;
  dailyNewCards: number;
  dailyReviewCards: number;
  showPinyin: boolean;
  autoPlayAudio: boolean;
}

// 저장된 한자 데이터 타입 (Date가 문자열로 직렬화된 상태)
interface SerializedHanzi extends Omit<Hanzi, 'nextReviewDate' | 'lastReviewDate'> {
  nextReviewDate: string | null;
  lastReviewDate: string | null;
}

// 저장된 학습 세션 타입 (Date가 문자열로 직렬화된 상태)
interface SerializedStudySession extends Omit<StudySession, 'reviewDate'> {
  reviewDate: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  hideLearnedCards: false,
  dailyNewCards: 20,
  dailyReviewCards: 100,
  showPinyin: true,
  autoPlayAudio: false,
};

/**
 * 한자 진행 상황 저장
 */
export const saveHanziProgress = (hanziList: Hanzi[]): void => {
  try {
    // Date 객체를 문자열로 변환하여 저장
    const serializedData: SerializedHanzi[] = hanziList.map(hanzi => ({
      ...hanzi,
      nextReviewDate: hanzi.nextReviewDate ? hanzi.nextReviewDate.toISOString() : null,
      lastReviewDate: hanzi.lastReviewDate ? hanzi.lastReviewDate.toISOString() : null,
    }));
    localStorage.setItem(HANZI_PROGRESS_KEY, JSON.stringify(serializedData));
  } catch (error) {
    console.error('한자 진행 상황 저장 실패:', error);
  }
};

/**
 * 한자 진행 상황 로드
 */
export const loadHanziProgress = (): Record<string, Hanzi> => {
  try {
    const savedData = localStorage.getItem(HANZI_PROGRESS_KEY);
    if (!savedData) return {};

    const parsedData: SerializedHanzi[] = JSON.parse(savedData);
    const progressMap: Record<string, Hanzi> = {};

    // 문자열을 Date 객체로 변환
    parsedData.forEach((hanzi: SerializedHanzi) => {
      progressMap[hanzi.id] = {
        ...hanzi,
        nextReviewDate: hanzi.nextReviewDate ? new Date(hanzi.nextReviewDate) : null,
        lastReviewDate: hanzi.lastReviewDate ? new Date(hanzi.lastReviewDate) : null,
      };
    });

    return progressMap;
  } catch (error) {
    console.error('한자 진행 상황 로드 실패:', error);
    return {};
  }
};

/**
 * 특정 한자의 진행 상황 업데이트
 */
export const updateHanziProgress = (updatedHanzi: Hanzi): void => {
  try {
    const currentProgress = loadHanziProgress();
    currentProgress[updatedHanzi.id] = updatedHanzi;
    
    const hanziList = Object.values(currentProgress);
    saveHanziProgress(hanziList);
  } catch (error) {
    console.error('한자 진행 상황 업데이트 실패:', error);
  }
};

/**
 * 학습 세션 기록 저장
 */
export const saveStudySession = (session: StudySession): void => {
  try {
    const sessions = loadStudySessions();
    const serializedSession: SerializedStudySession = {
      ...session,
      reviewDate: session.reviewDate.toISOString(),
    };
    
    // 기존 세션들을 직렬화된 형태로 변환
    const serializedSessions: SerializedStudySession[] = sessions.map(s => ({
      ...s,
      reviewDate: s.reviewDate.toISOString(),
    }));
    
    serializedSessions.push(serializedSession);
    
    // 최근 30일 데이터만 유지
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentSessions = serializedSessions.filter((s: SerializedStudySession) => 
      new Date(s.reviewDate) >= thirtyDaysAgo
    );
    
    localStorage.setItem(STUDY_SESSIONS_KEY, JSON.stringify(recentSessions));
  } catch (error) {
    console.error('학습 세션 저장 실패:', error);
  }
};

/**
 * 학습 세션 기록 로드
 */
export const loadStudySessions = (): StudySession[] => {
  try {
    const savedData = localStorage.getItem(STUDY_SESSIONS_KEY);
    if (!savedData) return [];

    const parsedData: SerializedStudySession[] = JSON.parse(savedData);
    return parsedData.map((session: SerializedStudySession) => ({
      ...session,
      reviewDate: new Date(session.reviewDate),
    }));
  } catch (error) {
    console.error('학습 세션 로드 실패:', error);
    return [];
  }
};

/**
 * 선택된 HSK 레벨 저장
 */
export const saveSelectedLevel = (level: HSKLevel): void => {
  try {
    localStorage.setItem(SELECTED_LEVEL_KEY, JSON.stringify(level));
  } catch (error) {
    console.error('선택된 레벨 저장 실패:', error);
  }
};

/**
 * 선택된 HSK 레벨 로드
 */
export const loadSelectedLevel = (): HSKLevel => {
  try {
    const savedData = localStorage.getItem(SELECTED_LEVEL_KEY);
    return savedData ? JSON.parse(savedData) : 'HSK1';
  } catch (error) {
    console.error('선택된 레벨 로드 실패:', error);
    return 'HSK1';
  }
};

/**
 * 앱 설정 저장
 */
export const saveSettings = (settings: AppSettings): void => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('설정 저장 실패:', error);
  }
};

/**
 * 앱 설정 로드
 */
export const loadSettings = (): AppSettings => {
  try {
    const savedData = localStorage.getItem(SETTINGS_KEY);
    return savedData ? { ...DEFAULT_SETTINGS, ...JSON.parse(savedData) } : DEFAULT_SETTINGS;
  } catch (error) {
    console.error('설정 로드 실패:', error);
    return DEFAULT_SETTINGS;
  }
};

/**
 * 한자 데이터에 저장된 진행 상황 적용
 */
export const applyProgressToHanziData = (hanziData: Hanzi[]): Hanzi[] => {
  const progressMap = loadHanziProgress();
  
  return hanziData.map(hanzi => {
    const savedProgress = progressMap[hanzi.id];
    if (savedProgress) {
      return savedProgress;
    } else {
      // 새로운 카드는 초기화
      return initializeNewCard(hanzi);
    }
  });
};

/**
 * 모든 데이터 초기화 (개발/테스트용)
 */
export const clearAllData = (): void => {
  try {
    localStorage.removeItem(HANZI_PROGRESS_KEY);
    localStorage.removeItem(STUDY_SESSIONS_KEY);
    localStorage.removeItem(SELECTED_LEVEL_KEY);
    localStorage.removeItem(SETTINGS_KEY);
    console.log('모든 데이터가 초기화되었습니다.');
  } catch (error) {
    console.error('데이터 초기화 실패:', error);
  }
};

// 레거시 함수들 (하위 호환성을 위해 유지)
export const saveProgress = saveHanziProgress;
export const loadProgress = (): Hanzi[] => Object.values(loadHanziProgress());
