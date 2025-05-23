'use client';

import { useState, useEffect } from 'react';
import { Hanzi, HSKLevel, FlashcardState } from './types/hanzi';
import { hsk1Hanzi } from './data/hsk1';
import { hsk2Hanzi } from './data/hsk2';
import { hsk3Hanzi } from './data/hsk3';
import { hsk4Hanzi } from './data/hsk4';
import { hsk5Hanzi } from './data/hsk5';
import { hsk6Hanzi } from './data/hsk6';
import Flashcard from './components/Flashcard';
import StudyStats from './components/StudyStats';
import {
  updateCardAfterReview,
  sortCardsForStudy,
  getCardsForReview,
  getNewCards,
} from './utils/ankiAlgorithm';
import {
  saveHanziProgress,
  loadSelectedLevel,
  saveSelectedLevel,
  applyProgressToHanziData,
  saveStudySession,
  loadSettings,
  saveSettings,
} from './utils/storage';

export default function Home() {
  const [selectedLevel, setSelectedLevel] = useState<HSKLevel>('HSK1');
  const [hanziData, setHanziData] = useState<Hanzi[]>([]);
  const [studyCards, setStudyCards] = useState<Hanzi[]>([]);
  const [flashcardState, setFlashcardState] = useState<FlashcardState>({
    currentIndex: 0,
    showAnswer: false,
    studyMode: 'all',
    sessionStats: {
      total: 0,
      completed: 0,
      correct: 0,
      incorrect: 0,
    },
  });
  const [isStudyMode, setIsStudyMode] = useState(false);
  const [settings, setSettings] = useState({
    hideLearnedCards: false,
    dailyNewCards: 20,
    dailyReviewCards: 100,
    showPinyin: true,
    autoPlayAudio: false,
  });

  // 초기 데이터 로드
  useEffect(() => {
    const storedLevel = loadSelectedLevel();
    const storedSettings = loadSettings();
    
    setSelectedLevel(storedLevel);
    setSettings(storedSettings);
    
    loadHanziDataForLevel(storedLevel);
  }, []);

  // HSK 레벨별 데이터 로드
  const loadHanziDataForLevel = (level: HSKLevel) => {
    let rawData: Hanzi[];
    
    switch (level) {
      case 'HSK1':
        rawData = hsk1Hanzi;
        break;
      case 'HSK2':
        rawData = hsk2Hanzi;
        break;
      case 'HSK3':
        rawData = hsk3Hanzi;
        break;
      case 'HSK4':
        rawData = hsk4Hanzi;
        break;
      case 'HSK5':
        rawData = hsk5Hanzi;
        break;
      case 'HSK6':
        rawData = hsk6Hanzi;
        break;
      default:
        rawData = hsk1Hanzi;
    }

    // 저장된 진행 상황 적용
    const dataWithProgress = applyProgressToHanziData(rawData);
    setHanziData(dataWithProgress);
  };

  // 레벨 변경 핸들러
  const handleLevelChange = (level: HSKLevel) => {
    setSelectedLevel(level);
    saveSelectedLevel(level);
    loadHanziDataForLevel(level);
    setIsStudyMode(false);
  };

  // 학습 모드 시작
  const startStudySession = (mode: 'new' | 'review' | 'all') => {
    let cardsToStudy: Hanzi[] = [];
    
    switch (mode) {
      case 'new':
        cardsToStudy = getNewCards(hanziData).slice(0, settings.dailyNewCards);
        break;
      case 'review':
        cardsToStudy = getCardsForReview(hanziData).slice(0, settings.dailyReviewCards);
        break;
      case 'all':
        const reviewCards = getCardsForReview(hanziData);
        const newCards = getNewCards(hanziData).slice(0, settings.dailyNewCards);
        cardsToStudy = [...reviewCards, ...newCards];
        break;
    }

    if (cardsToStudy.length === 0) {
      alert('학습할 카드가 없습니다!');
      return;
    }

    const sortedCards = sortCardsForStudy(cardsToStudy);
    setStudyCards(sortedCards);
    setFlashcardState({
      currentIndex: 0,
      showAnswer: false,
      studyMode: mode,
      sessionStats: {
        total: sortedCards.length,
        completed: 0,
        correct: 0,
        incorrect: 0,
      },
    });
    setIsStudyMode(true);
  };

  // 답 보기
  const handleShowAnswer = () => {
    setFlashcardState(prev => ({
      ...prev,
      showAnswer: true,
    }));
  };

  // 답변 처리
  const handleAnswer = (difficulty: 'again' | 'hard' | 'good' | 'easy') => {
    const currentCard = studyCards[flashcardState.currentIndex];
    const updatedCard = updateCardAfterReview(currentCard, difficulty);
    
    // 학습 세션 기록
    saveStudySession({
      hanziId: currentCard.id,
      difficulty,
      reviewDate: new Date(),
    });

    // 한자 데이터 업데이트
    const updatedHanziData = hanziData.map(hanzi =>
      hanzi.id === currentCard.id ? updatedCard : hanzi
    );
    setHanziData(updatedHanziData);
    saveHanziProgress(updatedHanziData);

    // 학습 카드 업데이트
    const updatedStudyCards = studyCards.map(card =>
      card.id === currentCard.id ? updatedCard : card
    );
    setStudyCards(updatedStudyCards);

    // 통계 업데이트
    const isCorrect = difficulty === 'good' || difficulty === 'easy';
    const newStats = {
      ...flashcardState.sessionStats,
      completed: flashcardState.sessionStats.completed + 1,
      correct: flashcardState.sessionStats.correct + (isCorrect ? 1 : 0),
      incorrect: flashcardState.sessionStats.incorrect + (isCorrect ? 0 : 1),
    };

    // 다음 카드로 이동 또는 세션 종료
    if (flashcardState.currentIndex < studyCards.length - 1) {
      setFlashcardState({
        ...flashcardState,
        currentIndex: flashcardState.currentIndex + 1,
        showAnswer: false,
        sessionStats: newStats,
      });
    } else {
      // 세션 완료
      alert(`학습 완료!\n정답: ${newStats.correct}개\n오답: ${newStats.incorrect}개`);
      setIsStudyMode(false);
    }
  };

  // 학습 세션 종료
  const endStudySession = () => {
    setIsStudyMode(false);
    setFlashcardState({
      currentIndex: 0,
      showAnswer: false,
      studyMode: 'all',
      sessionStats: {
        total: 0,
        completed: 0,
        correct: 0,
        incorrect: 0,
      },
    });
  };

  const levels: HSKLevel[] = ['HSK1', 'HSK2', 'HSK3', 'HSK4', 'HSK5', 'HSK6'];
  const reviewCards = getCardsForReview(hanziData);
  const newCards = getNewCards(hanziData);

  if (isStudyMode && studyCards.length > 0) {
    // 학습 모드 UI
    const currentCard = studyCards[flashcardState.currentIndex];
    const progress = ((flashcardState.currentIndex + 1) / studyCards.length) * 100;

    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* 헤더 */}
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={endStudySession}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              ← 돌아가기
            </button>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                {selectedLevel} 학습
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {flashcardState.currentIndex + 1} / {studyCards.length}
              </div>
            </div>
            <div className="text-right text-sm text-gray-600 dark:text-gray-400">
              <div>정답: {flashcardState.sessionStats.correct}</div>
              <div>오답: {flashcardState.sessionStats.incorrect}</div>
            </div>
          </div>

          {/* 진행률 바 */}
          <div className="mb-8">
            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* 플래시카드 */}
          <Flashcard
            hanzi={currentCard}
            showAnswer={flashcardState.showAnswer}
            onShowAnswer={handleShowAnswer}
            onAnswer={handleAnswer}
            showPinyin={settings.showPinyin}
            autoPlayAudio={settings.autoPlayAudio}
          />
        </div>
      </main>
    );
  }

  // 메인 대시보드 UI
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            한자 학습 - Anki 스타일
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            간격 반복 학습법으로 효과적으로 한자를 마스터하세요
          </p>
        </div>

        {/* HSK 레벨 선택 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 text-center">
            HSK 레벨 선택
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {levels.map((level) => (
              <button
                key={level}
                onClick={() => handleLevelChange(level)}
                className={`py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
                  selectedLevel === level
                    ? 'bg-blue-500 text-white shadow-lg transform scale-105'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-md hover:shadow-lg'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* 학습 통계 */}
        <StudyStats hanziData={hanziData} currentLevel={selectedLevel} />

        {/* 학습 시작 버튼들 */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {/* 복습 카드 */}
          <button
            onClick={() => startStudySession('review')}
            disabled={reviewCards.length === 0}
            className={`p-6 rounded-xl text-center transition-all duration-200 transform hover:scale-105 ${
              reviewCards.length > 0
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-red-200'
                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
          >
            <div className="text-3xl font-bold mb-2">{reviewCards.length}</div>
            <div className="font-medium mb-1">복습하기</div>
            <div className="text-sm opacity-90">오늘 복습할 카드</div>
          </button>

          {/* 새 카드 */}
          <button
            onClick={() => startStudySession('new')}
            disabled={newCards.length === 0}
            className={`p-6 rounded-xl text-center transition-all duration-200 transform hover:scale-105 ${
              newCards.length > 0
                ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-blue-200'
                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
          >
            <div className="text-3xl font-bold mb-2">{Math.min(newCards.length, settings.dailyNewCards)}</div>
            <div className="font-medium mb-1">새 카드</div>
            <div className="text-sm opacity-90">새로운 한자 학습</div>
          </button>

          {/* 전체 학습 */}
          <button
            onClick={() => startStudySession('all')}
            disabled={reviewCards.length === 0 && newCards.length === 0}
            className={`p-6 rounded-xl text-center transition-all duration-200 transform hover:scale-105 ${
              reviewCards.length > 0 || newCards.length > 0
                ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-green-200'
                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
          >
            <div className="text-3xl font-bold mb-2">
              {reviewCards.length + Math.min(newCards.length, settings.dailyNewCards)}
            </div>
            <div className="font-medium mb-1">전체 학습</div>
            <div className="text-sm opacity-90">복습 + 새 카드</div>
          </button>
        </div>

        {/* 설정 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            학습 설정
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <label className="text-gray-700 dark:text-gray-300">병음 표시</label>
              <button
                onClick={() => {
                  const newSettings = { ...settings, showPinyin: !settings.showPinyin };
                  setSettings(newSettings);
                  saveSettings(newSettings);
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.showPinyin ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.showPinyin ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-gray-700 dark:text-gray-300">자동 발음</label>
              <button
                onClick={() => {
                  const newSettings = { ...settings, autoPlayAudio: !settings.autoPlayAudio };
                  setSettings(newSettings);
                  saveSettings(newSettings);
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.autoPlayAudio ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.autoPlayAudio ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
