/**
 * useMemoStorage
 * メモ帳のlocalStorage操作を管理するカスタムフック
 */
import { useState, useEffect, useCallback } from 'react';

interface UseMemoStorageReturn {
  content: string;
  setContent: (value: string) => void;
  saved: boolean;
  save: () => void;
  clear: () => void;
}

export const useMemoStorage = (storageKey: string): UseMemoStorageReturn => {
  const [content, setContent] = useState<string>('');
  const [saved, setSaved] = useState<boolean>(false);

  // 初期読み込み
  useEffect(() => {
    const savedMemo = localStorage.getItem(storageKey);
    if (savedMemo) {
      setContent(savedMemo);
    }
  }, [storageKey]);

  // 保存処理
  const save = useCallback(() => {
    localStorage.setItem(storageKey, content);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [storageKey, content]);

  // クリア処理
  const clear = useCallback(() => {
    if (confirm('メモを削除しますか？')) {
      setContent('');
      localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  return {
    content,
    setContent,
    saved,
    save,
    clear,
  };
};
