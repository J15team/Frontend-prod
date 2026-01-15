/**
 * useCodePreview (V2)
 * プリセット対応のプレビューフック
 * React/Vue/Python対応
 * ホットリロード対応
 */
import { useCallback, useRef, useState, useEffect } from 'react';
import { getProject } from '@/utils/storage/codeStorage';
import { getPresetById, DEFAULT_PRESET } from '@/config/languageConfig';
import {
  generateReactPreview,
  generateVuePreview,
  generateTypeScriptPreview,
} from '@/runtime/frameworkPreview';
import { generatePythonPreview } from '@/runtime/pythonRuntime';

interface UseCodePreviewOptions {
  subjectId: number;
  currentSectionId: number;
  autoRefresh?: boolean;
  autoRefreshDelay?: number;
}

/**
 * Web基礎（HTML/CSS/JS）のプレビューHTML生成
 */
const generateWebBasicsPreview = (html: string, css: string, js: string): string => {
  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
* { box-sizing: border-box; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  margin: 0;
  padding: 16px;
  background: #fff;
}
${css}
</style>
</head>
<body>
${html}
<script>
try {
  ${js}
} catch(e) {
  console.error(e);
}
</script>
</body>
</html>`;
};

export const useCodePreview = ({ 
  subjectId, 
  currentSectionId,
  autoRefresh = true,
  autoRefreshDelay = 800,
}: UseCodePreviewOptions) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [presetId, setPresetId] = useState<string>('web-basics');
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastContentRef = useRef<string>('');

  const updatePreview = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    // プロジェクトを取得
    const project = getProject(subjectId, currentSectionId);
    if (!project) {
      // デフォルトのWeb基礎プレビュー
      iframe.srcdoc = generateWebBasicsPreview(
        '<div class="container"><h1>Hello, World!</h1></div>',
        '.container { text-align: center; padding: 2rem; } h1 { color: #22c55e; }',
        'console.log("Ready!");'
      );
      return;
    }

    setPresetId(project.presetId);
    const preset = getPresetById(project.presetId) || DEFAULT_PRESET;

    try {
      let previewHtml = '';

      switch (project.presetId) {
        case 'web-basics': {
          const html = project.files['index.html']?.content || '';
          const css = project.files['style.css']?.content || '';
          const js = project.files['script.js']?.content || '';
          previewHtml = generateWebBasicsPreview(html, css, js);
          break;
        }

        case 'typescript-basics': {
          const code = project.files['main.ts']?.content || '';
          previewHtml = generateTypeScriptPreview(code);
          break;
        }

        case 'react': {
          const code = project.files['App.tsx']?.content || '';
          const css = project.files['styles.css']?.content || '';
          previewHtml = generateReactPreview(code, css);
          break;
        }

        case 'vue': {
          const code = project.files['App.vue']?.content || '';
          previewHtml = generateVuePreview(code);
          break;
        }

        case 'python': {
          const code = project.files['main.py']?.content || '';
          previewHtml = generatePythonPreview(code);
          break;
        }

        default: {
          // 未対応のプリセットはコード表示
          const fileContents = Object.entries(project.files)
            .map(([name, file]) => `=== ${name} ===\n${file.content}`)
            .join('\n\n');
          previewHtml = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { 
      font-family: 'Fira Code', monospace; 
      background: #1e1e1e; 
      color: #d4d4d4; 
      padding: 1rem; 
    }
    pre { white-space: pre-wrap; }
  </style>
</head>
<body>
  <h3>📁 ${preset.label}</h3>
  <pre>${fileContents}</pre>
</body>
</html>`;
        }
      }

      iframe.srcdoc = previewHtml;
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'プレビュー生成エラー');
    }
  }, [subjectId, currentSectionId]);

  useEffect(() => {
    updatePreview();
  }, [updatePreview]);

  // ホットリロード: ローカルストレージの変更を監視
  // Python/TypeScriptは手動実行のためホットリロード無効
  useEffect(() => {
    if (!autoRefresh) return;

    const checkForChanges = () => {
      const project = getProject(subjectId, currentSectionId);
      if (!project) return;

      // Python/TypeScriptはホットリロード無効
      if (project.presetId === 'python' || project.presetId === 'typescript-basics') {
        return;
      }

      // ファイル内容のハッシュを作成
      const currentContent = Object.entries(project.files)
        .map(([name, file]) => `${name}:${file.content}`)
        .join('|');

      // 変更があればプレビュー更新
      if (currentContent !== lastContentRef.current) {
        lastContentRef.current = currentContent;
        
        // debounce
        if (refreshTimeoutRef.current) {
          clearTimeout(refreshTimeoutRef.current);
        }
        refreshTimeoutRef.current = setTimeout(() => {
          updatePreview();
        }, autoRefreshDelay);
      }
    };

    // 500msごとにチェック
    const intervalId = setInterval(checkForChanges, 500);

    return () => {
      clearInterval(intervalId);
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [subjectId, currentSectionId, autoRefresh, autoRefreshDelay, updatePreview]);

  return {
    iframeRef,
    error,
    presetId,
    updatePreview,
  };
};
