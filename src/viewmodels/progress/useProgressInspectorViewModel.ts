/**
 * Progress Inspector ViewModel
 * 進捗APIの呼び出しとレスポンスを管理
 */
import { useState } from 'react';
import {
  getProgress,
  markSectionComplete,
  unmarkSectionComplete,
} from '@/services/progress/ProgressService';
import { type ProgressData } from '@/models/Progress';

interface ProgressInspectorViewModelReturn {
  progress: ProgressData | null;
  loading: boolean;
  error: string | null;
  message: string | null;
  fetchProgress: (subjectId: number) => Promise<void>;
  markSection: (subjectId: number, sectionId: number) => Promise<void>;
  unmarkSection: (subjectId: number, sectionId: number) => Promise<void>;
}

export const useProgressInspectorViewModel = (): ProgressInspectorViewModelReturn => {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchProgress = async (subjectId: number): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProgress(subjectId);
      setProgress(data);
      setMessage('進捗データを取得しました');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('進捗データの取得に失敗しました');
      }
    } finally {
      setLoading(false);
    }
  };

  const markSection = async (subjectId: number, sectionId: number): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await markSectionComplete(subjectId, { sectionId });
      setMessage(response.message);
      await fetchProgress(subjectId);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('セクション完了の記録に失敗しました');
      }
    } finally {
      setLoading(false);
    }
  };

  const unmarkSection = async (subjectId: number, sectionId: number): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await unmarkSectionComplete(subjectId, sectionId);
      setMessage(response.message);
      await fetchProgress(subjectId);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('セクション完了解除に失敗しました');
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    progress,
    loading,
    error,
    message,
    fetchProgress,
    markSection,
    unmarkSection,
  };
};
