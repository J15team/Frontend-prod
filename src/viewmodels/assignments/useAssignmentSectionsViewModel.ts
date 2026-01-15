/**
 * useAssignmentSectionsViewModel
 * 課題セクション一覧・詳細ページのViewModel
 */
import { useState, useCallback } from 'react';
import type {
  AssignmentSubject,
  AssignmentSection,
  AssignmentSectionDetail,
  SubmissionHistoryItem,
  SubmissionDetail,
  AssignmentProgress,
  ProgressSection,
} from '@/models/Assignment';
import {
  getAssignmentSubjectById,
  getAssignmentSections,
  getAssignmentSectionDetail,
  submitCode,
  getSubmissionHistory,
  getSubmissionDetail,
  getAssignmentProgress,
} from '@/services/assignments/AssignmentService';

interface UseAssignmentSectionsViewModelReturn {
  subject: AssignmentSubject | null;
  sections: AssignmentSection[];
  currentSection: AssignmentSectionDetail | null;
  submissions: SubmissionHistoryItem[];
  currentSubmission: SubmissionDetail | null;
  progress: AssignmentProgress | null;
  loading: boolean;
  submitting: boolean;
  error: string | null;
  loadSubject: (assignmentSubjectId: number) => Promise<void>;
  loadSections: (assignmentSubjectId: number) => Promise<void>;
  loadSectionDetail: (assignmentSubjectId: number, sectionId: number) => Promise<void>;
  loadProgress: (assignmentSubjectId: number) => Promise<void>;
  submit: (assignmentSubjectId: number, sectionId: number, code: string, language: string) => Promise<number | null>;
  loadSubmissionHistory: (assignmentSubjectId: number, sectionId: number) => Promise<void>;
  loadSubmissionDetail: (assignmentSubjectId: number, sectionId: number, submissionId: number) => Promise<void>;
  pollSubmissionResult: (assignmentSubjectId: number, sectionId: number, submissionId: number) => Promise<SubmissionDetail | null>;
  selectSection: (section: AssignmentSection) => void;
  getSectionProgress: (sectionId: number) => ProgressSection | undefined;
}

export const useAssignmentSectionsViewModel = (): UseAssignmentSectionsViewModelReturn => {
  const [subject, setSubject] = useState<AssignmentSubject | null>(null);
  const [sections, setSections] = useState<AssignmentSection[]>([]);
  const [currentSection, setCurrentSection] = useState<AssignmentSectionDetail | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionHistoryItem[]>([]);
  const [currentSubmission, setCurrentSubmission] = useState<SubmissionDetail | null>(null);
  const [progress, setProgress] = useState<AssignmentProgress | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSubject = useCallback(async (assignmentSubjectId: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAssignmentSubjectById(assignmentSubjectId);
      setSubject(data);
    } catch (err) {
      console.error('課題題材の取得に失敗:', err);
      setError('課題題材の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSections = useCallback(async (assignmentSubjectId: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAssignmentSections(assignmentSubjectId);
      setSections(data);
      // 最初のセクションを自動選択
      if (data.length > 0) {
        setCurrentSection(data[0] as AssignmentSectionDetail);
      }
    } catch (err) {
      console.error('セクション一覧の取得に失敗:', err);
      setError('セクション一覧の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSectionDetail = useCallback(async (assignmentSubjectId: number, sectionId: number) => {
    try {
      const data = await getAssignmentSectionDetail(assignmentSubjectId, sectionId);
      setCurrentSection(data);
    } catch (err) {
      console.error('セクション詳細の取得に失敗:', err);
    }
  }, []);

  const loadProgress = useCallback(async (assignmentSubjectId: number) => {
    try {
      const data = await getAssignmentProgress(assignmentSubjectId);
      setProgress(data);
    } catch (err) {
      console.error('進捗の取得に失敗:', err);
    }
  }, []);

  const getSectionProgress = useCallback((sectionId: number): ProgressSection | undefined => {
    return progress?.sections.find(s => s.sectionId === sectionId);
  }, [progress]);

  const submit = useCallback(async (
    assignmentSubjectId: number,
    sectionId: number,
    code: string,
    language: string
  ): Promise<number | null> => {
    try {
      setSubmitting(true);
      setError(null);
      const response = await submitCode(assignmentSubjectId, sectionId, { code, language });
      return response.submissionId;
    } catch (err) {
      console.error('提出に失敗:', err);
      setError('提出に失敗しました');
      return null;
    } finally {
      setSubmitting(false);
    }
  }, []);

  const loadSubmissionHistory = useCallback(async (assignmentSubjectId: number, sectionId: number) => {
    try {
      const response = await getSubmissionHistory(assignmentSubjectId, sectionId);
      setSubmissions(response.submissions);
    } catch (err) {
      console.error('提出履歴の取得に失敗:', err);
      setSubmissions([]);
    }
  }, []);

  const loadSubmissionDetail = useCallback(async (
    assignmentSubjectId: number,
    sectionId: number,
    submissionId: number
  ) => {
    try {
      const data = await getSubmissionDetail(assignmentSubjectId, sectionId, submissionId);
      setCurrentSubmission(data);
    } catch (err) {
      console.error('提出詳細の取得に失敗:', err);
    }
  }, []);

  const pollSubmissionResult = useCallback(async (
    assignmentSubjectId: number,
    sectionId: number,
    submissionId: number
  ): Promise<SubmissionDetail | null> => {
    const maxAttempts = 30;
    const interval = 1000;

    for (let i = 0; i < maxAttempts; i++) {
      try {
        const detail = await getSubmissionDetail(assignmentSubjectId, sectionId, submissionId);
        if (detail.status === 'COMPLETED') {
          setCurrentSubmission(detail);
          return detail;
        }
        await new Promise(resolve => setTimeout(resolve, interval));
      } catch (err) {
        console.error('結果取得エラー:', err);
        break;
      }
    }
    return null;
  }, []);

  const selectSection = useCallback((section: AssignmentSection) => {
    // 現在のセクションと同じなら何もしない
    if (currentSection?.sectionId === section.sectionId) return;
    
    // セクションを選択
    setCurrentSection(section as AssignmentSectionDetail);
    setCurrentSubmission(null);
    setSubmissions([]);
  }, [currentSection]);

  return {
    subject,
    sections,
    currentSection,
    submissions,
    currentSubmission,
    progress,
    loading,
    submitting,
    error,
    loadSubject,
    loadSections,
    loadSectionDetail,
    loadProgress,
    submit,
    loadSubmissionHistory,
    loadSubmissionDetail,
    pollSubmissionResult,
    selectSection,
    getSectionProgress,
  };
};
