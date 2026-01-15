/**
 * useTutorialState
 * チュートリアルの状態管理を行うカスタムフック
 */
import { useState, useEffect, useCallback } from 'react';

export interface TutorialStep {
  target: string;
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: 'click' | 'none';
  navigateTo?: string;
}

interface UseTutorialStateReturn {
  currentStep: number;
  step: TutorialStep | undefined;
  totalSteps: number;
  goToNextStep: () => void;
  completeTutorial: () => void;
  isLastStep: boolean;
}

const TUTORIAL_STORAGE_KEY = 'tutorial_completed';

export const useTutorialState = (
  steps: TutorialStep[],
  onComplete: () => void
): UseTutorialStateReturn => {
  const [currentStep, setCurrentStep] = useState(0);

  const step = steps[currentStep];
  const isLastStep = currentStep >= steps.length - 1;

  const completeTutorial = useCallback(() => {
    localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
    onComplete();
  }, [onComplete]);

  const goToNextStep = useCallback(() => {
    if (isLastStep) {
      completeTutorial();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  }, [isLastStep, completeTutorial]);

  return {
    currentStep,
    step,
    totalSteps: steps.length,
    goToNextStep,
    completeTutorial,
    isLastStep,
  };
};

/**
 * チュートリアルを表示すべきかどうかを判定
 */
export const shouldShowTutorial = (isFirstLogin?: boolean): boolean => {
  if (localStorage.getItem(TUTORIAL_STORAGE_KEY) === 'true') {
    return false;
  }
  return isFirstLogin === true;
};