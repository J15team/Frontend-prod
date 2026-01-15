/**
 * useCodeStorage
 * コードの読み込み・保存・オートセーブを管理するカスタムフック
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { saveCode, getCode } from '@/utils/storage/codeStorage';

export type FileType = 'html' | 'css' | 'javascript';

export interface CodeState {
  html: string;
  css: string;
  javascript: string;
}

export const FILE_TYPES: FileType[] = ['html', 'css', 'javascript'];

const DEFAULT_CODE: CodeState = {
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

interface UseCodeStorageOptions {
  subjectId: number;
  sectionId: number;
  autoSaveDelay?: number;
}

interface UseCodeStorageReturn {
  codes: CodeState;
  updateCode: (fileType: FileType, value: string) => void;
  isLoading: boolean;
}

/**
 * コードの継承を考慮して読み込む
 */
const loadCodeWithInheritance = (
  subjectId: number,
  sectionId: number,
  fileIndex: number,
  fileType: FileType
): string => {
  // 現在のセクションから読み込み
  const currentSaved = getCode(subjectId, sectionId * 10 + fileIndex);
  if (currentSaved?.code) {
    return currentSaved.code;
  }

  // 前のセクションから継承を試みる
  for (let prevSection = sectionId - 1; prevSection >= 1; prevSection--) {
    const prevSaved = getCode(subjectId, prevSection * 10 + fileIndex);
    if (prevSaved?.code) {
      return prevSaved.code;
    }
  }

  // デフォルトコードを返す
  return DEFAULT_CODE[fileType];
};

export const useCodeStorage = ({
  subjectId,
  sectionId,
  autoSaveDelay = 500,
}: UseCodeStorageOptions): UseCodeStorageReturn => {
  const [codes, setCodes] = useState<CodeState>({
    html: '',
    css: '',
    javascript: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 初期読み込み
  useEffect(() => {
    setIsLoading(true);
    const newCodes: CodeState = { html: '', css: '', javascript: '' };

    FILE_TYPES.forEach((fileType, index) => {
      newCodes[fileType] = loadCodeWithInheritance(subjectId, sectionId, index, fileType);
    });

    setCodes(newCodes);
    setIsLoading(false);
  }, [subjectId, sectionId]);

  // コード更新（オートセーブ付き）
  const updateCode = useCallback(
    (fileType: FileType, value: string) => {
      setCodes(prev => ({ ...prev, [fileType]: value }));

      // 既存のタイマーをクリア
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // debounceで保存
      saveTimeoutRef.current = setTimeout(() => {
        const fileIndex = FILE_TYPES.indexOf(fileType);
        saveCode(subjectId, sectionId * 10 + fileIndex, value, fileType);
      }, autoSaveDelay);
    },
    [subjectId, sectionId, autoSaveDelay]
  );

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    codes,
    updateCode,
    isLoading,
  };
};