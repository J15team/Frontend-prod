/**
 * Tutorial Component
 * 初回ログイン時のインタラクティブチュートリアル
 * 特定の要素をハイライトして他を触れなくする
 */
import React, { useState, useEffect, useCallback } from 'react';

interface TutorialStep {
  target: string;        // CSSセレクタ
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: 'click' | 'none';  // クリックで次に進むか
  navigateTo?: string;   // クリック後に遷移する場合のパス
}

// チュートリアル用題材ID
const TUTORIAL_SUBJECT_ID = 100;

// 題材一覧ページ用のステップ
const subjectsTutorialSteps: TutorialStep[] = [
  {
    target: '.hamburger-btn',
    title: '進捗を確認しよう',
    description: 'ここをクリックすると、全体の学習進捗を確認できます。試してみてください！',
    position: 'bottom',
    action: 'click',
  },
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
    target: `[data-subject-id="${TUTORIAL_SUBJECT_ID}"], .subject-card:first-child`,
    title: 'チュートリアル題材を始めよう',
    description: '「はじめてのPathly」をクリックして、基本操作を学びましょう！',
    position: 'bottom',
    action: 'click',
    navigateTo: 'sections',
  },
];

// セクションページ用のステップ
const sectionsTutorialSteps: TutorialStep[] = [
  {
    target: '.sidebar-item:first-child',
    title: 'セクションを選択',
    description: '左のリストからセクションを選んで学習を進めましょう。',
    position: 'right',
    action: 'click',
  },
  {
    target: '.tab-btn:nth-child(2)',
    title: 'コードを書いてみよう',
    description: 'エディタタブをクリックして、実際にコードを書いてみましょう。',
    position: 'top',
    action: 'click',
  },
  {
    target: '.btn-complete-section',
    title: 'セクション完了',
    description: '学習が終わったら「完了」ボタンを押して次に進みましょう！これでチュートリアルは終了です。',
    position: 'top',
    action: 'click',
  },
];

interface TutorialProps {
  onComplete: () => void;
  page?: 'subjects' | 'sections';
}

export const Tutorial: React.FC<TutorialProps> = ({ onComplete, page = 'subjects' }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const tutorialSteps = page === 'sections' ? sectionsTutorialSteps : subjectsTutorialSteps;
  const step = tutorialSteps[currentStep];

  const updateTargetPosition = useCallback(() => {
    if (!step) return;
    
    const target = document.querySelector(step.target);
    if (target) {
      const rect = target.getBoundingClientRect();
      setTargetRect(rect);
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [step]);

  // 常に位置を再計算（60fps）
  useEffect(() => {
    let animationId: number;
    
    const tick = () => {
      updateTargetPosition();
      animationId = requestAnimationFrame(tick);
    };
    
    animationId = requestAnimationFrame(tick);
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [updateTargetPosition]);

  useEffect(() => {
    if (!step || step.action !== 'click') return;

    const target = document.querySelector(step.target);
    if (!target) return;

    const handleClick = () => {
      if (currentStep < tutorialSteps.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        handleComplete();
      }
    };

    target.addEventListener('click', handleClick);
    return () => target.removeEventListener('click', handleClick);
  }, [currentStep, step]);

  const handleComplete = () => {
    setIsVisible(false);
    localStorage.setItem('tutorial_completed', 'true');
    onComplete();
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleNext = () => {
    // ターゲット要素をクリック
    const target = document.querySelector(step.target) as HTMLElement;
    if (target) {
      target.click();
    }
    // 次のステップへ
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  if (!isVisible || !targetRect || !step) return null;

  // ツールチップの位置計算
  const getTooltipStyle = (): React.CSSProperties => {
    const padding = 16;
    const tooltipWidth = 320;
    const viewportWidth = window.innerWidth;
    
    switch (step.position) {
      case 'right':
        return {
          top: targetRect.top + targetRect.height / 2,
          left: targetRect.right + padding,
          transform: 'translateY(-50%)',
        };
      case 'left':
        return {
          top: targetRect.top + targetRect.height / 2,
          left: targetRect.left - tooltipWidth - padding,
          transform: 'translateY(-50%)',
        };
      case 'top':
        return {
          top: targetRect.top - padding,
          left: targetRect.left + targetRect.width / 2,
          transform: 'translate(-50%, -100%)',
        };
      case 'bottom':
      default: {
        // 左端に近い場合は左寄せ、右端に近い場合は右寄せ
        const centerX = targetRect.left + targetRect.width / 2;
        let left = centerX;
        let transform = 'translateX(-50%)';
        
        if (centerX < tooltipWidth / 2 + padding) {
          // 左端に近い場合
          left = targetRect.left;
          transform = 'none';
        } else if (centerX > viewportWidth - tooltipWidth / 2 - padding) {
          // 右端に近い場合
          left = targetRect.right - tooltipWidth;
          transform = 'none';
        }
        
        return {
          top: targetRect.bottom + padding,
          left,
          transform,
        };
      }
    }
  };

  return (
    <div className="tutorial-overlay">
      {/* 暗いオーバーレイ（ターゲット部分だけ穴を開ける） */}
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

      {/* ハイライト枠 */}
      <div
        className="tutorial-highlight"
        style={{
          top: targetRect.top - 8,
          left: targetRect.left - 8,
          width: targetRect.width + 16,
          height: targetRect.height + 16,
        }}
      />

      {/* クリック可能エリア（ターゲット要素の上に配置） */}
      <div
        className="tutorial-clickable"
        style={{
          position: 'fixed',
          top: targetRect.top - 8,
          left: targetRect.left - 8,
          width: targetRect.width + 16,
          height: targetRect.height + 16,
          cursor: 'pointer',
          zIndex: 10002,
        }}
        onClick={() => {
          // 実際のターゲット要素をクリック
          const target = document.querySelector(step.target) as HTMLElement;
          if (target) {
            target.click();
          }
          // 次のステップへ進む
          if (step.action === 'click') {
            if (currentStep < tutorialSteps.length - 1) {
              setCurrentStep(prev => prev + 1);
            } else {
              handleComplete();
            }
          }
        }}
      />

      {/* ツールチップ */}
      <div className="tutorial-tooltip" style={getTooltipStyle()}>
        <div className="tutorial-step-indicator">
          {currentStep + 1} / {tutorialSteps.length}
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

/**
 * チュートリアルが必要かどうかを判定
 * TODO: バックエンド修正後に isFirstLogin === true に戻す
 */
export const shouldShowTutorial = (_isFirstLogin?: boolean): boolean => {
  // すでに完了している場合は表示しない
  if (localStorage.getItem('tutorial_completed') === 'true') {
    return false;
  }
  // 強制表示モード（テスト用）
  return true;
};
