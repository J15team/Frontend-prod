/**
 * EditorPanel
 * エディター/プレビュータブ切り替えコンポーネント
 * TabButtonを使用してDRY原則に準拠
 */
import React, { useState } from 'react';
import { CodeEditor } from '@/components/features/CodeEditor/CodeEditor';
import { CodePreview } from '@/components/features/CodePreview/CodePreview';
import { TabButton } from '@/components/common/TabButton/TabButton';

interface EditorPanelProps {
  subjectId: number;
  sectionId: number;
}

type TabType = 'editor' | 'preview';

const TABS: { type: TabType; label: string; icon: string }[] = [
  { type: 'editor', label: 'エディタ', icon: '📝' },
  { type: 'preview', label: 'プレビュー', icon: '👁️' },
];

export const EditorPanel: React.FC<EditorPanelProps> = ({
  subjectId,
  sectionId,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('editor');

  return (
    <div className="editor-panel">
      <div className="editor-panel-tabs">
        {TABS.map((tab) => (
          <TabButton
            key={tab.type}
            label={tab.label}
            icon={tab.icon}
            isActive={activeTab === tab.type}
            onClick={() => setActiveTab(tab.type)}
          />
        ))}
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
