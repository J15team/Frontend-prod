/**
 * Tutorial Component
 * 初回ログイン時のインタラクティブチュートリアル
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useTutorialState,
  shouldShowTutorial,
  type TutorialStep,
} from '@/hooks/useTutorialState';
import {
  useTargetHighlight,
  calculateTooltipPosition,
} from '@/hooks/useTargetHighlight';

const TUTORIAL_SUBJECT_ID = 100;

const subjectsTutorialSteps: TutorialStep[] = [
  {
    target: '.star-filter-btn:first-child',
    title: '難易度でフィルター',
    description: '星をクリックすると、その難易度の題材だけを表示できます。',
    position: 'bottom',
    action: 'click',
  },
  {
    target: '.clear-filter-btn',
    title: 'フィルターを解除',
    description: 'クリアボタンでフィルターを解除できます。',
    position: 'bottom',
    action: 'click',
  },
  {
    target: '.hamburger-btn',
    title: '進捗を確認しよう',
    description: 'ここをクリックすると、全体の学習進捗を確認できます。',
    position: 'bottom',
    action: 'click',
  },
  {
    target: '.sidebar-close',
    title: 'サイドバーを閉じる',
    description: '確認できたら閉じましょう。',
    position: 'bottom',
    action: 'click',
  },
  {
    target: `[data-subject-id="${TUTORIAL_SUBJECT_ID}"]`,
    title: 'チュートリアル題材を始めよう',
    description: '「はじめてのPathly」をクリックして、基本操作を学びましょう！',
    position: 'bottom',
    action: 'click',
    navigateTo: 'sections',
  },
];

const sectionsTutorialSteps: TutorialStep[] = [
  {
    target: '.sidebar-item:nth-child(1) .complete-btn',
    title: 'セクション1を完了',
    description: '「完了にする」ボタンを押してセクション1を完了させましょう。',
    position: 'right',
    action: 'click',
  },
  {
    target: '.sidebar-item:nth-child(2) .complete-btn',
    title: 'セクション2を完了',
    description: 'セクション2も完了させましょう。',
    position: 'right',
    action: 'click',
  },
  {
    target: '.sidebar-item:nth-child(3) .complete-btn',
    title: 'セクション3を完了',
    description: '最後のセクションを完了させましょう。',
    position: 'right',
    action: 'click',
  },
  {
    target: '.btn-github-export-small',
    title: 'お疲れ様でした！🎉',
    description: 'GitHubアカウントと連携すれば、学習した題材をリポジトリとして残せます。チュートリアルは以上です！',
    position: 'bottom',
    action: 'none',
  },
];

interface TutorialProps {
  onComplete: () => void;
  page?: 'subjects' | 'sections';
}

export const Tutorial: React.FC<TutorialProps> = ({ onComplete, page = 'subjects' }) => {
  const navigate = useNavigate();
  const tutorialSteps = page === 'sections' ? sectionsTutorialSteps : subjectsTutorialSteps;

  const {
    currentStep,
    step,
    totalSteps,
    goToNextStep,
    completeTutorial,
  } = useTutorialState(tutorialSteps, onComplete);

  const { targetRect, isVisible } = useTargetHighlight({
    targetSelector: step?.target,
    enabled: true,
  });

  const handleSkip = () => {
    completeTutorial();
  };

  const handleNext = () => {
    if (!step) return;

    // ページ遷移が必要な場合
    if (step.navigateTo === 'sections') {
      navigate(`/subjects/${TUTORIAL_SUBJECT_ID}/sections`, {
        state: { continueTutorial: true },
      });
      completeTutorial();
      return;
    }

    // クリックアクションの実行
    if (step.action === 'click' && !step.target.includes('clear-filter')) {
      const target = document.querySelector(step.target) as HTMLElement;
      target?.click();
    }

    // 次のステップへ（遅延を入れてアニメーションを待つ）
    setTimeout(() => {
      const nextStep = tutorialSteps[currentStep + 1];
      if (nextStep) {
        const nextTarget = document.querySelector(nextStep.target) as HTMLElement;
        nextTarget?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      goToNextStep();
    }, 300);
  };

  if (!isVisible || !targetRect || !step) return null;

  const tooltipStyle = calculateTooltipPosition(targetRect, step.position);

  return (
    <div className="tutorial-overlay">
      <svg className="tutorial-mask" width="100%" height="100%">
        <defs>
          <mask id="tutorial-hole">
            <rect width="100%" height="100%" fill="white" />
            <rect
              x={targetRect.left - 8}
              y={targetRect.top - 8}
              width={targetRect.width + 16}
              height={targetRect.height + 16}
              rx="12"
              fill="black"
            />
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.7)"
          mask="url(#tutorial-hole)"
        />
      </svg>

      <div
        className="tutorial-highlight"
        style={{
          top: targetRect.top - 8,
          left: targetRect.left - 8,
          width: targetRect.width + 16,
          height: targetRect.height + 16,
        }}
      />

      <div className="tutorial-tooltip" style={tooltipStyle}>
        <div className="tutorial-step-indicator">
          {currentStep + 1} / {totalSteps}
        </div>
        <h3 className="tutorial-title">{step.title}</h3>
        <p className="tutorial-description">{step.description}</p>
        <div className="tutorial-actions">
          <button className="tutorial-skip" onClick={handleSkip}>
            スキップ
          </button>
          <button className="tutorial-next" onClick={handleNext}>
            次へ →
          </button>
        </div>
      </div>
    </div>
  );
};

// Re-export shouldShowTutorial for backwards compatibility
export { shouldShowTutorial };