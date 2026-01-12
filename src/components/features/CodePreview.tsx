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

export const CodePreview: React.FC<CodePreviewProps> = ({ subjectId, currentSectionId }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState<string | null>(null);

  // プレビューを更新
  const updatePreview = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    // 各ファイルタイプのコードを取得（前のセクションから引き継ぎ）
    const getCodeWithFallback = (fileIndex: number): string => {
      // まず現在のセクションを確認
      const current = getCode(subjectId, currentSectionId * 10 + fileIndex);
      if (current?.code) return current.code;
      
      // なければ前のセクションを探す
      for (let prevSection = currentSectionId - 1; prevSection >= 1; prevSection--) {
        const prev = getCode(subjectId, prevSection * 10 + fileIndex);
        if (prev?.code) return prev.code;
      }
      return '';
    };

    const htmlCode = getCodeWithFallback(0);
    const cssCode = getCodeWithFallback(1);
    const jsCode = getCodeWithFallback(2);

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
${htmlCode || '<p style="color: #999;">HTMLタブでコードを書くとここにプレビューが表示されます</p>'}
<script>
try {
  ${jsCode}
} catch(e) {
  console.error(e);
}
</script>
</body>
</html>`;

    // srcdocを使用（より安全で確実）
    iframe.srcdoc = previewHtml;
    setError(null);
  }, [subjectId, currentSectionId]);

  // 定期的にプレビューを更新
  useEffect(() => {
    updatePreview();
    const interval = setInterval(updatePreview, 1500);
    return () => clearInterval(interval);
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
        sandbox="allow-scripts"
      />
    </div>
  );
};
