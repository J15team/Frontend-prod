/**
 * Framework Preview Runtime
 * React/Vue のブラウザ内プレビュー生成
 * 安定版 - エラーハンドリング強化
 */

/**
 * Reactコードをプレビュー用HTMLに変換
 * Babel Standalone を使用してJSXを変換
 */
export const generateReactPreview = (code: string, css: string = ''): string => {
  // TypeScript型注釈を除去
  const cleanedCode = stripTypeAnnotations(code);
  // 特殊文字をエスケープ
  const escapedCode = cleanedCode.replace(/`/g, '\\`').replace(/\$/g, '\\$');

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
      padding: 0; 
      background: #1a1a2e;
    }
    #loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      color: #61dafb;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #333;
      border-top-color: #61dafb;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    #error {
      padding: 1rem;
      color: #f44336;
      background: #1e1e1e;
      font-family: monospace;
      white-space: pre-wrap;
    }
    ${css}
  </style>
</head>
<body>
  <div id="loading">
    <div class="spinner"></div>
    <p>読み込み中...</p>
  </div>
  <div id="root"></div>
  <div id="error"></div>
  
  <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone@7/babel.min.js"></script>
  
  <script>
    document.getElementById('loading').style.display = 'none';
    
    try {
      // Babelでトランスパイル
      const code = \`
        const { useState, useEffect, useRef, useMemo, useCallback, createContext, useContext } = React;
        
        ${escapedCode}
        
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(React.createElement(App));
      \`;
      
      const transformed = Babel.transform(code, {
        presets: ['react'],
        filename: 'app.jsx'
      }).code;
      
      // 実行
      eval(transformed);
    } catch(e) {
      document.getElementById('error').textContent = '❌ エラー: ' + e.message;
      console.error(e);
    }
  </script>
</body>
</html>`;
};

/**
 * VueコードをSFC形式からプレビュー用HTMLに変換
 */
export const generateVuePreview = (sfcCode: string): string => {
  const { template, script, style } = parseVueSfc(sfcCode);
  const variables = extractReturnVariables(script);
  
  // テンプレートをエスケープ
  const escapedTemplate = template.replace(/`/g, '\\`').replace(/\\/g, '\\\\');

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
  <style>
    * { box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0; 
      padding: 0;
      background: #1a1a2e;
    }
    #error {
      padding: 1rem;
      color: #f44336;
      background: #1e1e1e;
      font-family: monospace;
    }
    ${style}
  </style>
</head>
<body>
  <div id="app"></div>
  <div id="error"></div>
  <script>
    try {
      const { createApp, ref, reactive, computed, watch, onMounted, onUnmounted } = Vue;
      
      const App = {
        template: \`${escapedTemplate}\`,
        setup() {
          ${script}
          return { ${variables} };
        }
      };
      
      createApp(App).mount('#app');
    } catch(e) {
      document.getElementById('error').textContent = '❌ エラー: ' + e.message;
      console.error(e);
    }
  </script>
</body>
</html>`;
};

/**
 * TypeScriptコードをプレビュー用HTMLに変換
 */
export const generateTypeScriptPreview = (code: string): string => {
  const jsCode = stripTypeAnnotations(code);

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; }
    body { font-family: 'Fira Code', Monaco, monospace; margin: 0; padding: 16px; background: #1e1e1e; color: #d4d4d4; }
    .output { white-space: pre-wrap; }
    .log { color: #d4d4d4; padding: 4px 0; }
    .error { color: #f44336; padding: 4px 0; }
    .warn { color: #ff9800; padding: 4px 0; }
  </style>
</head>
<body>
  <div id="output" class="output"></div>
  <script>
    const outputEl = document.getElementById('output');
    const originalConsole = { log: console.log, error: console.error, warn: console.warn };
    
    const addOutput = (type, ...args) => {
      const line = document.createElement('div');
      line.className = type;
      line.textContent = '> ' + args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ');
      outputEl.appendChild(line);
    };
    
    console.log = (...args) => { originalConsole.log(...args); addOutput('log', ...args); };
    console.error = (...args) => { originalConsole.error(...args); addOutput('error', ...args); };
    console.warn = (...args) => { originalConsole.warn(...args); addOutput('warn', ...args); };
    
    try {
      ${jsCode}
    } catch(e) {
      addOutput('error', '❌ ' + e.message);
    }
  </script>
</body>
</html>`;
};

// ===== ヘルパー関数 =====

const parseVueSfc = (code: string): { template: string; script: string; style: string } => {
  const templateMatch = code.match(/<template>([\s\S]*?)<\/template>/);
  const scriptMatch = code.match(/<script[^>]*>([\s\S]*?)<\/script>/);
  const styleMatch = code.match(/<style[^>]*>([\s\S]*?)<\/style>/);

  let script = scriptMatch ? scriptMatch[1].trim() : '';
  script = script.replace(/^import.*$/gm, '');

  return {
    template: templateMatch ? templateMatch[1].trim() : '<div>No template</div>',
    script,
    style: styleMatch ? styleMatch[1].trim() : '',
  };
};

const extractReturnVariables = (script: string): string => {
  const variables: string[] = [];
  
  // const xxx = ref/reactive パターン
  const varMatches = script.matchAll(/const\s+(\w+)\s*=/g);
  for (const match of varMatches) {
    variables.push(match[1]);
  }
  
  // function xxx パターン
  const funcMatches = script.matchAll(/function\s+(\w+)\s*\(/g);
  for (const match of funcMatches) {
    variables.push(match[1]);
  }
  
  return variables.join(', ');
};

const stripTypeAnnotations = (code: string): string => {
  return code
    // interface/type 定義を除去
    .replace(/^(interface|type)\s+\w+[^{]*\{[^}]*\}/gm, '')
    // 関数パラメータの型 (param: Type) -> (param) - JSXタグを避ける
    .replace(/(\w+)\s*:\s*(?!.*[<>].*>)[\w\[\]|&\s]+(?=[,)])/g, '$1')
    // 戻り値の型 ): Type => -> ) =>
    .replace(/\)\s*:\s*[\w\[\]|&\s]+\s*=>/g, ') =>')
    // 変数の型 const x: Type = -> const x =
    .replace(/(const|let|var)\s+(\w+)\s*:\s*[\w\[\]|&\s]+\s*=/g, '$1 $2 =')
    // React.FC<...> を除去
    .replace(/:\s*React\.FC(<[^>]*>)?/g, '')
    // as Type を除去
    .replace(/\s+as\s+\w+/g, '');
  // 注: ジェネリクス <T> はReactで使用するため除去しない
};
