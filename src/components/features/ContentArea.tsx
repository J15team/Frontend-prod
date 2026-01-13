/**
 * ContentArea Component
 * コンテンツ表示エリアコンポーネント
 */
import React, { useEffect, useRef, useCallback } from 'react';
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

  // コードブロックにコピーボタンを追加
  const addCopyButtons = useCallback(() => {
    if (!contentRef.current) return;
    
    const codeBlocks = contentRef.current.querySelectorAll('pre');
    codeBlocks.forEach((pre) => {
      // 既にボタンがあればスキップ
      if (pre.querySelector('.code-copy-btn')) return;
      
      // ラッパーで囲む
      const wrapper = document.createElement('div');
      wrapper.className = 'code-block-wrapper';
      pre.parentNode?.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);
      
      // コピーボタンを追加
      const btn = document.createElement('button');
      btn.className = 'code-copy-btn';
      btn.textContent = '📋 コピー';
      btn.title = 'コードをコピー';
      btn.onclick = async () => {
        const code = pre.querySelector('code')?.textContent || pre.textContent || '';
        try {
          await navigator.clipboard.writeText(code);
          btn.textContent = '✓ コピーしました';
          btn.classList.add('copied');
          setTimeout(() => {
            btn.textContent = '📋 コピー';
            btn.classList.remove('copied');
          }, 2000);
        } catch (err) {
          console.error('コピーに失敗:', err);
        }
      };
      wrapper.appendChild(btn);
    });
  }, []);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.innerHTML = marked.parse(section.description) as string;
      addCopyButtons();
    }
    // セクションが変わったらコンテンツエリアの先頭にスクロール
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [section.description, addCopyButtons]);

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
