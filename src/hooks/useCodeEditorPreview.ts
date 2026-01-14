/**
 * useCodeEditorPreview
 * コードエディタープレビューの状態管理を行うカスタムフック
 */
import { useState, useRef, useCallback } from 'react';

export type CodeLanguage = 'html' | 'css' | 'javascript';

export interface CodeState {
  html: string;
  css: string;
  javascript: string;
}

export const DEFAULT_CODE: CodeState = {
  html: `<div class="container">
  <h1>Hello, World!</h1>
  <button id="btn">クリック</button>
</div>`,
  css: `.container {
  text-align: center;
  padding: 20px;
}
h1 { color: #22c55e; }
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

interface UseCodeEditorPreviewReturn {
  codes: CodeState;
  setCodes: React.Dispatch<React.SetStateAction<CodeState>>;
  activeTab: CodeLanguage;
  setActiveTab: (tab: CodeLanguage) => void;
  iframeRef: React.RefObject<HTMLIFrameElement>;
  updatePreview: () => void;
  updateCode: (language: CodeLanguage, value: string) => void;
}

export const useCodeEditorPreview = (): UseCodeEditorPreviewReturn => {
  const [codes, setCodes] = useState<CodeState>({ html: '', css: '', javascript: '' });
  const [activeTab, setActiveTab] = useState<CodeLanguage>('html');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const updatePreview = useCallback(() => {
    if (!iframeRef.current) return;

    const html = codes.html || DEFAULT_CODE.html;
    const css = codes.css || DEFAULT_CODE.css;
    const js = codes.javascript || DEFAULT_CODE.javascript;

    iframeRef.current.srcdoc = `<!DOCTYPE html>
<html><head><style>${css}</style></head>
<body>${html}<script>try{${js}}catch(e){console.error(e)}</script></body></html>`;
  }, [codes]);

  const updateCode = useCallback((language: CodeLanguage, value: string) => {
    setCodes(prev => ({ ...prev, [language]: value }));
  }, []);

  return {
    codes,
    setCodes,
    activeTab,
    setActiveTab,
    iframeRef,
    updatePreview,
    updateCode,
  };
};
