/**
 * Code Editor Component
 * Monaco Editorを使用したマルチファイルコードエディタ
 */
import React, { useRef, useState } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import { useCodeStorage, type FileType } from '@/hooks/useCodeStorage';

interface CodeEditorProps {
  subjectId: number;
  sectionId: number;
  height?: string;
}

const FILE_TABS: { type: FileType; label: string; icon: string }[] = [
  { type: 'html', label: 'HTML', icon: '🌐' },
  { type: 'css', label: 'CSS', icon: '🎨' },
  { type: 'javascript', label: 'JS', icon: '⚡' },
];

export const CodeEditor: React.FC<CodeEditorProps> = ({
  subjectId,
  sectionId,
  height = '400px',
}) => {
  const [activeFile, setActiveFile] = useState<FileType>('html');
  const editorRef = useRef<unknown>(null);

  const { codes, updateCode } = useCodeStorage({
    subjectId,
    sectionId,
  });

  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  const handleChange = (value: string | undefined) => {
    if (value !== undefined) {
      updateCode(activeFile, value);
    }
  };

  return (
    <div className="code-editor-container">
      <div className="code-editor-tabs">
        {FILE_TABS.map((file) => (
          <button
            key={file.type}
            className={`editor-tab ${activeFile === file.type ? 'active' : ''}`}
            onClick={() => setActiveFile(file.type)}
          >
            <span className="tab-icon">{file.icon}</span>
            {file.label}
          </button>
        ))}
        <span className="editor-autosave">💾 自動保存</span>
      </div>
      <Editor
        height={height}
        language={activeFile}
        theme="vs-dark"
        value={codes[activeFile]}
        onChange={handleChange}
        onMount={handleEditorMount}
        key={`${subjectId}-${sectionId}-${activeFile}`}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
        }}
      />
    </div>
  );
};