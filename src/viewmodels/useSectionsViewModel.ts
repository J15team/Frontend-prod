/**
 * Sections ViewModel
 * セクション一覧と進捗管理のロジックを管理するViewModel
 */
import { useState, useRef } from 'react';
import { getSubjectById, getSectionsBySubjectId } from '@/services/SubjectService';
import { getProgress, markSectionComplete, unmarkSectionComplete } from '@/services/ProgressService';
import { type Subject } from '@/models/Subject';
import { type Section } from '@/models/Section';
import { type ProgressData } from '@/models/Progress';

interface SectionsViewModelReturn {
  subject: Subject | null;
  sections: Section[];
  progressData: ProgressData | null;
  currentSection: Section | null;
  loading: boolean;
  error: string | null;
  showCelebration: boolean;
  fetchData: (subjectId: number) => Promise<void>;
  selectSection: (section: Section) => void;
  toggleSectionComplete: (sectionId: number) => Promise<void>;
  isSectionCleared: (sectionId: number) => boolean;
  dismissCelebration: () => void;
}

export const useSectionsViewModel = (): SectionsViewModelReturn => {
  const [subject, setSubject] = useState<Subject | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [currentSection, setCurrentSection] = useState<Section | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const previousPercentage = useRef<number>(0);

  /**
   * 題材、セクション、進捗データを取得
   */
  const fetchData = async (subjectId: number): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      // 並列で3つのAPIを呼び出し
      const [subjectData, sectionsData, progressResponse] = await Promise.all([
        getSubjectById(subjectId),
        getSectionsBySubjectId(subjectId),
        getProgress(subjectId),
      ]);

      setSubject(subjectData);
      setSections(sectionsData);

      // 進捗データを整形
      const newProgressData = {
        ...progressResponse,
        totalSections: progressResponse.totalSections || subjectData.maxSections,
      };
      setProgressData(newProgressData);
      previousPercentage.current = newProgressData.progressPercentage;

      // 最初のセクションを選択
      if (sectionsData.length > 0) {
        setCurrentSection(sectionsData[0]);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('データの取得に失敗しました');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * セクションを選択
   */
  const selectSection = (section: Section): void => {
    setCurrentSection(section);
  };

  /**
   * セクションの完了状態を切り替え
   */
  const toggleSectionComplete = async (sectionId: number): Promise<void> => {
    if (!subject || !progressData) return;

    const isCleared = isSectionCleared(sectionId);

    try {
      if (isCleared) {
        // 未完了にする
        await unmarkSectionComplete(subject.subjectId, sectionId);
      } else {
        // 完了にする
        await markSectionComplete(subject.subjectId, { sectionId });
      }

      // 進捗データを再取得
      const progressResponse = await getProgress(subject.subjectId);
      const newProgressData = {
        ...progressResponse,
        totalSections: progressResponse.totalSections || subject.maxSections,
      };
      
      // 100%達成時にお祝いエフェクトを表示
      if (newProgressData.progressPercentage === 100 && previousPercentage.current < 100) {
        setShowCelebration(true);
      }
      
      previousPercentage.current = newProgressData.progressPercentage;
      setProgressData(newProgressData);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('進捗の更新に失敗しました');
      }
    }
  };

  /**
   * セクションが完了済みかチェック
   */
  const isSectionCleared = (sectionId: number): boolean => {
    if (!progressData) return false;
    return progressData.clearedSections.some(cs => cs.sectionId === sectionId);
  };

  /**
   * お祝いエフェクトを非表示にする
   */
  const dismissCelebration = (): void => {
    setShowCelebration(false);
  };

  return {
    subject,
    sections,
    progressData,
    currentSection,
    loading,
    error,
    showCelebration,
    fetchData,
    selectSection,
    toggleSectionComplete,
    isSectionCleared,
    dismissCelebration,
  };
};
