/**
 * C Runtime
 * ブラウザ上でC言語を実行するランタイム
 * picoc-js (PicoC compiled to WASM) を使用
 */

const PICOC_CDN = 'https://unpkg.com/picoc-js@1.0.12/dist/bundle.umd.js';

let picocLoaded = false;

/**
 * picoc-jsを読み込む
 */
export const loadPicoC = async (): Promise<void> => {
  if (picocLoaded && (window as any).picocjs) return;

  return new Promise((resolve, reject) => {
    if ((window as any).picocjs) {
      picocLoaded = true;
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = PICOC_CDN;
    script.onload = () => {
      picocLoaded = true;
      resolve();
    };
    script.onerror = () => reject(new Error('PicoCの読み込みに失敗しました'));
    document.head.appendChild(script);
  });
};

/**
 * C言語コードを実行
 * @param code - 実行するCコード
 * @param stdinInput - 標準入力（改行区切りで複数入力可能）
 */
export const runCCode = async (
  code: string,
  stdinInput?: string
): Promise<{ output: string; error: string | null; exitCode: number }> => {
  // iframe内で実行するため、ここでは何もしない
  // 実際の実行はgenerateCExecutionHtmlで行う
  return { output: '', error: null, exitCode: 0 };
};

/**
 * C言語実行用のHTMLを生成（iframe内で実行）
 */
export const generateCExecutionHtml = (code: string, stdinInput: string): string => {
  const escapedCode = JSON.stringify(code);
  const inputLines = JSON.stringify(stdinInput.split('\n').filter(line => line.trim() !== ''));
  
  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: 'Fira Code', Monaco, monospace;
      margin: 0;
      padding: 16px;
      background: #1e1e1e;
      color: #d4d4d4;
      min-height: 100vh;
    }
    .loading { color: #ffd700; }
    .success { color: #4ec9b0; }
    .error { color: #f44336; }
    .output {
      background: #252526;
      border: 1px solid #333;
      border-radius: 6px;
      padding: 12px;
      white-space: pre-wrap;
      margin-top: 16px;
      min-height: 60px;
    }
  </style>
  <script src="https://unpkg.com/picoc-js@1.0.12/dist/bundle.umd.js"><\/script>
</head>
<body>
  <div id="status" class="loading">⏳ 実行中...</div>
  <pre id="output" class="output"></pre>

  <script>
    (function() {
      var code = ${escapedCode};
      var inputLines = ${inputLines};
      var inputIndex = 0;
      var outputText = '';

      // promptをオーバーライド（scanf用）
      window.prompt = function(msg) {
        if (inputIndex < inputLines.length) {
          return inputLines[inputIndex++];
        }
        return null;
      };

      var statusEl = document.getElementById('status');
      var outputEl = document.getElementById('output');

      function run() {
        try {
          if (!window.picocjs || !window.picocjs.runC) {
            throw new Error('PicoCが読み込めませんでした');
          }

          window.picocjs.runC(code, function(text) {
            outputText += text;
          });

          setTimeout(function() {
            statusEl.className = 'success';
            statusEl.textContent = '✅ 完了';
            outputEl.textContent = outputText || '(出力なし)';
          }, 100);

        } catch (e) {
          statusEl.className = 'error';
          statusEl.textContent = '❌ エラー';
          outputEl.textContent = e.message || String(e);
        }
      }

      setTimeout(run, 300);
    })();
  <\/script>
</body>
</html>`;
};


/**
 * Cコードプレビュー用HTMLを生成（結果表示用）
 */
export const generateCResultHtml = (
  output: string,
  error: string | null,
  exitCode: number
): string => {
  const isError = error !== null || exitCode !== 0;
  const displayOutput = error ? `${output}\n❌ ${error}` : output || '(出力なし)';

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: 'Fira Code', Monaco, monospace;
      margin: 0;
      padding: 16px;
      background: #1e1e1e;
      color: #d4d4d4;
      min-height: 100vh;
    }
    .header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid #333;
    }
    .header-icon { font-size: 1.5rem; }
    .header-title {
      font-size: 1rem;
      color: #569cd6;
      font-weight: 600;
    }
    .status {
      margin-left: auto;
      font-size: 0.85rem;
      padding: 4px 12px;
      border-radius: 4px;
    }
    .status.success { background: #1e3a1e; color: #4ec9b0; }
    .status.error { background: #3a1e1e; color: #f44336; }
    .output-section { margin-bottom: 16px; }
    .output-label {
      font-size: 0.8rem;
      color: #888;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .output {
      background: #252526;
      border: 1px solid #333;
      border-radius: 6px;
      padding: 12px;
      white-space: pre-wrap;
      font-size: 0.9rem;
      min-height: 60px;
      max-height: 300px;
      overflow-y: auto;
    }
    .output.error { border-color: #f44336; color: #f44336; }
    .exit-code {
      font-size: 0.85rem;
      color: #888;
      margin-top: 12px;
    }
    .exit-code.success { color: #4ec9b0; }
    .exit-code.error { color: #f44336; }
  </style>
</head>
<body>
  <div class="header">
    <span class="header-icon">⚙️</span>
    <span class="header-title">C言語 実行結果</span>
    <span class="status ${isError ? 'error' : 'success'}">${isError ? '❌ エラー' : '✅ 完了'}</span>
  </div>
  <div class="output-section">
    <div class="output-label">出力</div>
    <pre class="output ${isError ? 'error' : ''}">${displayOutput}</pre>
  </div>
  <div class="exit-code ${exitCode === 0 ? 'success' : 'error'}">Exit Code: ${exitCode}</div>
</body>
</html>`;
};

/**
 * 読み込み中のHTMLを生成
 */
export const generateCLoadingHtml = (): string => {
  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Fira Code', Monaco, monospace;
      margin: 0;
      padding: 16px;
      background: #1e1e1e;
      color: #ffd700;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
  </style>
</head>
<body>
  ⏳ 実行中...
</body>
</html>`;
};
