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
 * 題材の最終コードを取得（エクスポート用）
 * 各ファイルタイプ（HTML/CSS/JS）ごとに、最後に編集されたセクションのコードを取得
 */
export const getSubjectFinalCode = (
  subjectId: number
): { html: string; css: string; js: string } | null => {
  const data = getAllCodeData();
  const subjectData = data[subjectId];
  
  if (!subjectData) return null;

  // 各ファイルタイプごとに最新のコードを探す
  // sectionId * 10 + 0 = HTML, + 1 = CSS, + 2 = JS
  let latestHtml = { sectionId: 0, code: '' };
  let latestCss = { sectionId: 0, code: '' };
  let latestJs = { sectionId: 0, code: '' };

  Object.keys(subjectData).forEach(key => {
    const id = parseInt(key);
    const sectionId = Math.floor(id / 10);
    const fileType = id % 10;
    const code = subjectData[id]?.code || '';

    if (!code) return;

    if (fileType === 0 && sectionId >= latestHtml.sectionId) {
      latestHtml = { sectionId, code };
    } else if (fileType === 1 && sectionId >= latestCss.sectionId) {
      latestCss = { sectionId, code };
    } else if (fileType === 2 && sectionId >= latestJs.sectionId) {
      latestJs = { sectionId, code };
    }
  });

  const html = latestHtml.code;
  const css = latestCss.code;
  const js = latestJs.code;

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
