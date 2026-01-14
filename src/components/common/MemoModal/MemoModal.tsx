/**
 * MemoModal
 * メモ帳機能を提供するモーダルコンポーネント
 */
import React from 'react';
import './MemoModal.css';

interface MemoModalProps {
  isOpen: boolean;
  content: string;
  saved: boolean;
  onContentChange: (value: string) => void;
  onSave: () => void;
  onClear: () => void;
  onClose: () => void;
}

export const MemoModal: React.FC<MemoModalProps> = ({
  isOpen,
  content,
  saved,
  onContentChange,
  onSave,
  onClear,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="memo-modal-overlay" onClick={onClose}>
      <div className="memo-panel" onClick={(e) => e.stopPropagation()}>
        <div className="memo-panel-header">
          <span>📝 メモ帳</span>
          <div className="memo-actions">
            {saved && <span className="memo-saved-indicator">✓ 保存しました</span>}
            <button className="btn-memo-save" onClick={onSave}>
              保存
            </button>
            <button className="btn-memo-clear" onClick={onClear}>
              クリア
            </button>
            <button className="memo-close-btn" onClick={onClose}>
              ×
            </button>
          </div>
        </div>
        <textarea
          className="memo-textarea"
          placeholder="記事の下書きやメモをここに書いてください...&#10;&#10;セクションに紐づかない全体的なメモを一時保存できます。"
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
        />
      </div>
    </div>
  );
};
