/**
 * Code Editor Component
 * Monaco Editorを使用したコードエディタ
 */
import React, { useCallback, useRef } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import { saveCode, getCode } from '@/utils/codeStorage';

interface CodeEditorProps {
  subjectId: number;
  sectionId: number;
  defaultCode?: string;
  language?: string;
  height?: string;
  readOnly?: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  subjectId,
  sectionId,
  defaultCode = '',
  language = 'javascript',
  height = '400px',
  readOnly = false,
}) => {
  const editorRef = useRef<unknown>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 保存済みコードを取得、なければデフォルト
  const savedCode = getCode(subjectId, sectionId);
  const initialCode = savedCode?.code || defaultCode;

  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  const handleChange = useCallback(
    (value: string | undefined) => {
      if (readOnly || !value) return;

      // デバウンス保存（500ms後に保存）
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        saveCode(subjectId, sectionId, value, language);
      }, 500);
    },
    [subjectId, sectionId, language, readOnly]
  );

  return (
    <div className="code-editor-container">
      <div className="code-editor-header">
        <span className="editor-language-badge">{language}</span>
        {!readOnly && <span className="editor-autosave">自動保存</span>}
      </div>
      <Editor
        height={height}
        language={language}
        theme="vs-dark"
        value={initialCode}
        onChange={handleChange}
        onMount={handleEditorMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          readOnly,
          wordWrap: 'on',
        }}
      />
    </div>
  );
};
