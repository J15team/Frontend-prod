/**
 * Code Preview Component
 * HTML/CSS/JSのライブプレビュー
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { getCode } from '@/utils/storage/codeStorage';

interface CodePreviewProps {
  subjectId: number;
  currentSectionId: number;
}

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

export const CodePreview: React.FC<CodePreviewProps> = ({ subjectId, currentSectionId }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState<string | null>(null);

  const updatePreview = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const getCodeWithFallback = (fileIndex: number, defaultCode: string): string => {
      const current = getCode(subjectId, currentSectionId * 10 + fileIndex);
      if (current?.code) return current.code;
      
      for (let prevSection = currentSectionId - 1; prevSection >= 1; prevSection--) {
        const prev = getCode(subjectId, prevSection * 10 + fileIndex);
        if (prev?.code) return prev.code;
      }
      return defaultCode;
    };

    const htmlCode = getCodeWithFallback(0, DEFAULT_CODE.html);
    const cssCode = getCodeWithFallback(1, DEFAULT_CODE.css);
    const jsCode = getCodeWithFallback(2, DEFAULT_CODE.js);

    const previewHtml = `<!DOCTYPE html>
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
${cssCode}
</style>
</head>
<body>
${htmlCode}
<script>
try {
  ${jsCode}
} catch(e) {
  console.error(e);
}
</script>
</body>
</html>`;

    iframe.srcdoc = previewHtml;
    setError(null);
  }, [subjectId, currentSectionId]);

  useEffect(() => {
    updatePreview();
  }, [updatePreview]);

  return (
    <div className="code-preview-container">
      <div className="preview-header">
        <span>👁️ プレビュー</span>
        <button className="btn-refresh-preview" onClick={updatePreview}>
          🔄 更新
        </button>
      </div>
      {error && <div className="preview-error">{error}</div>}
      <iframe
        ref={iframeRef}
        className="preview-iframe"
        title="Code Preview"
        sandbox="allow-scripts allow-modals allow-same-origin"
      />
    </div>
  );
};
