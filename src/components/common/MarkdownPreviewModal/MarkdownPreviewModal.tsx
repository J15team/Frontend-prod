/**
 * MarkdownPreviewModal
 * Markdownコンテンツのプレビューとコードエディターを提供するモーダル
 * 全プリセット対応（HTML/CSS/JS, TypeScript, React, Vue, Python）
 */
import React, { useState, useRef, useCallback } from 'react';
import { marked } from 'marked';
import Editor from '@monaco-editor/react';
import { PRESETS, getPresetById } from '@/config/languageConfig';
import { 
  generateReactPreview, 
  generateVuePreview, 
  generateTypeScriptPreview 
} from '@/runtime/frameworkPreview';
import './MarkdownPreviewModal.css';

type ModalTab = 'markdown' | 'code';

interface MarkdownPreviewModalProps {
  isOpen: boolean;
  content: string;
  onClose: () => void;
}

// デフォルトコード
const getDefaultCodes = (presetId: string): Record<string, string> => {
  const preset = getPresetById(presetId);
  if (!preset) return {};
  
  const codes: Record<string, string> = {};
  preset.files.forEach(file => {
    codes[file.name] = file.defaultContent;
  });
  return codes;
};

export const MarkdownPreviewModal: React.FC<MarkdownPreviewModalProps> = ({
  isOpen,
  content,
  onClose,
}) => {
  const [activeModalTab, setActiveModalTab] = useState<ModalTab>('markdown');
  const [selectedPreset, setSelectedPreset] = useState('web-basics');
  const [codes, setCodes] = useState<Record<string, string>>(() => getDefaultCodes('web-basics'));
  const [activeFile, setActiveFile] = useState('index.html');
  const [isRunning, setIsRunning] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const preset = getPresetById(selectedPreset);
  const files = preset?.files || [];

  const handlePresetChange = (newPresetId: string) => {
    setSelectedPreset(newPresetId);
    const newCodes = getDefaultCodes(newPresetId);
    setCodes(newCodes);
    const newPreset = getPresetById(newPresetId);
    if (newPreset && newPreset.files.length > 0) {
      setActiveFile(newPreset.files[0].name);
    }
  };

  const updateCode = useCallback((filename: string, value: string) => {
    setCodes(prev => ({ ...prev, [filename]: value }));
  }, []);

  const getMonacoLanguage = (filename: string): string => {
    const ext = filename.split('.').pop() || '';
    switch (ext) {
      case 'html': return 'html';
      case 'css': return 'css';
      case 'js': return 'javascript';
      case 'ts': return 'typescript';
      case 'tsx': return 'typescript';
      case 'vue': return 'html';
      case 'py': return 'python';
      default: return 'plaintext';
    }
  };

  const runPreview = useCallback(async () => {
    if (!iframeRef.current) return;
    setIsRunning(true);

    try {
      let previewHtml = '';

      switch (selectedPreset) {
        case 'web-basics': {
          const html = codes['index.html'] || '';
          const css = codes['style.css'] || '';
          const js = codes['script.js'] || '';
          previewHtml = `<!DOCTYPE html>
<html><head><style>${css}</style></head>
<body>${html}<script>try{${js}}catch(e){document.body.innerHTML='<pre style="color:red;">'+e.message+'</pre>';}</script></body></html>`;
          break;
        }
        case 'typescript-basics': {
          const tsCode = codes['main.ts'] || '';
          previewHtml = generateTypeScriptPreview(tsCode);
          break;
        }
        case 'react': {
          const reactCode = codes['App.tsx'] || '';
          const reactCss = codes['styles.css'] || '';
          previewHtml = generateReactPreview(reactCode, reactCss);
          break;
        }
        case 'vue': {
          const vueCode = codes['App.vue'] || '';
          previewHtml = generateVuePreview(vueCode);
          break;
        }
        case 'python': {
          // PythonはPyodideが必要なため、シンプルなメッセージを表示
          const pyCode = codes['main.py'] || '';
          previewHtml = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: monospace; background: #1e1e1e; color: #d4d4d4; padding: 1rem; }
    .output { white-space: pre-wrap; }
    #loading { color: #ffc107; }
  </style>
  <script src="https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js"></script>
</head>
<body>
  <div id="loading">🐍 Python を読み込み中...</div>
  <div id="output" class="output"></div>
  <script>
    async function runPython() {
      const outputEl = document.getElementById('output');
      const loadingEl = document.getElementById('loading');
      try {
        const pyodide = await loadPyodide();
        loadingEl.style.display = 'none';
        
        // stdout/stderrをキャプチャ
        pyodide.runPython(\`
import sys
from io import StringIO
sys.stdout = StringIO()
sys.stderr = StringIO()
\`);
        
        pyodide.runPython(\`${pyCode.replace(/`/g, '\\`').replace(/\\/g, '\\\\')}\`);
        
        const stdout = pyodide.runPython('sys.stdout.getvalue()');
        const stderr = pyodide.runPython('sys.stderr.getvalue()');
        
        outputEl.textContent = stdout + stderr;
      } catch(e) {
        loadingEl.style.display = 'none';
        outputEl.innerHTML = '<span style="color:#f44336;">❌ ' + e.message + '</span>';
      }
    }
    runPython();
  </script>
</body>
</html>`;
          break;
        }
        default:
          previewHtml = `<!DOCTYPE html><body style="padding:1rem;font-family:sans-serif;background:#1e1e1e;color:#d4d4d4;">
<p>⚠️ プレビューは利用できません</p></body></html>`;
      }

      iframeRef.current.srcdoc = previewHtml;
    } finally {
      setIsRunning(false);
    }
  }, [codes, selectedPreset]);

  if (!isOpen) return null;

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
              {/* プリセット選択 */}
              <div className="preset-selector-bar">
                <span>プリセット:</span>
                <select
                  value={selectedPreset}
                  onChange={(e) => handlePresetChange(e.target.value)}
                >
                  {PRESETS.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.icon} {p.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* ファイルタブ */}
              <div className="code-tabs">
                {files.map((file) => (
                  <button
                    key={file.name}
                    className={`code-tab ${activeFile === file.name ? 'active' : ''}`}
                    onClick={() => setActiveFile(file.name)}
                  >
                    {file.name}
                  </button>
                ))}
              </div>
              
              <Editor
                height="300px"
                language={getMonacoLanguage(activeFile)}
                theme="vs-dark"
                value={codes[activeFile] || ''}
                onChange={(value) => updateCode(activeFile, value || '')}
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
                <button 
                  className="btn-run-code" 
                  onClick={runPreview}
                  disabled={isRunning}
                >
                  {isRunning ? '⏳ 実行中...' : '▶ 実行'}
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
