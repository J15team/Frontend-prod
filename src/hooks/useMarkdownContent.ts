/**
 * useMarkdownContent
 * Markdownコンテンツのレンダリングとコードブロック拡張を管理するカスタムフック
 */
import { useEffect, useRef, useCallback } from 'react';
import { marked } from 'marked';

interface UseMarkdownContentOptions {
  content: string;
}

interface UseMarkdownContentReturn {
  contentRef: React.RefObject<HTMLDivElement>;
  containerRef: React.RefObject<HTMLDivElement>;
}

/**
 * コードブロックにコピーボタンを追加
 */
const addCopyButtonsToCodeBlocks = (container: HTMLElement): void => {
  const codeBlocks = container.querySelectorAll('pre');

  codeBlocks.forEach((pre) => {
    // 既にボタンがある場合はスキップ
    if (pre.querySelector('.code-copy-btn')) return;

    // ラッパーを作成
    const wrapper = document.createElement('div');
    wrapper.className = 'code-block-wrapper';
    pre.parentNode?.insertBefore(wrapper, pre);
    wrapper.appendChild(pre);

    // コピーボタンを作成
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
};

export const useMarkdownContent = ({
  content,
}: UseMarkdownContentOptions): UseMarkdownContentReturn => {
  const contentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const renderContent = useCallback(() => {
    if (!contentRef.current) return;

    // Markdownをパースして挿入
    contentRef.current.innerHTML = marked.parse(content) as string;

    // コードブロックにコピーボタンを追加
    addCopyButtonsToCodeBlocks(contentRef.current);
  }, [content]);

  useEffect(() => {
    renderContent();

    // コンテンツ変更時にスクロールをトップに戻す
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [renderContent]);

  return {
    contentRef,
    containerRef,
  };
};