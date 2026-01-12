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
 * 題材の最終セクションのコードを取得（エクスポート用）
 * 一番最後のセクションのHTML/CSS/JSのみ取得
 */
export const getSubjectFinalCode = (
  subjectId: number
): { html: string; css: string; js: string } | null => {
  const data = getAllCodeData();
  const subjectData = data[subjectId];
  
  if (!subjectData) return null;

  // セクションIDを抽出して最大値を取得
  let maxSectionId = 0;
  Object.keys(subjectData).forEach(key => {
    const id = parseInt(key);
    const sectionId = Math.floor(id / 10);
    if (sectionId > maxSectionId) {
      maxSectionId = sectionId;
    }
  });

  if (maxSectionId === 0) return null;

  const html = subjectData[maxSectionId * 10 + 0]?.code || '';
  const css = subjectData[maxSectionId * 10 + 1]?.code || '';
  const js = subjectData[maxSectionId * 10 + 2]?.code || '';

  // コードがない場合はnull
  if (!html && !css && !js) return null;

  return { html, css, js };
};

/**
 * 題材のコードを削除
 */
export const clearSubjectCode = (subjectId: number): void => {
  const data = getAllCodeData();
  delete data[subjectId];
  saveAllCodeData(data);
};
