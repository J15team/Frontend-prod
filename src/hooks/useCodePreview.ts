/**
 * useCodePreview
 * CodePreviewのロジックを分離したカスタムフック
 * Single Responsibility: プレビューHTML生成とコード取得ロジックのみを担当
 */
import { useCallback, useRef, useState, useEffect } from 'react';
import { getCode } from '@/utils/storage/codeStorage';

const DEFAULT_CODE = {
  html: `<div class="container">
  <h1>Hello, World!</h1>
  <button id="btn">クリック</button>
</div>`,
  css: `.container {
  text-align: center;
  padding: 20px;
}

h1 {
  color: #22c55e;
}

button {
  padding: 10px 20px;
  background: #22c55e;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}`,
  js: `const btn = document.getElementById('btn');
btn.addEventListener('click', () => {
  alert('ボタンがクリックされました！');
});`,
};

interface UseCodePreviewOptions {
  subjectId: number;
  currentSectionId: number;
}

/**
 * 指定セクションのコードを取得、なければ前のセクションから継承
 */
const getCodeWithFallback = (
  subjectId: number,
  currentSectionId: number,
  fileIndex: number,
  defaultCode: string
): string => {
  const current = getCode(subjectId, currentSectionId * 10 + fileIndex);
  if (current?.code) return current.code;

  for (let prevSection = currentSectionId - 1; prevSection >= 1; prevSection--) {
    const prev = getCode(subjectId, prevSection * 10 + fileIndex);
    if (prev?.code) return prev.code;
  }
  return defaultCode;
};

/**
 * プレビュー用HTMLを生成
 */
const generatePreviewHtml = (html: string, css: string, js: string): string => {
  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
* { box-sizing: border-box; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  margin: 0;
  padding: 16px;
  background: #fff;
}
${css}
</style>
</head>
<body>
${html}
<script>
try {
  ${js}
} catch(e) {
  console.error(e);
}
</script>
</body>
</html>`;
};

export const useCodePreview = ({ subjectId, currentSectionId }: UseCodePreviewOptions) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState<string | null>(null);

  const updatePreview = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const htmlCode = getCodeWithFallback(subjectId, currentSectionId, 0, DEFAULT_CODE.html);
    const cssCode = getCodeWithFallback(subjectId, currentSectionId, 1, DEFAULT_CODE.css);
    const jsCode = getCodeWithFallback(subjectId, currentSectionId, 2, DEFAULT_CODE.js);

    iframe.srcdoc = generatePreviewHtml(htmlCode, cssCode, jsCode);
    setError(null);
  }, [subjectId, currentSectionId]);

  useEffect(() => {
    updatePreview();
  }, [updatePreview]);

  return {
    iframeRef,
    error,
    updatePreview,
  };
};
