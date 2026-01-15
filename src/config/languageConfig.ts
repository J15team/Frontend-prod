/**
 * Language & Preset Configuration
 * 言語とプリセットの設定を一元管理
 */

// ランタイムタイプ
export type RuntimeType = 'browser-native' | 'wasm' | 'iframe' | 'transpile';

// ファイルタイプ（後方互換性のため）
export type FileType = 'html' | 'css' | 'javascript' | 'typescript' | 'typescriptreact' | 'vue' | 'python';

/**
 * 言語定義
 */
export interface LanguageDefinition {
  id: string;
  label: string;
  monacoLanguage: string;
  fileExtension: string;
  runtime: RuntimeType;
  icon: string;
}

/**
 * ファイルテンプレート
 */
export interface FileTemplate {
  name: string;
  languageId: string;
  defaultContent: string;
}

/**
 * プリセット定義
 */
export interface PresetDefinition {
  id: string;
  label: string;
  icon: string;
  category: 'basics' | 'framework' | 'other';
  description: string;
  languages: string[];
  files: FileTemplate[];
}

// ===== 言語定義 =====
export const LANGUAGES: Record<string, LanguageDefinition> = {
  html: {
    id: 'html',
    label: 'HTML',
    monacoLanguage: 'html',
    fileExtension: '.html',
    runtime: 'iframe',
    icon: '🌐',
  },
  css: {
    id: 'css',
    label: 'CSS',
    monacoLanguage: 'css',
    fileExtension: '.css',
    runtime: 'iframe',
    icon: '🎨',
  },
  javascript: {
    id: 'javascript',
    label: 'JavaScript',
    monacoLanguage: 'javascript',
    fileExtension: '.js',
    runtime: 'browser-native',
    icon: '⚡',
  },
  typescript: {
    id: 'typescript',
    label: 'TypeScript',
    monacoLanguage: 'typescript',
    fileExtension: '.ts',
    runtime: 'transpile',
    icon: '📘',
  },
  typescriptreact: {
    id: 'typescriptreact',
    label: 'TypeScript React',
    monacoLanguage: 'typescript',
    fileExtension: '.tsx',
    runtime: 'transpile',
    icon: '⚛️',
  },
  vue: {
    id: 'vue',
    label: 'Vue',
    monacoLanguage: 'html', // SFC uses HTML-like syntax
    fileExtension: '.vue',
    runtime: 'transpile',
    icon: '💚',
  },
  python: {
    id: 'python',
    label: 'Python',
    monacoLanguage: 'python',
    fileExtension: '.py',
    runtime: 'wasm',
    icon: '🐍',
  },
};

// ===== デフォルトコンテンツ =====
const DEFAULT_CONTENTS = {
  html: `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hello World</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Hello, World!</h1>
  <script src="script.js"></script>
</body>
</html>`,

  css: `body {
  font-family: sans-serif;
  text-align: center;
  padding: 2rem;
}

h1 {
  color: #333;
}`,

  javascript: `console.log('Hello, World!');`,

  typescript: `const message = 'Hello, World!';
console.log(message);`,

  react: `const App = () => {
  return (
    <div>
      <h1>Hello, World!</h1>
    </div>
  );
};`,

  reactCss: `h1 {
  color: #61dafb;
  text-align: center;
  padding: 2rem;
}`,

  vue: `<template>
  <div>
    <h1>Hello, World!</h1>
  </div>
</template>

<script setup>
</script>

<style scoped>
h1 {
  color: #42b883;
  text-align: center;
  padding: 2rem;
}
</style>`,

  python: `print('Hello, World!')`,
};

// ===== プリセット定義 =====
export const PRESETS: PresetDefinition[] = [
  // 基礎
  {
    id: 'web-basics',
    label: 'Web基礎',
    icon: '🌐',
    category: 'basics',
    description: 'HTML, CSS, JavaScriptの基本',
    languages: ['html', 'css', 'javascript'],
    files: [
      { name: 'index.html', languageId: 'html', defaultContent: DEFAULT_CONTENTS.html },
      { name: 'style.css', languageId: 'css', defaultContent: DEFAULT_CONTENTS.css },
      { name: 'script.js', languageId: 'javascript', defaultContent: DEFAULT_CONTENTS.javascript },
    ],
  },
  {
    id: 'typescript-basics',
    label: 'TypeScript基礎',
    icon: '📘',
    category: 'basics',
    description: 'TypeScriptの基本構文と型',
    languages: ['typescript'],
    files: [
      { name: 'main.ts', languageId: 'typescript', defaultContent: DEFAULT_CONTENTS.typescript },
    ],
  },

  // フレームワーク
  {
    id: 'react',
    label: 'React',
    icon: '⚛️',
    category: 'framework',
    description: 'React + TypeScript',
    languages: ['typescriptreact', 'css'],
    files: [
      { name: 'App.tsx', languageId: 'typescriptreact', defaultContent: DEFAULT_CONTENTS.react },
      { name: 'styles.css', languageId: 'css', defaultContent: DEFAULT_CONTENTS.reactCss },
    ],
  },
  {
    id: 'vue',
    label: 'Vue.js',
    icon: '💚',
    category: 'framework',
    description: 'Vue 3 + TypeScript (Composition API)',
    languages: ['vue'],
    files: [
      { name: 'App.vue', languageId: 'vue', defaultContent: DEFAULT_CONTENTS.vue },
    ],
  },

  // その他
  {
    id: 'python',
    label: 'Python',
    icon: '🐍',
    category: 'other',
    description: 'Pythonの基本',
    languages: ['python'],
    files: [
      { name: 'main.py', languageId: 'python', defaultContent: DEFAULT_CONTENTS.python },
    ],
  },
];

/**
 * プリセットIDからプリセットを取得
 */
export const getPresetById = (id: string): PresetDefinition | undefined => {
  return PRESETS.find(p => p.id === id);
};

/**
 * カテゴリ別にプリセットを取得
 */
export const getPresetsByCategory = (category: PresetDefinition['category']): PresetDefinition[] => {
  return PRESETS.filter(p => p.category === category);
};

/**
 * デフォルトプリセット
 */
export const DEFAULT_PRESET = PRESETS[0];
