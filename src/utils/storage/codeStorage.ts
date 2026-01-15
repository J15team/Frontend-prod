/**
 * Code Storage (V2)
 * 新しいプロジェクトベースのコード保存システム
 * 旧データからの自動マイグレーション機能付き
 */

import { DEFAULT_PRESET, getPresetById } from '@/config/languageConfig';

const CODE_STORAGE_KEY = 'pathly_user_code';
const CODE_STORAGE_V2_KEY = 'pathly_projects_v2';
const MIGRATION_DONE_KEY = 'pathly_migration_v2_done';

// ===== 新しいデータ構造 =====

export interface ProjectFile {
  content: string;
  languageId: string;
  updatedAt: string;
}

export interface ProjectData {
  presetId: string;
  files: Record<string, ProjectFile>;
  createdAt: string;
  updatedAt: string;
}

interface AllProjects {
  [subjectId: number]: {
    [sectionId: number]: ProjectData;
  };
}

// ===== 旧データ構造（マイグレーション用） =====

interface OldCodeData {
  [subjectId: number]: {
    [sectionId: number]: {
      code: string;
      language: string;
      updatedAt: string;
    };
  };
}

// ===== データアクセス =====

/**
 * 全プロジェクトデータを取得
 */
const getAllProjects = (): AllProjects => {
  const data = localStorage.getItem(CODE_STORAGE_V2_KEY);
  if (!data) return {};
  try {
    return JSON.parse(data);
  } catch {
    return {};
  }
};

/**
 * 全プロジェクトデータを保存
 */
const saveAllProjects = (data: AllProjects): void => {
  localStorage.setItem(CODE_STORAGE_V2_KEY, JSON.stringify(data));
};

// ===== マイグレーション =====

/**
 * 旧データからの自動マイグレーション
 */
export const migrateFromV1 = (): void => {
  // 既にマイグレーション済みの場合はスキップ
  if (localStorage.getItem(MIGRATION_DONE_KEY)) {
    return;
  }

  const oldData = localStorage.getItem(CODE_STORAGE_KEY);
  if (!oldData) {
    localStorage.setItem(MIGRATION_DONE_KEY, 'true');
    return;
  }

  try {
    const parsed: OldCodeData = JSON.parse(oldData);
    const newProjects: AllProjects = {};

    // 旧データを新形式に変換
    // 旧形式: subjectId -> sectionId*10+fileIndex (0=html, 1=css, 2=js) -> {code, language}
    Object.entries(parsed).forEach(([subjectIdStr, sections]) => {
      const subjectId = parseInt(subjectIdStr);
      if (!newProjects[subjectId]) {
        newProjects[subjectId] = {};
      }

      // sectionIdを特定するためにファイルをグループ化
      const sectionGroups: Record<number, { html?: string; css?: string; js?: string; updatedAt?: string }> = {};

      Object.entries(sections as Record<string, { code: string; language: string; updatedAt?: string }>).forEach(([keyStr, fileData]) => {
        const key = parseInt(keyStr);
        const sectionId = Math.floor(key / 10);
        const fileType = key % 10;

        if (!sectionGroups[sectionId]) {
          sectionGroups[sectionId] = {};
        }

        if (fileType === 0) sectionGroups[sectionId].html = fileData.code;
        else if (fileType === 1) sectionGroups[sectionId].css = fileData.code;
        else if (fileType === 2) sectionGroups[sectionId].js = fileData.code;

        if (fileData.updatedAt) {
          sectionGroups[sectionId].updatedAt = fileData.updatedAt;
        }
      });

      // 新形式に変換
      Object.entries(sectionGroups).forEach(([sectionIdStr, files]) => {
        const sectionId = parseInt(sectionIdStr);
        const now = files.updatedAt || new Date().toISOString();

        const projectData: ProjectData = {
          presetId: 'web-basics',
          files: {},
          createdAt: now,
          updatedAt: now,
        };

        if (files.html) {
          projectData.files['index.html'] = {
            content: files.html,
            languageId: 'html',
            updatedAt: now,
          };
        }
        if (files.css) {
          projectData.files['style.css'] = {
            content: files.css,
            languageId: 'css',
            updatedAt: now,
          };
        }
        if (files.js) {
          projectData.files['script.js'] = {
            content: files.js,
            languageId: 'javascript',
            updatedAt: now,
          };
        }

        // ファイルが1つ以上ある場合のみ保存
        if (Object.keys(projectData.files).length > 0) {
          newProjects[subjectId][sectionId] = projectData;
        }
      });
    });

    // 新形式で保存
    saveAllProjects(newProjects);
    localStorage.setItem(MIGRATION_DONE_KEY, 'true');
    console.log('[CodeStorage] Migration from V1 completed');
  } catch (error) {
    console.error('[CodeStorage] Migration failed:', error);
  }
};

// ===== 公開API =====

/**
 * プロジェクトを取得
 */
export const getProject = (
  subjectId: number,
  sectionId: number
): ProjectData | null => {
  migrateFromV1();
  const data = getAllProjects();
  return data[subjectId]?.[sectionId] || null;
};

