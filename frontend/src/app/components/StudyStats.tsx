'use client';

import { Hanzi } from '../types/hanzi';
import { calculateStudyStats, getCardsForReview, getNewCards } from '../utils/ankiAlgorithm';

interface StudyStatsProps {
  hanziData: Hanzi[];
  currentLevel: string;
}

export default function StudyStats({ hanziData, currentLevel }: StudyStatsProps) {
  const stats = calculateStudyStats(hanziData);
  const reviewCards = getCardsForReview(hanziData);
  const newCards = getNewCards(hanziData);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        {currentLevel} 학습 현황
      </h2>
      
      {/* 진행률 바 */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            전체 진행률
          </span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {stats.progressPercentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700">
          <div 
            className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500" 
            style={{ width: `${stats.progressPercentage}%` }}
          ></div>
        </div>
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
          {stats.learnedCards} / {stats.total} 한자 학습 완료
        </div>
      </div>

      {/* 통계 카드들 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* 오늘 복습할 카드 */}
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {stats.reviewCards}
          </div>
          <div className="text-sm text-red-700 dark:text-red-300 font-medium">
            복습
          </div>
          <div className="text-xs text-red-600 dark:text-red-400 mt-1">
            오늘 할 일
          </div>
        </div>

        {/* 새로운 카드 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {stats.newCards}
          </div>
          <div className="text-sm text-blue-700 dark:text-blue-300 font-medium">
            새 카드
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            미학습
          </div>
        </div>

        {/* 학습 완료 */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.learnedCards}
          </div>
          <div className="text-sm text-green-700 dark:text-green-300 font-medium">
            학습 완료
          </div>
          <div className="text-xs text-green-600 dark:text-green-400 mt-1">
            2회 이상
          </div>
        </div>

        {/* 숙련 카드 */}
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {stats.matureCards}
          </div>
          <div className="text-sm text-purple-700 dark:text-purple-300 font-medium">
            숙련
          </div>
          <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
            3회 이상
          </div>
        </div>
      </div>

      {/* 오늘의 학습 추천 */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
          📚 오늘의 학습 추천
        </h3>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {reviewCards.length > 0 && (
            <div className="mb-1">
              • <span className="font-medium text-red-600 dark:text-red-400">
                {reviewCards.length}개 복습 카드
              </span>를 먼저 학습하세요
            </div>
          )}
          {newCards.length > 0 && (
            <div className="mb-1">
              • <span className="font-medium text-blue-600 dark:text-blue-400">
                새로운 카드 {Math.min(newCards.length, 10)}개
              </span>를 추가로 학습해보세요
            </div>
          )}
          {reviewCards.length === 0 && newCards.length === 0 && (
            <div className="text-green-600 dark:text-green-400 font-medium">
              🎉 오늘 할 학습이 모두 완료되었습니다!
            </div>
          )}
        </div>
      </div>

      {/* 학습 팁 */}
      {stats.total > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <div className="text-xs text-yellow-800 dark:text-yellow-200">
            💡 <strong>학습 팁:</strong> 
            {stats.progressPercentage < 30 
              ? " 꾸준히 새로운 카드를 학습하여 기초를 다져보세요."
              : stats.progressPercentage < 70
              ? " 복습을 통해 기억을 강화하고 새로운 카드도 함께 학습하세요."
              : " 거의 다 완성되었습니다! 복습을 통해 완벽하게 마스터하세요."
            }
          </div>
        </div>
      )}
    </div>
  );
}
