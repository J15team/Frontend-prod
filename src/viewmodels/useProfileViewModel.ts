/**
 * Profile ViewModel
 * プロフィール画面のロジックを管理
 */
import { useState, useEffect, useCallback } from 'react';
import { getStoredUser } from '@/utils/tokenStorage';
import { getAllSubjects } from '@/services/SubjectService';
import { getProgress } from '@/services/ProgressService';
import {
  getProfile,
  uploadProfileImage,
  deleteProfileImage,
  updateUsername,
} from '@/services/ProfileService';
import { getAllDeadlines, getDaysRemaining } from '@/utils/deadlineStorage';
import { type User } from '@/models/User';
import { type Subject } from '@/models/Subject';

interface SubjectWithProgress extends Subject {
  progressPercentage: number;
  isCompleted: boolean;
  deadline: string | null;
  daysRemaining: number | null;
}

interface ProfileViewModelReturn {
  user: User | null;
  inProgressSubjects: SubjectWithProgress[];
  completedSubjects: SubjectWithProgress[];
  loading: boolean;
  updating: boolean;
  error: string | null;
  updateError: string | null;
  refreshProfile: () => Promise<void>;
  handleUpdateUsername: (newUsername: string) => Promise<boolean>;
  handleUploadImage: (file: File) => Promise<boolean>;
  handleDeleteImage: () => Promise<boolean>;
}

export const useProfileViewModel = (): ProfileViewModelReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [inProgressSubjects, setInProgressSubjects] = useState<SubjectWithProgress[]>([]);
  const [completedSubjects, setCompletedSubjects] = useState<SubjectWithProgress[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // プロフィールをAPIから取得
      let currentUser: User | null;
      try {
        currentUser = await getProfile();
      } catch {
        // APIエラー時はローカルストレージから取得
        currentUser = getStoredUser();
      }
      setUser(currentUser);

      // 全題材を取得
      const subjects = await getAllSubjects();
      const deadlines = getAllDeadlines();

      // 各題材の進捗を取得
      const subjectsWithProgress: SubjectWithProgress[] = await Promise.all(
        subjects.map(async (subject) => {
          const deadline = deadlines[subject.subjectId] || null;
          try {
            const progress = await getProgress(subject.subjectId);
            return {
              ...subject,
              progressPercentage: progress.progressPercentage,
              isCompleted: progress.isAllCleared,
              deadline,
              daysRemaining: deadline ? getDaysRemaining(deadline) : null,
            };
          } catch {
            return {
              ...subject,
              progressPercentage: 0,
              isCompleted: false,
              deadline,
              daysRemaining: deadline ? getDaysRemaining(deadline) : null,
            };
          }
        })
      );

      // 進行中と完了済みに分類
      const inProgress = subjectsWithProgress.filter(
        (s) => s.progressPercentage > 0 && !s.isCompleted
      );
      const completed = subjectsWithProgress.filter((s) => s.isCompleted);

      setInProgressSubjects(inProgress);
      setCompletedSubjects(completed);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('データの取得に失敗しました');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const updatedUser = await getProfile();
      setUser(updatedUser);
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  }, []);

  const handleUpdateUsername = useCallback(async (newUsername: string): Promise<boolean> => {
    setUpdating(true);
    setUpdateError(null);
    try {
      const updatedUser = await updateUsername(newUsername);
      setUser(updatedUser);
      return true;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setUpdateError(err.message);
      } else {
        setUpdateError('ユーザー名の更新に失敗しました');
      }
      return false;
    } finally {
      setUpdating(false);
    }
  }, []);

  const handleUploadImage = useCallback(async (file: File): Promise<boolean> => {
    setUpdating(true);
    setUpdateError(null);
    try {
      const updatedUser = await uploadProfileImage(file);
      setUser(updatedUser);
      return true;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setUpdateError(err.message);
      } else {
        setUpdateError('画像のアップロードに失敗しました');
      }
      return false;
    } finally {
      setUpdating(false);
    }
  }, []);

  const handleDeleteImage = useCallback(async (): Promise<boolean> => {
    setUpdating(true);
    setUpdateError(null);
    try {
      const updatedUser = await deleteProfileImage();
      setUser(updatedUser);
      return true;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setUpdateError(err.message);
      } else {
        setUpdateError('画像の削除に失敗しました');
      }
      return false;
    } finally {
      setUpdating(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    user,
    inProgressSubjects,
    completedSubjects,
    loading,
    updating,
    error,
    updateError,
    refreshProfile,
    handleUpdateUsername,
    handleUploadImage,
    handleDeleteImage,
  };
};