/**
 * プロジェクトを保存（全体）
 */
export const saveProject = (
  subjectId: number,
  sectionId: number,
  project: ProjectData
): void => {
  const data = getAllProjects();
  if (!data[subjectId]) {
    data[subjectId] = {};
  }
  data[subjectId][sectionId] = {
    ...project,
    updatedAt: new Date().toISOString(),
  };
  saveAllProjects(data);
};

/**
 * ファイルを保存（単一ファイル）
 */
export const saveProjectFile = (
  subjectId: number,
  sectionId: number,
  filename: string,
  content: string,
  languageId: string
): void => {
  const data = getAllProjects();
  const now = new Date().toISOString();

  if (!data[subjectId]) {
    data[subjectId] = {};
  }

  if (!data[subjectId][sectionId]) {
    data[subjectId][sectionId] = {
      presetId: DEFAULT_PRESET.id,
      files: {},
      createdAt: now,
      updatedAt: now,
    };
  }

  data[subjectId][sectionId].files[filename] = {
    content,
    languageId,
    updatedAt: now,
  };
  data[subjectId][sectionId].updatedAt = now;

  saveAllProjects(data);
};

/**
 * プロジェクトのプリセットを変更
 */
export const changeProjectPreset = (
  subjectId: number,
  sectionId: number,
  presetId: string
): void => {
  const preset = getPresetById(presetId);
  if (!preset) return;

  const data = getAllProjects();
  const now = new Date().toISOString();

  if (!data[subjectId]) {
    data[subjectId] = {};
  }

  // 新しいプリセットのデフォルトファイルで初期化
  const files: Record<string, ProjectFile> = {};
  preset.files.forEach(file => {
    files[file.name] = {
      content: file.defaultContent,
      languageId: file.languageId,
      updatedAt: now,
    };
  });

  data[subjectId][sectionId] = {
    presetId,
    files,
    createdAt: data[subjectId][sectionId]?.createdAt || now,
    updatedAt: now,
  };

  saveAllProjects(data);
};

/**
 * プロジェクトをプリセットからの継承またはデフォルトで初期化
 */
export const initializeProject = (
  subjectId: number,
  sectionId: number,
  presetId?: string
): ProjectData => {
  migrateFromV1();
  
  const data = getAllProjects();
  const existing = data[subjectId]?.[sectionId];
  
  // 前のセクションを探す
  let prevProject: ProjectData | null = null;
  for (let prevSection = sectionId - 1; prevSection >= 1; prevSection--) {
    if (data[subjectId]?.[prevSection]) {
      prevProject = data[subjectId][prevSection];
      break;
    }
  }

  // 既存のプロジェクトがある場合
  if (existing) {
    // 未編集（createdAt === updatedAt）かつ前のセクションがある場合は同期
    if (prevProject && existing.createdAt === existing.updatedAt) {
      const now = new Date().toISOString();
      const copiedFiles: Record<string, ProjectFile> = {};
      Object.entries(prevProject.files).forEach(([filename, file]) => {
        copiedFiles[filename] = {
          content: file.content,
          languageId: file.languageId,
          updatedAt: now,
        };
      });
      const syncedProject: ProjectData = {
        presetId: prevProject.presetId,
        files: copiedFiles,
        createdAt: now,
        updatedAt: now,
      };
      saveProject(subjectId, sectionId, syncedProject);
      return syncedProject;
    }
    return existing;
  }

  // 前のセクションからの継承
  if (prevProject) {
    const now = new Date().toISOString();
    const copiedFiles: Record<string, ProjectFile> = {};
    Object.entries(prevProject.files).forEach(([filename, file]) => {
      copiedFiles[filename] = {
        content: file.content,
        languageId: file.languageId,
        updatedAt: now,
      };
    });
    const newProject: ProjectData = {
      presetId: prevProject.presetId,
      files: copiedFiles,
      createdAt: now,
      updatedAt: now,
    };
    saveProject(subjectId, sectionId, newProject);
    return newProject;
  }

  const targetPresetId = presetId || DEFAULT_PRESET.id;
  const preset = getPresetById(targetPresetId) || DEFAULT_PRESET;
  const now = new Date().toISOString();
  const files: Record<string, ProjectFile> = {};
  
  preset.files.forEach(file => {
    files[file.name] = {
      content: file.defaultContent,
      languageId: file.languageId,
      updatedAt: now,
    };
  });

  const newProject: ProjectData = {
    presetId: targetPresetId,
    files,
    createdAt: now,
    updatedAt: now,
  };

  saveProject(subjectId, sectionId, newProject);
  return newProject;
};

/**
 * 題材のプロジェクトを削除
 */
export const clearSubjectProjects = (subjectId: number): void => {
  const data = getAllProjects();
  delete data[subjectId];
  saveAllProjects(data);
};

/**
 * 題材の最終プロジェクトを取得（GitHubエクスポート用）
 */
