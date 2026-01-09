/**
 * Code Storage
 * ユーザーが書いたコードをlocalStorageに保存
 */

const CODE_STORAGE_KEY = 'pathly_user_code';

interface CodeData {
  [subjectId: number]: {
    [sectionId: number]: {
      code: string;
      language: string;
      updatedAt: string;
    };
  };
}

/**
 * 全コードデータを取得
 */
const getAllCodeData = (): CodeData => {
  const data = localStorage.getItem(CODE_STORAGE_KEY);
  if (!data) return {};
  try {
    return JSON.parse(data);
  } catch {
    return {};
  }
};

/**
 * 全コードデータを保存
 */
const saveAllCodeData = (data: CodeData): void => {
  localStorage.setItem(CODE_STORAGE_KEY, JSON.stringify(data));
};

/**
 * セクションのコードを保存
 */
export const saveCode = (
  subjectId: number,
  sectionId: number,
  code: string,
  language: string = 'javascript'
): void => {
  const data = getAllCodeData();
  if (!data[subjectId]) {
    data[subjectId] = {};
  }
  data[subjectId][sectionId] = {
    code,
    language,
    updatedAt: new Date().toISOString(),
  };
  saveAllCodeData(data);
};

/**
 * セクションのコードを取得
 */
export const getCode = (
  subjectId: number,
  sectionId: number
): { code: string; language: string } | null => {
  const data = getAllCodeData();
  return data[subjectId]?.[sectionId] || null;
};

/**
 * 題材の全セクションのコードを取得（エクスポート用）
 * HTML/CSS/JSをまとめて取得
 * 
 * コードエディタの保存形式: sectionId * 10 + fileIndex
 * - HTML: sectionId * 10 + 0
 * - CSS:  sectionId * 10 + 1
 * - JS:   sectionId * 10 + 2
 */
export const getSubjectCodes = (
  subjectId: number
): { sectionId: number; html: string; css: string; js: string }[] => {
  const data = getAllCodeData();
  const subjectData = data[subjectId];
  if (!subjectData) return [];

  // セクションIDを抽出（10で割って元のセクションIDを取得）
  const sectionIds = new Set<number>();
  Object.keys(subjectData).forEach(key => {
    const id = parseInt(key);
    const sectionId = Math.floor(id / 10);
    if (sectionId > 0) {
      sectionIds.add(sectionId);
    }
  });

  // コードがあるセクションのみ返す
  const results: { sectionId: number; html: string; css: string; js: string }[] = [];
  
  Array.from(sectionIds).sort((a, b) => a - b).forEach(sectionId => {
    const html = subjectData[sectionId * 10 + 0]?.code || '';
    const css = subjectData[sectionId * 10 + 1]?.code || '';
    const js = subjectData[sectionId * 10 + 2]?.code || '';
    
    // 少なくとも1つのファイルにコードがある場合のみ追加
    if (html || css || js) {
      results.push({ sectionId, html, css, js });
    }
  });

  return results;
};

/**
 * 題材のコードを削除
 */
export const clearSubjectCode = (subjectId: number): void => {
  const data = getAllCodeData();
  delete data[subjectId];
  saveAllCodeData(data);
};
