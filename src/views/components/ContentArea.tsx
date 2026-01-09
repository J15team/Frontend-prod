/**
 * ContentArea Component
 * コンテンツ表示エリアコンポーネント
 */
import React, { useEffect, useRef, useState } from 'react';
import { marked } from 'marked';
import { type Section } from '@/models/Section';
import { CodeEditor } from '@/views/components/CodeEditor';

interface ContentAreaProps {
  section: Section;
  subjectId: number;
}

export const ContentArea: React.FC<ContentAreaProps> = ({ section, subjectId }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [showEditor, setShowEditor] = useState(true);

  useEffect(() => {
    if (contentRef.current) {
      // Markdownをパースして表示
      contentRef.current.innerHTML = marked.parse(section.description) as string;
    }
  }, [section.description]);

  // セクションの説明からデフォルトコードを抽出（```で囲まれた部分）
  const extractDefaultCode = (description: string): { code: string; language: string } => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/;
    const match = description.match(codeBlockRegex);
    if (match) {
      return {
        language: match[1] || 'javascript',
        code: match[2].trim(),
      };
    }
    return { code: '', language: 'javascript' };
  };

  const { code: defaultCode, language } = extractDefaultCode(section.description);

  return (
    <div className="content-area">
      <header className="content-header">
        <p className="content-section-id">セクション #{section.sectionId}</p>
        <h2>{section.title}</h2>
      </header>
      <div className="content-body" ref={contentRef} />
      
      <div className="content-editor-section">
        <div className="editor-toggle">
          <button
            className={`btn-editor-toggle ${showEditor ? 'active' : ''}`}
            onClick={() => setShowEditor(!showEditor)}
          >
            {showEditor ? '📝 エディタを閉じる' : '📝 コードを書く'}
          </button>
        </div>
        {showEditor && (
          <CodeEditor
            subjectId={subjectId}
            sectionId={section.sectionId}
            defaultCode={defaultCode}
            language={language}
            height="350px"
          />
        )}
      </div>
    </div>
  );
};
