/**
 * Assignment Service
 * 課題関連のAPI通信を管理
 */
import apiClient from '../apiClient';
import type {
  AssignmentSubject,
  AssignmentSection,
  AssignmentSectionDetail,
  CreateAssignmentSubjectRequest,
  UpdateAssignmentSubjectRequest,
  CreateAssignmentSectionRequest,
  UpdateAssignmentSectionRequest,
  SubmissionRequest,
  SubmissionResponse,
  SubmissionHistoryResponse,
  SubmissionDetail,
  AssignmentProgress,
} from '@/models/Assignment';

// ===== 課題題材 API =====

/**
 * 全ての課題題材を取得
 */
export const getAllAssignmentSubjects = async (): Promise<AssignmentSubject[]> => {
  const response = await apiClient.get<AssignmentSubject[]>('/assignments');
  return response.data;
};

/**
 * 特定の課題題材を取得
 */
export const getAssignmentSubjectById = async (
  assignmentSubjectId: number
): Promise<AssignmentSubject> => {
  const response = await apiClient.get<AssignmentSubject>(
    `/assignments/${assignmentSubjectId}`
  );
  return response.data;
};

/**
 * 課題題材を作成（管理者のみ）
 */
export const createAssignmentSubject = async (
  payload: CreateAssignmentSubjectRequest
): Promise<AssignmentSubject> => {
  const response = await apiClient.post<AssignmentSubject>('/assignments', payload);
  return response.data;
};

/**
 * 課題題材を更新（管理者のみ）
 */
export const updateAssignmentSubject = async (
  assignmentSubjectId: number,
  payload: UpdateAssignmentSubjectRequest
): Promise<AssignmentSubject> => {
  const response = await apiClient.put<AssignmentSubject>(
    `/assignments/${assignmentSubjectId}`,
    payload
  );
  return response.data;
};

/**
 * 課題題材を削除（管理者のみ）
 */
export const deleteAssignmentSubject = async (
  assignmentSubjectId: number
): Promise<void> => {
  await apiClient.delete(`/assignments/${assignmentSubjectId}`);
};

// ===== 課題セクション API =====

/**
 * 課題題材に属するセクション一覧を取得
 */
export const getAssignmentSections = async (
  assignmentSubjectId: number
): Promise<AssignmentSection[]> => {
  const response = await apiClient.get<AssignmentSection[]>(
    `/assignments/${assignmentSubjectId}/sections`
  );
  return response.data;
};

/**
 * 課題セクション詳細を取得（テストケース含む）
 */
export const getAssignmentSectionDetail = async (
  assignmentSubjectId: number,
  sectionId: number
): Promise<AssignmentSectionDetail> => {
  const response = await apiClient.get<AssignmentSectionDetail>(
    `/assignments/${assignmentSubjectId}/sections/${sectionId}`
  );
  return response.data;
};

/**
 * 課題セクションを作成（管理者のみ）
 */
export const createAssignmentSection = async (
  assignmentSubjectId: number,
  payload: CreateAssignmentSectionRequest
): Promise<AssignmentSection> => {
  const response = await apiClient.post<AssignmentSection>(
    `/assignments/${assignmentSubjectId}/sections`,
    payload
  );
  return response.data;
};

/**
 * 課題セクションを更新（管理者のみ）
 */
export const updateAssignmentSection = async (
  assignmentSubjectId: number,
  sectionId: number,
  payload: UpdateAssignmentSectionRequest
): Promise<AssignmentSection> => {
  const response = await apiClient.put<AssignmentSection>(
    `/assignments/${assignmentSubjectId}/sections/${sectionId}`,
    payload
  );
  return response.data;
};

/**
 * 課題セクションを削除（管理者のみ）
 */
export const deleteAssignmentSection = async (
  assignmentSubjectId: number,
  sectionId: number
): Promise<void> => {
  await apiClient.delete(`/assignments/${assignmentSubjectId}/sections/${sectionId}`);
};

// ===== 提出 API =====

/**
 * コードを提出
 */
export const submitCode = async (
  assignmentSubjectId: number,
  sectionId: number,
  payload: SubmissionRequest
): Promise<SubmissionResponse> => {
  const response = await apiClient.post<SubmissionResponse>(
    `/assignments/${assignmentSubjectId}/sections/${sectionId}/submissions`,
    payload
  );
  return response.data;
};

/**
 * 提出履歴を取得
 */
export const getSubmissionHistory = async (
  assignmentSubjectId: number,
  sectionId: number,
  all?: boolean
): Promise<SubmissionHistoryResponse> => {
  const params = all ? { all: 'true' } : {};
  const response = await apiClient.get<SubmissionHistoryResponse>(
    `/assignments/${assignmentSubjectId}/sections/${sectionId}/submissions`,
    { params }
  );
  return response.data;
};

/**
 * 提出詳細を取得
 */
export const getSubmissionDetail = async (
  assignmentSubjectId: number,
  sectionId: number,
  submissionId: number
): Promise<SubmissionDetail> => {
  const response = await apiClient.get<SubmissionDetail>(
    `/assignments/${assignmentSubjectId}/sections/${sectionId}/submissions/${submissionId}`
  );
  return response.data;
};

// ===== 進捗 API =====

/**
 * 課題題材の進捗を取得
 */
export const getAssignmentProgress = async (
  assignmentSubjectId: number
): Promise<AssignmentProgress> => {
  const response = await apiClient.get<AssignmentProgress>(
    `/assignments/${assignmentSubjectId}/progress`
  );
  return response.data;
};

// ===== コードプレビュー API =====

export interface CodePreviewRequest {
  code: string;
  language: string;
  input?: string;
  timeLimit?: number;
}

export interface CodePreviewResponse {
  output: string | null;
  executionTime: number | null;
  status: 'SUCCESS' | 'COMPILE_ERROR' | 'RUNTIME_ERROR' | 'TIMEOUT' | 'ERROR';
  errorMessage: string | null;
}

/**
 * コードをプレビュー実行
 */
export const previewCode = async (
  request: CodePreviewRequest
): Promise<CodePreviewResponse> => {
  const response = await apiClient.post<CodePreviewResponse>('/code/preview', request);
  return response.data;
};
