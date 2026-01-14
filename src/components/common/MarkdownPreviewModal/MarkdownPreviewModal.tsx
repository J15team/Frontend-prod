/**
 * MarkdownPreviewModal
 * Markdownコンテンツのプレビューとコードエディターを提供するモーダル
 */
import React, { useState } from 'react';
import { marked } from 'marked';
import Editor from '@monaco-editor/react';
import { useCodeEditorPreview, type CodeLanguage, DEFAULT_CODE } from '@/hooks/useCodeEditorPreview';
import './MarkdownPreviewModal.css';

type ModalTab = 'markdown' | 'code';

interface MarkdownPreviewModalProps {
  isOpen: boolean;
  content: string;
  onClose: () => void;
}

export const MarkdownPreviewModal: React.FC<MarkdownPreviewModalProps> = ({
  isOpen,
  content,
  onClose,
}) => {
  const [activeModalTab, setActiveModalTab] = useState<ModalTab>('markdown');
  const {
    codes,
    activeTab,
    setActiveTab,
    iframeRef,
    updatePreview,
    updateCode,
  } = useCodeEditorPreview();

  if (!isOpen) return null;

  const codeTabs: { key: CodeLanguage; label: string; icon: string }[] = [
    { key: 'html', label: 'HTML', icon: '🌐' },
    { key: 'css', label: 'CSS', icon: '🎨' },
    { key: 'javascript', label: 'JS', icon: '⚡' },
  ];

  return (
    <div
      className={`preview-modal-overlay ${isOpen ? 'show' : ''}`}
      onClick={onClose}
    >
      <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="preview-modal-header">
          <h3>
            {activeModalTab === 'markdown' ? '📄 Markdownプレビュー' : '💻 コードエディター'}
          </h3>
          <div className="preview-modal-tabs">
            <button
              className={`preview-tab-btn ${activeModalTab === 'markdown' ? 'active' : ''}`}
              onClick={() => setActiveModalTab('markdown')}
            >
              📄 Markdown
            </button>
            <button
              className={`preview-tab-btn ${activeModalTab === 'code' ? 'active' : ''}`}
              onClick={() => setActiveModalTab('code')}
            >
              💻 コードエディター
            </button>
          </div>
          <button className="preview-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {activeModalTab === 'markdown' ? (
          <div
            className="preview-modal-content markdown-body"
            dangerouslySetInnerHTML={{ __html: marked(content) as string }}
          />
        ) : (
          <div className="preview-modal-code">
            <div className="code-editor-section">
              <div className="code-tabs">
                {codeTabs.map((tab) => (
                  <button
                    key={tab.key}
                    className={`code-tab ${activeTab === tab.key ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>
              <Editor
                height="300px"
                language={activeTab}
                theme="vs-dark"
                value={codes[activeTab] || DEFAULT_CODE[activeTab]}
                onChange={(value) => updateCode(activeTab, value || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                }}
              />
            </div>

            <div className="code-preview-section">
              <div className="code-preview-header">
                <span>👁️ プレビュー</span>
                <button className="btn-run-code" onClick={updatePreview}>
                  ▶ 実行
                </button>
              </div>
              <iframe
                ref={iframeRef}
                className="code-preview-iframe"
                title="Code Preview"
                sandbox="allow-scripts allow-modals"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
