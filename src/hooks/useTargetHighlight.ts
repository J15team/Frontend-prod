/**
 * useTargetHighlight
 * チュートリアルのターゲット要素追跡とハイライト位置計算を行うカスタムフック
 */
import { useState, useEffect, useCallback, useRef } from 'react';

interface UseTargetHighlightOptions {
  targetSelector: string | undefined;
  enabled: boolean;
}

interface UseTargetHighlightReturn {
  targetRect: DOMRect | null;
  isVisible: boolean;
}

export const useTargetHighlight = ({
  targetSelector,
  enabled,
}: UseTargetHighlightOptions): UseTargetHighlightReturn => {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const hasScrolledRef = useRef(false);

  // セレクター変更時にスクロールフラグをリセット
  useEffect(() => {
    hasScrolledRef.current = false;
  }, [targetSelector]);

  const updateTargetPosition = useCallback(() => {
    if (!targetSelector || !enabled) {
      setTargetRect(null);
      setIsVisible(false);
      return;
    }

    // 複数セレクターに対応（カンマ区切り）
    const selectors = targetSelector.split(', ');
    let target: Element | null = null;

    for (const selector of selectors) {
      target = document.querySelector(selector);
      if (target) break;
    }

    if (target) {
      const rect = target.getBoundingClientRect();

      // 画面外の場合はスクロール
      if (!hasScrolledRef.current && (rect.top < 0 || rect.bottom > window.innerHeight)) {
        target.scrollIntoView({ behavior: 'smooth', block: 'end' });
        hasScrolledRef.current = true;
      }

      setTargetRect(target.getBoundingClientRect());
      setIsVisible(true);
    } else {
      setTargetRect(null);
    }
  }, [targetSelector, enabled]);

  // requestAnimationFrameでリアルタイム追跡
  useEffect(() => {
    if (!enabled) return;

    let animationId: number;

    const tick = () => {
      updateTargetPosition();
      animationId = requestAnimationFrame(tick);
    };

    animationId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [updateTargetPosition, enabled]);

  return {
    targetRect,
    isVisible,
  };
};

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

interface TooltipStyle {
  top: number;
  left: number;
  transform: string;
}

const TOOLTIP_PADDING = 16;
const TOOLTIP_WIDTH = 320;

/**
 * ツールチップの位置を計算
 */
export const calculateTooltipPosition = (
  targetRect: DOMRect,
  position: TooltipPosition = 'bottom'
): TooltipStyle => {
  const viewportWidth = window.innerWidth;

  switch (position) {
    case 'right':
      return {
        top: targetRect.top + targetRect.height / 2,
        left: targetRect.right + TOOLTIP_PADDING,
        transform: 'translateY(-50%)',
      };

    case 'left':
      return {
        top: targetRect.top + targetRect.height / 2,
        left: targetRect.left - TOOLTIP_WIDTH - TOOLTIP_PADDING,
        transform: 'translateY(-50%)',
      };

    case 'top':
      return {
        top: targetRect.top - TOOLTIP_PADDING,
        left: targetRect.left + targetRect.width / 2,
        transform: 'translate(-50%, -100%)',
      };

    case 'bottom':
    default: {
      const centerX = targetRect.left + targetRect.width / 2;
      let left = centerX;
      let transform = 'translateX(-50%)';

      // 左端にはみ出す場合
      if (centerX < TOOLTIP_WIDTH / 2 + TOOLTIP_PADDING) {
        left = targetRect.left;
        transform = 'none';
      }
      // 右端にはみ出す場合
      else if (centerX > viewportWidth - TOOLTIP_WIDTH / 2 - TOOLTIP_PADDING) {
        left = targetRect.right - TOOLTIP_WIDTH;
        transform = 'none';
      }

      return {
        top: targetRect.bottom + TOOLTIP_PADDING,
        left,
        transform,
      };
    }
  }
};