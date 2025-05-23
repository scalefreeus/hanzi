'use client';

import { useState } from 'react';
import { Hanzi } from '../types/hanzi';

interface FlashcardProps {
  hanzi: Hanzi;
  showAnswer: boolean;
  onShowAnswer: () => void;
  onAnswer: (difficulty: 'again' | 'hard' | 'good' | 'easy') => void;
  showPinyin?: boolean;
  autoPlayAudio?: boolean;
}

export default function Flashcard({
  hanzi,
  showAnswer,
  onShowAnswer,
  onAnswer,
  showPinyin = true,
  autoPlayAudio = false,
}: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  // 발음 재생 함수
  const playPronunciation = (character: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(character);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  // 카드 뒤집기 애니메이션
  const handleCardClick = () => {
    if (!showAnswer) {
      setIsFlipped(true);
      setTimeout(() => {
        onShowAnswer();
        if (autoPlayAudio) {
          playPronunciation(hanzi.character);
        }
      }, 150);
    }
  };

  // 난이도별 버튼 스타일
  const getDifficultyButtonStyle = (difficulty: string) => {
    const baseStyle = "flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 active:scale-95";
    
    switch (difficulty) {
      case 'again':
        return `${baseStyle} bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-red-200`;
      case 'hard':
        return `${baseStyle} bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-orange-200`;
      case 'good':
        return `${baseStyle} bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-green-200`;
      case 'easy':
        return `${baseStyle} bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-blue-200`;
      default:
        return baseStyle;
    }
  };

  return (
    <div className="max-w-md mx-auto">
      {/* 플래시카드 */}
      <div 
        className={`relative w-full h-80 mb-6 cursor-pointer transition-transform duration-300 ${
          isFlipped ? 'transform-gpu' : ''
        }`}
        onClick={handleCardClick}
        style={{ perspective: '1000px' }}
      >
        <div
          className={`absolute inset-0 w-full h-full transition-transform duration-500 transform-style-preserve-3d ${
            showAnswer ? 'rotate-y-180' : ''
          }`}
        >
          {/* 앞면 - 한자 */}
          <div className="absolute inset-0 w-full h-full backface-hidden bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center">
            <div className="text-8xl font-bold text-gray-900 dark:text-white mb-4">
              {hanzi.character}
            </div>
            {!showAnswer && (
              <div className="text-gray-500 dark:text-gray-400 text-sm">
                클릭하여 답 보기
              </div>
            )}
          </div>

          {/* 뒷면 - 의미와 발음 */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center p-6">
            <div className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
              {hanzi.character}
            </div>
            
            <div className="text-center mb-4">
              <div className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                {hanzi.meaning_ko}
              </div>
              <div className="text-lg text-gray-600 dark:text-gray-400 mb-3">
                {hanzi.meaning}
              </div>
              
              {showPinyin && (
                <div className="flex items-center justify-center gap-2">
                  <span className="text-lg text-blue-600 dark:text-blue-400 font-medium">
                    {hanzi.pinyin}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playPronunciation(hanzi.character);
                    }}
                    className="p-2 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    aria-label="발음 듣기"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* 학습 정보 */}
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              <div>반복: {hanzi.repetitions ?? 0}회</div>
              <div>난이도: {(hanzi.easeFactor ?? 2.5).toFixed(1)}</div>
              {hanzi.nextReviewDate && (
                <div>
                  다음 복습: {new Date(hanzi.nextReviewDate).toLocaleDateString('ko-KR')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 답변 버튼들 */}
      {showAnswer && (
        <div className="space-y-3">
          <div className="text-center text-gray-600 dark:text-gray-400 text-sm mb-4">
            이 한자를 얼마나 잘 기억하셨나요?
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onAnswer('again')}
              className={getDifficultyButtonStyle('again')}
            >
              <div className="text-center">
                <div className="font-bold">다시</div>
                <div className="text-xs opacity-90">1분</div>
              </div>
            </button>
            
            <button
              onClick={() => onAnswer('hard')}
              className={getDifficultyButtonStyle('hard')}
            >
              <div className="text-center">
                <div className="font-bold">어려움</div>
                <div className="text-xs opacity-90">6분</div>
              </div>
            </button>
            
            <button
              onClick={() => onAnswer('good')}
              className={getDifficultyButtonStyle('good')}
            >
              <div className="text-center">
                <div className="font-bold">보통</div>
                <div className="text-xs opacity-90">1일</div>
              </div>
            </button>
            
            <button
              onClick={() => onAnswer('easy')}
              className={getDifficultyButtonStyle('easy')}
            >
              <div className="text-center">
                <div className="font-bold">쉬움</div>
                <div className="text-xs opacity-90">4일</div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* 답 보기 버튼 (카드 클릭 대신 사용할 수 있는 대안) */}
      {!showAnswer && (
        <div className="text-center">
          <button
            onClick={handleCardClick}
            className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors shadow-lg hover:shadow-blue-200"
          >
            답 보기
          </button>
        </div>
      )}
    </div>
  );
}
