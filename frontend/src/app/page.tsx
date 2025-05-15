'use client';

import { useState, useEffect } from 'react';
import { Hanzi, HSKLevel } from './types/hanzi';
import { hsk1Hanzi } from './data/hsk1';
import { hsk2Hanzi } from './data/hsk2';
import { hsk3Hanzi } from './data/hsk3';
import { hsk4Hanzi } from './data/hsk4';
import { hsk5Hanzi } from './data/hsk5';
import { hsk6Hanzi } from './data/hsk6';

const STORAGE_KEY = 'hanziLearningStatus';
const HIDE_LEARNED_KEY = 'hideLearnedChars';

// Helper function to load learning status from localStorage
const loadLearningStatus = () => {
  if (typeof window === 'undefined') return {};
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : {};
};

// Helper function to save learning status to localStorage
const saveLearningStatus = (status: Record<string, boolean>) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(status));
};

// Helper function to load hide learned preference from localStorage
const loadHideLearnedPreference = (): boolean => {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem(HIDE_LEARNED_KEY);
  return stored ? JSON.parse(stored) : false;
};

// Helper function to save hide learned preference to localStorage
const saveHideLearnedPreference = (hide: boolean) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(HIDE_LEARNED_KEY, JSON.stringify(hide));
};

// Helper function to apply stored learning status to hanzi data
const applyStoredStatus = (hanziList: Hanzi[], storedStatus: Record<string, boolean>): Hanzi[] => {
  return hanziList.map(hanzi => ({
    ...hanzi,
    isLearned: storedStatus[hanzi.id] || false
  }));
};

export default function Home() {
  const [selectedLevel, setSelectedLevel] = useState<HSKLevel>('HSK1');
  const [hanziData, setHanziData] = useState<Hanzi[]>([]);
  const [hideLearnedChars, setHideLearnedChars] = useState(false);
  const [learningStatus, setLearningStatus] = useState<Record<string, boolean>>({});

  // Load initial learning status and preferences from localStorage
  useEffect(() => {
    const storedStatus = loadLearningStatus();
    const storedHidePreference = loadHideLearnedPreference();
    setLearningStatus(storedStatus);
    setHideLearnedChars(storedHidePreference);
    setHanziData(applyStoredStatus(hsk1Hanzi, storedStatus));
  }, []);

  const handleLevelChange = (level: HSKLevel) => {
    setSelectedLevel(level);
    let newHanziData: Hanzi[];
    switch (level) {
      case 'HSK1':
        newHanziData = hsk1Hanzi;
        break;
      case 'HSK2':
        newHanziData = hsk2Hanzi;
        break;
      case 'HSK3':
        newHanziData = hsk3Hanzi;
        break;
      case 'HSK4':
        newHanziData = hsk4Hanzi;
        break;
      case 'HSK5':
        newHanziData = hsk5Hanzi;
        break;
      case 'HSK6':
        newHanziData = hsk6Hanzi;
        break;
      default:
        newHanziData = hsk1Hanzi;
    }
    setHanziData(applyStoredStatus(newHanziData, learningStatus));
  };

  const handleLearnClick = (id: string) => {
    const newStatus = { ...learningStatus };
    newStatus[id] = !learningStatus[id];
    setLearningStatus(newStatus);
    saveLearningStatus(newStatus);

    setHanziData(prevData =>
      prevData.map(hanzi =>
        hanzi.id === id ? { ...hanzi, isLearned: !hanzi.isLearned } : hanzi
      )
    );
  };

  const handleHideLearnedToggle = () => {
    const newHideLearnedValue = !hideLearnedChars;
    setHideLearnedChars(newHideLearnedValue);
    saveHideLearnedPreference(newHideLearnedValue);
  };

  const levels: HSKLevel[] = ['HSK1', 'HSK2', 'HSK3', 'HSK4', 'HSK5', 'HSK6'];

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-900 dark:text-white">
          한자 학습
        </h1>

        <div className="flex flex-col md:flex-row justify-between items-center mb-8 space-y-4 md:space-y-0">
          <div className="flex flex-wrap gap-2">
            {levels.map((level) => (
              <button
                key={level}
                onClick={() => handleLevelChange(level)}
                className={`py-2 px-4 rounded-lg transition-colors ${
                  selectedLevel === level
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {level}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-gray-700 dark:text-gray-300">학습 완료 단어 숨기기</label>
            <button
              onClick={handleHideLearnedToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                hideLearnedChars ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  hideLearnedChars ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hanziData
            .filter(hanzi => !hideLearnedChars || !hanzi.isLearned)
            .map((hanzi) => (
            <div
              key={hanzi.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="text-4xl font-bold text-center mb-4 text-gray-900 dark:text-white">
                {hanzi.character}
              </div>
              <div className="text-lg text-center mb-2 text-gray-700 dark:text-gray-300">
                {hanzi.meaning} ({hanzi.meaning_ko})
              </div>
              <div className="text-sm text-center mb-4 text-gray-500 dark:text-gray-400">
                {hanzi.pinyin}
              </div>
              <button
                onClick={() => handleLearnClick(hanzi.id)}
                className={`w-full py-2 px-4 rounded-lg transition-colors ${
                  hanzi.isLearned
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white dark:bg-gray-700 dark:hover:bg-gray-600'
                }`}
              >
                {hanzi.isLearned ? '학습 완료' : '학습하기'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
