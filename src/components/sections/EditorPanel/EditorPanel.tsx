/**
 * EditorPanel (V2)
 * エディター/プレビュー/コンソール タブ切り替えコンポーネント
 * プリセット対応・多言語対応
 */
import React, { useState } from 'react';
import { useCodeStorage } from '@/hooks/useCodeStorage';
import { useConsole } from '@/hooks/useConsole';
import { PresetSelector } from '@/components/features/PresetSelector/PresetSelector';
import { CodePreview } from '@/components/features/CodePreview/CodePreview';
import { TerminalPanel } from '@/components/features/TerminalPanel/TerminalPanel';
import { TabButton } from '@/components/common/TabButton/TabButton';

interface EditorPanelProps {
  subjectId: number;
  sectionId: number;
}

type MainTabType = 'editor' | 'preview' | 'console';

const MAIN_TABS: { type: MainTabType; label: string; icon: string }[] = [
  { type: 'editor', label: 'エディタ', icon: '📝' },
  { type: 'preview', label: 'プレビュー', icon: '👁️' },
  { type: 'console', label: 'コンソール', icon: '💻' },
];

export const EditorPanel: React.FC<EditorPanelProps> = ({
  subjectId,
  sectionId,
}) => {
  const [activeTab, setActiveTab] = useState<MainTabType>('editor');

  const {
    preset,
    files,
    activeFile,
    setActiveFile,
    updateFileContent,
    changePreset,
    isLoading,
  } = useCodeStorage({ subjectId, sectionId });

  const {
    messages,
    isRunning,
    runCode,
    clearConsole,
  } = useConsole();

  // ファイル名からアイコンを取得
  const getFileIcon = (filename: string): string => {
    const ext = filename.split('.').pop() || '';
    switch (ext) {
      case 'html': return '🌐';
      case 'css': return '🎨';
      case 'js': return '⚡';
      case 'ts': return '📘';
      case 'tsx': return '⚛️';
      case 'jsx': return '⚛️';
      case 'vue': return '💚';
      case 'py': return '🐍';
      case 'c': return '⚙️';
      default: return '📄';
    }
  };

  // ファイル名からMonaco言語IDを取得
  const getMonacoLanguage = (filename: string): string => {
    const ext = filename.split('.').pop() || '';
    switch (ext) {
      case 'html': return 'html';
      case 'css': return 'css';
      case 'js': return 'javascript';
      case 'ts': return 'typescript';
      case 'tsx': return 'typescript'; // JSXはMonacoではtypescriptで扱う
      case 'jsx': return 'javascript';
      case 'vue': return 'html';
      case 'py': return 'python';
      case 'c': return 'c';
      default: return 'plaintext';
    }
  };

  // コードを実行
  const handleRunCode = () => {
    if (!activeFile) return;
    const file = files[activeFile];
    if (!file) return;
    
    const language = getMonacoLanguage(activeFile);
    runCode(file.content, language);
  };

  // 現在のファイル内容
  const currentFileContent = activeFile ? files[activeFile]?.content || '' : '';
  const currentLanguage = activeFile ? getMonacoLanguage(activeFile) : 'plaintext';
  const fileNames = Object.keys(files);

  if (isLoading) {
    return (
      <div className="editor-panel">
        <div className="editor-panel-loading">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="editor-panel">
      {/* プリセットセレクター */}
      <div className="editor-panel-header">
        <PresetSelector
          selected={preset}
          onChange={(newPreset) => changePreset(newPreset.id)}
        />
      </div>

      {/* メインタブ */}
      <div className="editor-panel-tabs">
        {MAIN_TABS.map((tab) => (
          <TabButton
            key={tab.type}
            label={tab.label}
            icon={tab.icon}
            isActive={activeTab === tab.type}
            onClick={() => setActiveTab(tab.type)}
          />
        ))}
      </div>

      {/* コンテンツ */}
      {activeTab === 'editor' && (
        <div className="editor-content">
          {/* ファイルタブ */}
          <div className="code-editor-tabs">
            {fileNames.map((filename) => (
              <button
                key={filename}
                className={`editor-tab ${activeFile === filename ? 'active' : ''}`}
                onClick={() => setActiveFile(filename)}
              >
                <span className="tab-icon">{getFileIcon(filename)}</span>
                {filename}
              </button>
            ))}
            <span className="editor-autosave">💾 自動保存</span>
          </div>

          {/* Monaco Editor */}
          {activeFile && (
            <div className="code-editor-wrapper">
              <CodeEditorMonaco
                value={currentFileContent}
                language={currentLanguage}
                onChange={(value) => {
                  if (activeFile && value !== undefined) {
                    updateFileContent(activeFile, value);
                  }
                }}
                height="calc(100vh - 420px)"
              />
            </div>
          )}
        </div>
      )}

      {activeTab === 'preview' && (
        <CodePreview
          subjectId={subjectId}
          currentSectionId={sectionId}
        />
      )}

      {activeTab === 'console' && (
        <TerminalPanel
          messages={messages}
          onRun={handleRunCode}
          onClear={clearConsole}
          isRunning={isRunning}
        />
      )}
    </div>
  );
};

// Monaco Editor ラッパーコンポーネント
interface CodeEditorMonacoProps {
  value: string;
  language: string;
  onChange: (value: string | undefined) => void;
  height?: string;
}

const CodeEditorMonaco: React.FC<CodeEditorMonacoProps> = ({
  value,
  language,
  onChange,
  height = '400px',
}) => {
  // 動的インポートでMonaco Editorを読み込み
  const [Editor, setEditor] = useState<React.ComponentType<any> | null>(null);

  React.useEffect(() => {
    import('@monaco-editor/react').then((module) => {
      setEditor(() => module.default);
    });
  }, []);

  if (!Editor) {
    return <div className="editor-loading">エディタを読み込み中...</div>;
  }

  return (
    <Editor
      height={height}
      language={language}
      theme="vs-dark"
      value={value}
      onChange={onChange}
      beforeMount={(monaco: any) => {
        // TypeScript/JavaScript の JSX サポートを有効化
        monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
          jsx: monaco.languages.typescript.JsxEmit.React,
          jsxFactory: 'React.createElement',
          reactNamespace: 'React',
          allowNonTsExtensions: true,
          allowJs: true,
          target: monaco.languages.typescript.ScriptTarget.Latest,
          moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
          module: monaco.languages.typescript.ModuleKind.ESNext,
          noEmit: true,
          esModuleInterop: true,
          strict: false,
          skipLibCheck: true,
        });
        monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
          jsx: monaco.languages.typescript.JsxEmit.React,
          allowJs: true,
          allowNonTsExtensions: true,
        });
        // 診断オプションを設定（エラー表示を軽減）
        monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
          noSemanticValidation: true,
          noSyntaxValidation: false,
        });
        monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
          noSemanticValidation: true,
          noSyntaxValidation: false,
        });
      }}
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
  );
};
