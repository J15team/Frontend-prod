/**
 * useCodeStorage (V2)
 * 新しいプロジェクトベースのコード管理フック
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getProject,
  initializeProject,
  saveProjectFile,
  changeProjectPreset,
  type ProjectData,
  type ProjectFile,
} from '@/utils/storage/codeStorage';
import {
  getPresetById,
  DEFAULT_PRESET,
  type PresetDefinition,
} from '@/config/languageConfig';

interface UseCodeStorageOptions {
  subjectId: number;
  sectionId: number;
  autoSaveDelay?: number;
}

interface UseCodeStorageReturn {
  // プロジェクトデータ
  project: ProjectData | null;
  preset: PresetDefinition;
  isLoading: boolean;

  // ファイル操作
  files: Record<string, ProjectFile>;
  activeFile: string | null;
  setActiveFile: (filename: string) => void;
  updateFileContent: (filename: string, content: string) => void;

  // プリセット操作
  changePreset: (presetId: string) => void;
}

export const useCodeStorage = ({
  subjectId,
  sectionId,
  autoSaveDelay = 500,
}: UseCodeStorageOptions): UseCodeStorageReturn => {
  const [project, setProject] = useState<ProjectData | null>(null);
  const [preset, setPreset] = useState<PresetDefinition>(DEFAULT_PRESET);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 初期化
  useEffect(() => {
    setIsLoading(true);

    // プロジェクトを初期化（継承ロジック含む）
    const currentProject = initializeProject(subjectId, sectionId);

    setProject(currentProject);

    // プリセットを設定
    const currentPreset = getPresetById(currentProject.presetId) || DEFAULT_PRESET;
    setPreset(currentPreset);

    // 最初のファイルをアクティブに
    const fileNames = Object.keys(currentProject.files);
    if (fileNames.length > 0) {
      setActiveFile(fileNames[0]);
    }

    setIsLoading(false);
  }, [subjectId, sectionId]);

  // ファイル内容更新（オートセーブ付き）
  const updateFileContent = useCallback(
    (filename: string, content: string) => {
      if (!project) return;

      const file = project.files[filename];
      if (!file) return;

      // ローカル状態を即座に更新
      setProject(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          files: {
            ...prev.files,
            [filename]: {
              ...prev.files[filename],
              content,
              updatedAt: new Date().toISOString(),
            },
          },
          updatedAt: new Date().toISOString(),
        };
      });

      // 既存のタイマーをクリア
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // debounceで保存
      saveTimeoutRef.current = setTimeout(() => {
        saveProjectFile(subjectId, sectionId, filename, content, file.languageId);
      }, autoSaveDelay);
    },
    [subjectId, sectionId, autoSaveDelay, project]
  );

  // プリセット変更
  const changePreset = useCallback(
    (presetId: string) => {
      const newPreset = getPresetById(presetId);
      if (!newPreset) return;

      // ストレージを更新
      changeProjectPreset(subjectId, sectionId, presetId);

      // ローカル状態を更新
      const updatedProject = getProject(subjectId, sectionId);
      if (updatedProject) {
        setProject(updatedProject);
        setPreset(newPreset);

        // 最初のファイルをアクティブに
        const fileNames = Object.keys(updatedProject.files);
        if (fileNames.length > 0) {
          setActiveFile(fileNames[0]);
        }
      }
    },
    [subjectId, sectionId]
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
    project,
    preset,
    isLoading,
    files: project?.files || {},
    activeFile,
    setActiveFile,
    updateFileContent,
    changePreset,
  };
};

// ===== 後方互換性のためのエクスポート =====
export type { FileType } from '@/config/languageConfig';

// 旧APIの型エクスポート（互換性のため）
export interface CodeState {
  html: string;
  css: string;
  javascript: string;
}

export const FILE_TYPES = ['html', 'css', 'javascript'] as const;