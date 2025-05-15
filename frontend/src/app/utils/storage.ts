import { Hanzi } from '../types/hanzi';

const STORAGE_KEY = 'hanzi-learning-progress';

export const saveProgress = (hanziList: Hanzi[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(hanziList));
};

export const loadProgress = (): Hanzi[] => {
  const savedData = localStorage.getItem(STORAGE_KEY);
  return savedData ? JSON.parse(savedData) : [];
};

export const updateHanziProgress = (hanziId: string, isLearned: boolean): void => {
  const currentProgress = loadProgress();
  const updatedProgress = currentProgress.map(hanzi => 
    hanzi.id === hanziId ? { ...hanzi, isLearned } : hanzi
  );
  saveProgress(updatedProgress);
}; 