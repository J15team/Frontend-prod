/**
 * Code Editor Component
 * Monaco Editorを使用したマルチファイルコードエディタ
 */
import React, { useCallback, useRef, useState, useEffect } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import { saveCode, getCode } from '@/utils/codeStorage';

interface CodeEditorProps {
  subjectId: number;
  sectionId: number;
  height?: string;
}

type FileType = 'html' | 'css' | 'javascript';

const FILE_TABS: { type: FileType; label: string; icon: string }[] = [
  { type: 'html', label: 'HTML', icon: '🌐' },
  { type: 'css', label: 'CSS', icon: '🎨' },
  { type: 'javascript', label: 'JS', icon: '⚡' },
];

const DEFAULT_CODE: Record<FileType, string> = {
  html: `<div class="container">
  <h1>Hello, World!</h1>
  <button id="btn">クリック</button>
</div>`,
  css: `.container {
  text-align: center;
  padding: 20px;
}

h1 {
  color: #22c55e;
}

button {
  padding: 10px 20px;
  background: #22c55e;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}`,
  javascript: `const btn = document.getElementById('btn');
btn.addEventListener('click', () => {
  alert('ボタンがクリックされました！');
});`,
};

export const CodeEditor: React.FC<CodeEditorProps> = ({
  subjectId,
  sectionId,
  height = '400px',
}) => {
  const [activeFile, setActiveFile] = useState<FileType>('html');
  const [codes, setCodes] = useState<Record<FileType, string>>({
    html: '',
    css: '',
    javascript: '',
  });
  const editorRef = useRef<unknown>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // セクション変更時にコードを読み込み（前のセクションから引き継ぎ）
  useEffect(() => {
    const loadCodes = () => {
      const newCodes: Record<FileType, string> = { html: '', css: '', javascript: '' };
      
      FILE_TABS.forEach((file, index) => {
        // まず現在のセクションのコードを確認
        const currentSaved = getCode(subjectId, sectionId * 10 + index);
        if (currentSaved?.code) {
          newCodes[file.type] = currentSaved.code;
        } else {
          // なければ前のセクションのコードを探す
          let foundCode = '';
          for (let prevSection = sectionId - 1; prevSection >= 1; prevSection--) {
            const prevSaved = getCode(subjectId, prevSection * 10 + index);
            if (prevSaved?.code) {
              foundCode = prevSaved.code;
              break;
            }
          }
          // 前のセクションにもなければデフォルト
          newCodes[file.type] = foundCode || DEFAULT_CODE[file.type];
        }
      });
      
      setCodes(newCodes);
    };
    
    loadCodes();
  }, [subjectId, sectionId]);

  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  const handleChange = useCallback(
    (value: string | undefined) => {
      if (!value) return;

      // 状態を更新
      setCodes(prev => ({ ...prev, [activeFile]: value }));

      // デバウンス保存（500ms後に保存）
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        const fileIndex = FILE_TABS.findIndex(f => f.type === activeFile);
        saveCode(subjectId, sectionId * 10 + fileIndex, value, activeFile);
      }, 500);
    },
    [subjectId, sectionId, activeFile]
  );

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
