/**
 * Subjects ViewModel
 * 題材一覧のロジックを管理するViewModel
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { getAllSubjects } from '@/services/subjects/SubjectService';
import { getProgress } from '@/services/progress/ProgressService';
import { getAllTags } from '@/services/tags/TagService';
import { type Subject } from '@/models/Subject';
import { type Tag } from '@/models/Tag';
import {
  getAllDeadlines,
  setDeadline as saveDeadline,
  removeDeadline,
  generateGoogleCalendarUrl,
  getDaysRemaining,
} from '@/utils/storage/deadlineStorage';

interface SubjectProgress {
  [subjectId: number]: number; // progressPercentage
}

interface SubjectDeadlines {
  [subjectId: number]: string; // ISO date string
}

interface SubjectTagsMap {
  [subjectId: number]: Tag[];
}

/**
 * タグ一覧からsubjectIdごとのタグマップを構築
 */
const buildSubjectTagsMap = (tags: Tag[]): SubjectTagsMap => {
  const map: SubjectTagsMap = {};
  for (const tag of tags) {
    if (tag.subjectIds) {
      for (const subjectId of tag.subjectIds) {
        if (!map[subjectId]) {
          map[subjectId] = [];
        }
        map[subjectId].push(tag);
      }
    }
  }
  return map;
};

interface SubjectsViewModelReturn {
  subjects: Subject[];
  progress: SubjectProgress;
  deadlines: SubjectDeadlines;
  allTags: Tag[];
  subjectTags: SubjectTagsMap;
  selectedTags: string[];
  loading: boolean;
  error: string | null;
  fetchSubjects: (tags?: string[]) => Promise<void>;
  setDeadline: (subjectId: number, deadline: string) => void;
  clearDeadline: (subjectId: number) => void;
  getGoogleCalendarUrl: (subject: Subject) => string | null;
  getDaysRemaining: (subjectId: number) => number | null;
  toggleTagFilter: (tagName: string) => void;
  clearTagFilters: () => void;
}

export const useSubjectsViewModel = (): SubjectsViewModelReturn => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [progress, setProgress] = useState<SubjectProgress>({});
  const [deadlines, setDeadlines] = useState<SubjectDeadlines>({});
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [subjectTags, setSubjectTags] = useState<SubjectTagsMap>({});
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 重複フェッチ防止用のref
  const isFetchingRef = useRef(false);
  const isFetchingTagsRef = useRef(false);
  const tagsFetchedRef = useRef(false);
  const progressCacheRef = useRef<SubjectProgress>({});

  /**
   * タグ一覧を取得し、subjectTagsマップを構築
   * 重複フェッチを防止
   */
  const fetchAllTags = async (): Promise<void> => {
    // 既にフェッチ済みまたはフェッチ中の場合はスキップ
    if (tagsFetchedRef.current || isFetchingTagsRef.current) {
      return;
    }

    isFetchingTagsRef.current = true;

    try {
      const tags = await getAllTags();
      setAllTags(tags);
      // subjectIdsから逆引きマップを構築
      setSubjectTags(buildSubjectTagsMap(tags));
      tagsFetchedRef.current = true;
    } catch (err) {
      console.error('Failed to fetch tags:', err);
    } finally {
      isFetchingTagsRef.current = false;
    }
  };

  /**
   * 題材一覧と進捗を取得
   * 重複フェッチを防止するためrefで管理
   */
  const fetchSubjects = async (tags?: string[]): Promise<void> => {
    // 既にフェッチ中の場合はスキップ
    if (isFetchingRef.current) {
      return;
    }

    isFetchingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const data = await getAllSubjects(tags);
      setSubjects(data);

      // 保存済みの期限を読み込み
      setDeadlines(getAllDeadlines());

      // 進捗を取得（refのキャッシュを使用して重複APIコールを防止）
      const progressMap: SubjectProgress = { ...progressCacheRef.current };
      const subjectsNeedingProgress = data.filter(
        (s) => progressMap[s.subjectId] === undefined
      );

      await Promise.all(
        subjectsNeedingProgress.map(async (subject) => {
          try {
            const progressData = await getProgress(subject.subjectId);
            progressMap[subject.subjectId] = progressData.progressPercentage;
          } catch {
            progressMap[subject.subjectId] = 0;
          }
        })
      );

      // refとstateの両方を更新
      progressCacheRef.current = progressMap;
      setProgress(progressMap);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('題材の取得に失敗しました');
      }
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  const toggleTagFilter = useCallback((tagName: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tagName)) {
        return prev.filter(t => t !== tagName);
      } else {
        return [...prev, tagName];
      }
    });
  }, []);

  const clearTagFilters = useCallback(() => {
    setSelectedTags([]);
  }, []);

  const setDeadline = useCallback((subjectId: number, deadline: string) => {
    saveDeadline(subjectId, deadline);
    setDeadlines((prev) => ({ ...prev, [subjectId]: deadline }));
  }, []);

  const clearDeadline = useCallback((subjectId: number) => {
    removeDeadline(subjectId);
    setDeadlines((prev) => {
      const newDeadlines = { ...prev };
      delete newDeadlines[subjectId];
      return newDeadlines;
    });
  }, []);

  const getGoogleCalendarUrl = useCallback(
    (subject: Subject): string | null => {
      const deadline = deadlines[subject.subjectId];
      if (!deadline) return null;
      return generateGoogleCalendarUrl(subject.title, deadline, subject.description);
    },
    [deadlines]
  );

  const getDaysRemainingForSubject = useCallback(
    (subjectId: number): number | null => {
      const deadline = deadlines[subjectId];
      if (!deadline) return null;
      return getDaysRemaining(deadline);
    },
    [deadlines]
  );

  // コンポーネントマウント時にタグ一覧を取得
  useEffect(() => {
    fetchAllTags();
  }, []);

  // 初回マウント時およびタグフィルター変更時に題材を取得
  useEffect(() => {
    if (selectedTags.length > 0) {
      fetchSubjects(selectedTags);
    } else {
      fetchSubjects();
    }
  }, [selectedTags]);

  return {
    subjects,
    progress,
    deadlines,
    allTags,
    subjectTags,
    selectedTags,
    loading,
    error,
    fetchSubjects,
    setDeadline,
    clearDeadline,
    getGoogleCalendarUrl,
    getDaysRemaining: getDaysRemainingForSubject,
    toggleTagFilter,
    clearTagFilters,
  };
};
