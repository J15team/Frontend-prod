/**
 * Code Preview Component
 * HTML/CSS/JSのライブプレビュー
 */
import React, { useEffect, useRef, useState } from 'react';
import { getSubjectCodes } from '@/utils/codeStorage';

interface CodePreviewProps {
  subjectId: number;
  currentSectionId: number;
}

export const CodePreview: React.FC<CodePreviewProps> = ({ subjectId, currentSectionId }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());

  // プレビューを更新
  const updatePreview = () => {
    if (!iframeRef.current) return;

    const codes = getSubjectCodes(subjectId);
    
    // 言語ごとにコードを分類
    let htmlCode = '';
    let cssCode = '';
    let jsCode = '';

    codes.forEach((codeData) => {
      const code = codeData.code;
      const lang = codeData.language.toLowerCase();

      if (lang === 'html') {
        htmlCode += code + '\n';
      } else if (lang === 'css') {
        cssCode += code + '\n';
      } else if (lang === 'javascript' || lang === 'js') {
        jsCode += code + '\n';
      }
    });
    
    // HTMLドキュメントを生成
    const previewHtml = `
<!DOCTYPE html>
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
  ${htmlCode || '<p style="color: #999;">HTMLコードを書くとここにプレビューが表示されます</p>'}
  <script>
    // エラーをキャッチして親に通知
    window.onerror = function(msg, url, line) {
      window.parent.postMessage({ type: 'preview-error', message: msg, line: line }, '*');
      return true;
    };
    try {
      ${jsCode}
    } catch(e) {
      window.parent.postMessage({ type: 'preview-error', message: e.message }, '*');
    }
  </script>
</body>
</html>`;

    try {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(previewHtml);
        doc.close();
        setError(null);
      }
    } catch (e) {
      setError('プレビューの更新に失敗しました');
    }
  };

  // エラーメッセージを受け取る
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'preview-error') {
        setError(`エラー: ${event.data.message}`);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // 定期的にプレビューを更新（コード変更を検知）
  useEffect(() => {
    updatePreview();
    
    const interval = setInterval(() => {
      setLastUpdate(Date.now());
      updatePreview();
    }, 1000);

    return () => clearInterval(interval);
  }, [subjectId, currentSectionId, lastUpdate]);

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
        sandbox="allow-scripts allow-modals"
      />
    </div>
  );
};
