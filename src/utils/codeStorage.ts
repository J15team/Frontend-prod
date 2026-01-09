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
 * 題材の全セクションのコードを取得
 */
export const getSubjectCodes = (
  subjectId: number
): { sectionId: number; code: string; language: string }[] => {
  const data = getAllCodeData();
  const subjectData = data[subjectId];
  if (!subjectData) return [];

  return Object.entries(subjectData).map(([sectionId, codeData]) => ({
    sectionId: parseInt(sectionId),
    code: codeData.code,
    language: codeData.language,
  }));
};

/**
 * 題材のコードを削除
 */
export const clearSubjectCode = (subjectId: number): void => {
  const data = getAllCodeData();
  delete data[subjectId];
  saveAllCodeData(data);
};
