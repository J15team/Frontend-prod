/**
 * Code Preview Component
 * HTML/CSS/JSのライブプレビュー
 * ロジックはuseCodePreviewフックに分離（Single Responsibility原則）
 */
import React from 'react';
import { useCodePreview } from '@/hooks/useCodePreview';

interface CodePreviewProps {
  subjectId: number;
  currentSectionId: number;
}

export const CodePreview: React.FC<CodePreviewProps> = ({ subjectId, currentSectionId }) => {
  const { iframeRef, error, updatePreview } = useCodePreview({
    subjectId,
    currentSectionId,
  });

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
