/**
 * EditorPanel
 * エディター/プレビュータブ切り替えコンポーネント
 */
import React, { useState } from 'react';
import { CodeEditor } from '@/components/features/CodeEditor/CodeEditor';
import { CodePreview } from '@/components/features/CodePreview/CodePreview';

interface EditorPanelProps {
  subjectId: number;
  sectionId: number;
}

type TabType = 'editor' | 'preview';

export const EditorPanel: React.FC<EditorPanelProps> = ({
  subjectId,
  sectionId,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('editor');

  return (
    <div className="editor-panel">
      <div className="editor-panel-tabs">
        <button
          className={`tab-btn ${activeTab === 'editor' ? 'active' : ''}`}
          onClick={() => setActiveTab('editor')}
        >
          📝 エディタ
        </button>
        <button
          className={`tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
          onClick={() => setActiveTab('preview')}
        >
          👁️ プレビュー
        </button>
      </div>
      {activeTab === 'editor' ? (
        <CodeEditor
          subjectId={subjectId}
          sectionId={sectionId}
          height="calc(100vh - 420px)"
        />
      ) : (
        <CodePreview
          subjectId={subjectId}
          currentSectionId={sectionId}
        />
      )}
    </div>
  );
};
