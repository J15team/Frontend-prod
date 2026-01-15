/**
 * Python Runtime (Pyodide)
 * ブラウザ内でPythonコードを実行
 */

export interface PythonExecutionResult {
  stdout: string[];
  stderr: string[];
  result: string | null;
  duration: number;
}

let pyodideInstance: any = null;
let isLoading = false;
let loadPromise: Promise<any> | null = null;

/**
 * Pyodideを初期化
 */
export const initializePyodide = async (): Promise<any> => {
  if (pyodideInstance) {
    return pyodideInstance;
  }

  if (loadPromise) {
    return loadPromise;
  }

  isLoading = true;

  loadPromise = new Promise(async (resolve, reject) => {
    try {
      // Pyodideをダイナミックにロード
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
      script.async = true;

      script.onload = async () => {
        try {
          // @ts-ignore - Pyodide is loaded globally
          pyodideInstance = await window.loadPyodide({
            indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/',
          });
          
          // stdout/stderrをキャプチャするための設定
          await pyodideInstance.runPythonAsync(`
import sys
from io import StringIO
          `);
          
          isLoading = false;
          resolve(pyodideInstance);
        } catch (error) {
          isLoading = false;
          reject(error);
        }
      };

      script.onerror = () => {
        isLoading = false;
        reject(new Error('Pyodideの読み込みに失敗しました'));
      };

      document.head.appendChild(script);
    } catch (error) {
      isLoading = false;
      reject(error);
    }
  });

  return loadPromise;
};

/**
 * Pythonコードを実行
 */
export const runPython = async (code: string): Promise<PythonExecutionResult> => {
  const startTime = performance.now();
  const stdout: string[] = [];
  const stderr: string[] = [];

  try {
    const pyodide = await initializePyodide();

    // stdoutとstderrをキャプチャ
    await pyodide.runPythonAsync(`
import sys
from io import StringIO

# 出力をキャプチャ
_stdout_capture = StringIO()
_stderr_capture = StringIO()
sys.stdout = _stdout_capture
sys.stderr = _stderr_capture
    `);

    // ユーザーコードを実行
    let result = null;
    try {
      result = await pyodide.runPythonAsync(code);
    } catch (error) {
      stderr.push(error instanceof Error ? error.message : String(error));
    }

    // キャプチャした出力を取得
    const capturedStdout = await pyodide.runPythonAsync(`
_stdout_capture.getvalue()
    `);
    const capturedStderr = await pyodide.runPythonAsync(`
_stderr_capture.getvalue()
    `);

    // stdoutをリセット
    await pyodide.runPythonAsync(`
sys.stdout = sys.__stdout__
sys.stderr = sys.__stderr__
    `);

    if (capturedStdout) {
      stdout.push(...capturedStdout.split('\n').filter((line: string) => line));
    }
    if (capturedStderr) {
      stderr.push(...capturedStderr.split('\n').filter((line: string) => line));
    }

    const duration = performance.now() - startTime;

    return {
      stdout,
      stderr,
      result: result !== undefined && result !== null ? String(result) : null,
      duration,
    };
  } catch (error) {
    const duration = performance.now() - startTime;
    return {
      stdout,
      stderr: [error instanceof Error ? error.message : String(error)],
      result: null,
      duration,
    };
  }
};

/**
 * Pyodideが読み込まれているかチェック
 */
export const isPyodideReady = (): boolean => {
  return pyodideInstance !== null;
};

/**
 * Pyodideが読み込み中かチェック
 */
export const isPyodideLoading = (): boolean => {
  return isLoading;
};

/**
 * Pythonコードをプレビュー用HTMLに変換
 */
export const generatePythonPreview = (code: string): string => {
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
    }
    .loading {
      color: #22c55e;
      animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    .output { white-space: pre-wrap; margin-top: 16px; }
    .stdout { color: #d4d4d4; }
    .stderr { color: #f44336; }
    .result { color: #a78bfa; margin-top: 8px; }
    pre {
      background: #2d2d2d;
      padding: 1rem;
      border-radius: 8px;
      overflow-x: auto;
    }
  </style>
  <script src="https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js"></script>
</head>
<body>
  <div id="status" class="loading">🐍 Pyodideを読み込み中...</div>
  <div id="output" class="output"></div>
  
  <script>
    const statusEl = document.getElementById('status');
    const outputEl = document.getElementById('output');
    
    const code = ${JSON.stringify(code)};
    
    async function main() {
      try {
        statusEl.textContent = '🐍 Pythonを初期化中...';
        const pyodide = await loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/'
        });
        
        statusEl.textContent = '▶️ 実行中...';
        
        // stdout/stderrをキャプチャ
        await pyodide.runPythonAsync(\`
import sys
from io import StringIO
_stdout = StringIO()
_stderr = StringIO()
sys.stdout = _stdout
sys.stderr = _stderr
        \`);
        
        let result;
        try {
          result = await pyodide.runPythonAsync(code);
        } catch(e) {
          const errLine = document.createElement('div');
          errLine.className = 'stderr';
          errLine.textContent = '❌ ' + e.message;
          outputEl.appendChild(errLine);
        }
        
        const stdout = await pyodide.runPythonAsync('_stdout.getvalue()');
        const stderr = await pyodide.runPythonAsync('_stderr.getvalue()');
        
        if (stdout) {
          stdout.split('\\n').filter(l => l).forEach(line => {
            const div = document.createElement('div');
            div.className = 'stdout';
            div.textContent = '> ' + line;
            outputEl.appendChild(div);
          });
        }
        
        if (stderr) {
          stderr.split('\\n').filter(l => l).forEach(line => {
            const div = document.createElement('div');
            div.className = 'stderr';
            div.textContent = '⚠️ ' + line;
            outputEl.appendChild(div);
          });
        }
        
        if (result !== undefined && result !== null) {
          const div = document.createElement('div');
          div.className = 'result';
          div.textContent = '← ' + String(result);
          outputEl.appendChild(div);
        }
        
        statusEl.textContent = '✅ 実行完了';
        statusEl.className = '';
      } catch(e) {
        statusEl.textContent = '❌ エラー: ' + e.message;
        statusEl.className = 'stderr';
      }
    }
    
    main();
  </script>
</body>
</html>`;
};
