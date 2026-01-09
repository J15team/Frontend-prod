/**
 * Profile ViewModel
 * プロフィール画面のロジックを管理
 */
import { useState, useEffect } from 'react';
import { getStoredUser } from '@/utils/tokenStorage';
import { getAllSubjects } from '@/services/SubjectService';
import { getProgress } from '@/services/ProgressService';
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
  error: string | null;
}

export const useProfileViewModel = (): ProfileViewModelReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [inProgressSubjects, setInProgressSubjects] = useState<SubjectWithProgress[]>([]);
  const [completedSubjects, setCompletedSubjects] = useState<SubjectWithProgress[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // ユーザー情報を取得
        const storedUser = getStoredUser();
        setUser(storedUser);

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
    };

    fetchData();
  }, []);

  return {
    user,
    inProgressSubjects,
    completedSubjects,
    loading,
    error,
  };
};