export const getSubjectFinalProject = (
  subjectId: number
): { presetId: string; files: Record<string, { content: string; languageId: string }> } | null => {
  migrateFromV1();
  const data = getAllProjects();
  const subjectData = data[subjectId];

  if (!subjectData) return null;

  // 最も大きいsectionIdのプロジェクトを取得
  const sectionIds = Object.keys(subjectData).map(Number).sort((a, b) => b - a);
  if (sectionIds.length === 0) return null;

  const latestProject = subjectData[sectionIds[0]];
  if (!latestProject || Object.keys(latestProject.files).length === 0) return null;

  return {
    presetId: latestProject.presetId,
    files: Object.fromEntries(
      Object.entries(latestProject.files).map(([name, file]) => [
        name,
        { content: file.content, languageId: file.languageId },
      ])
    ),
  };
};

/**
 * 題材内で使用されているプリセット一覧を取得
 */
export const getSubjectPresets = (
  subjectId: number
): { presetId: string; sectionId: number; updatedAt: string }[] => {
  migrateFromV1();
  const data = getAllProjects();
  const subjectData = data[subjectId];

  if (!subjectData) return [];

  // プリセットごとに最新のセクションを取得
  const presetMap: Record<string, { sectionId: number; updatedAt: string }> = {};

  Object.entries(subjectData).forEach(([sectionIdStr, project]) => {
    const sectionId = parseInt(sectionIdStr);
    const preset = project.presetId;
    const updatedAt = project.updatedAt;

    if (!presetMap[preset] || updatedAt > presetMap[preset].updatedAt) {
      presetMap[preset] = { sectionId, updatedAt };
    }
  });

  return Object.entries(presetMap).map(([presetId, { sectionId, updatedAt }]) => ({
    presetId,
    sectionId,
    updatedAt,
  }));
};

/**
 * 指定したプリセットの最新プロジェクトを取得
 */
export const getSubjectProjectByPreset = (
  subjectId: number,
  presetId: string
): { files: Record<string, { content: string; languageId: string }> } | null => {
  migrateFromV1();
  const data = getAllProjects();
  const subjectData = data[subjectId];

  if (!subjectData) return null;

  // 指定プリセットのプロジェクトを検索（最新を取得）
  let latestProject: ProjectData | null = null;
  let latestUpdatedAt = '';

  Object.values(subjectData).forEach((project) => {
    if (project.presetId === presetId && project.updatedAt > latestUpdatedAt) {
      latestProject = project;
      latestUpdatedAt = project.updatedAt;
    }
  });

  if (!latestProject) return null;
  
  const files = (latestProject as ProjectData).files;
  if (Object.keys(files).length === 0) return null;

  return {
    files: Object.fromEntries(
      Object.entries(files).map(([name, file]) => [
        name,
        { content: file.content, languageId: file.languageId },
      ])
    ),
  };
};

// ===== 後方互換性のための旧API（非推奨） =====

/**
 * @deprecated Use saveProjectFile instead
 */
export const saveCode = (
  subjectId: number,
  sectionId: number,
  code: string,
  language: string = 'javascript'
): void => {
  // 旧形式のsectionIdをデコード
  const actualSectionId = Math.floor(sectionId / 10);
  const fileType = sectionId % 10;

  let filename: string;
  let languageId: string;

  switch (fileType) {
    case 0:
      filename = 'index.html';
      languageId = 'html';
      break;
    case 1:
      filename = 'style.css';
      languageId = 'css';
      break;
    case 2:
      filename = 'script.js';
      languageId = 'javascript';
      break;
    default:
      filename = 'script.js';
      languageId = language;
  }

  saveProjectFile(subjectId, actualSectionId, filename, code, languageId);
};

/**
 * @deprecated Use getProject instead
 */
export const getCode = (
  subjectId: number,
  sectionId: number
): { code: string; language: string } | null => {
  migrateFromV1();
  
  const actualSectionId = Math.floor(sectionId / 10);
  const fileType = sectionId % 10;

  const project = getProject(subjectId, actualSectionId);
  if (!project) return null;

  let filename: string;
  switch (fileType) {
    case 0:
      filename = 'index.html';
      break;
    case 1:
      filename = 'style.css';
      break;
    case 2:
      filename = 'script.js';
      break;
    default:
      return null;
  }

  const file = project.files[filename];
  if (!file) return null;

  return { code: file.content, language: file.languageId };
};

/**
 * @deprecated Use getSubjectFinalProject instead
 */
export const getSubjectFinalCode = (
  subjectId: number
): { html: string; css: string; js: string } | null => {
  const finalProject = getSubjectFinalProject(subjectId);
  if (!finalProject) return null;

  const html = finalProject.files['index.html']?.content || '';
  const css = finalProject.files['style.css']?.content || '';
  const js = finalProject.files['script.js']?.content || '';

  if (!html && !css && !js) return null;

  return { html, css, js };
};

/**
 * @deprecated Use clearSubjectProjects instead
 */
export const clearSubjectCode = (subjectId: number): void => {
  clearSubjectProjects(subjectId);
};
