/**
 * Tutorial Component
 * 初回ログイン時のインタラクティブチュートリアル
 * 特定の要素をハイライトして他を触れなくする
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

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

// セクションページ用のステップ
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
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  const tutorialSteps = page === 'sections' ? sectionsTutorialSteps : subjectsTutorialSteps;
  const step = tutorialSteps[currentStep];

  // ステップが変わったらスクロールフラグをリセット
  useEffect(() => {
    setHasScrolled(false);
  }, [currentStep]);

  const updateTargetPosition = useCallback(() => {
    if (!step) return;
    
    // 複数のセレクタがある場合、最初に見つかったものを使う
    const selectors = step.target.split(', ');
    let target: Element | null = null;
    
    for (const selector of selectors) {
      target = document.querySelector(selector);
      if (target) break;
    }
    
    if (target) {
      const rect = target.getBoundingClientRect();
      
      // ターゲットが画面外の場合は一度だけスクロール
      if (!hasScrolled && (rect.top < 0 || rect.bottom > window.innerHeight)) {
        target.scrollIntoView({ behavior: 'smooth', block: 'end' });
        setHasScrolled(true);
      }
      
      setTargetRect(target.getBoundingClientRect());
      setIsVisible(true);
    } else {
      // ターゲットが見つからない場合は待機
      setTargetRect(null);
    }
  }, [step, hasScrolled]);

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
    // クリックリスナーは使わない（handleNextで制御）
    return;
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
    // navigateToがある場合（最後のステップ）- 直接遷移
    if (step.navigateTo === 'sections') {
      navigate(`/subjects/${TUTORIAL_SUBJECT_ID}/sections`, {
        state: { continueTutorial: true }
      });
      onComplete();
      return;
    }
    
    // action: 'none'の場合はクリックしない
    // ターゲット要素をクリック（クリアボタンは除く）
    if (step.action === 'click' && !step.target.includes('clear-filter')) {
      const target = document.querySelector(step.target) as HTMLElement;
      if (target) {
        target.click();
      }
    }
    // 少し遅延してから次のステップへ（DOMの更新を待つ）
    setTimeout(() => {
      // 次のステップのターゲットにスクロール
      const nextStep = tutorialSteps[currentStep + 1];
      if (nextStep) {
        const nextTarget = document.querySelector(nextStep.target) as HTMLElement;
        if (nextTarget) {
          nextTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      
      if (currentStep < tutorialSteps.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        handleComplete();
      }
    }, 300);
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
 * バックエンドのisFirstLoginを優先し、localStorageはスキップ時のフォールバック
 */
export const shouldShowTutorial = (isFirstLogin?: boolean): boolean => {
  // セッション中にスキップ/完了した場合は表示しない
  if (localStorage.getItem('tutorial_completed') === 'true') {
    return false;
  }
  // バックエンドからisFirstLogin=trueが返ってきた場合のみ表示
  return isFirstLogin === true;
};
