/**
 * ContentArea Component
 * コンテンツ表示エリアコンポーネント
 */
import React, { useEffect, useRef } from 'react';
import { marked } from 'marked';
import { type Section } from '@/models/Section';

interface ContentAreaProps {
  section: Section;
  isCleared: boolean;
  onComplete: () => void;
  onNext: () => void;
  onPrev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
}

export const ContentArea: React.FC<ContentAreaProps> = ({ 
  section, 
  isCleared, 
  onComplete, 
  onNext,
  onPrev,
  hasNext,
  hasPrev
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.innerHTML = marked.parse(section.description) as string;
    }
    // セクションが変わったらコンテンツエリアの先頭にスクロール
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [section.description]);

  return (
    <div className="content-area" ref={containerRef}>
      <header className="content-header">
        <p className="content-section-id">セクション #{section.sectionId}</p>
        <h2>{section.title}</h2>
      </header>
      <div className="content-body" ref={contentRef} />
      
      <div className="content-actions">
        <div className="content-actions-left">
          {hasPrev && (
            <button className="btn-prev-section" onClick={onPrev}>
              ← 前のセクション
            </button>
          )}
        </div>
        <div className="content-actions-center">
          {!isCleared ? (
            <button className="btn-complete-section" onClick={onComplete}>
              ✓ このセクションを完了する
            </button>
          ) : (
            <div className="section-completed-badge">
              ✓ 完了済み
            </div>
          )}
        </div>
        <div className="content-actions-right">
          {hasNext && (
            <button className="btn-next-section" onClick={onNext}>
              次のセクションへ →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
