/**
 * Admin Service
 * 管理者APIとの通信を担当
 */
import apiClient from '../apiClient';
import type {
  AdminUser,
  AdminUserListResponse,
  CreateAdminUserRequest,
  UpdateAdminUserRequest,
} from '@/models/AdminUser';

// ===== 進捗ダッシュボード用の型定義 =====

// 課題題材進捗
export interface AssignmentSubjectProgressSummary {
  subjectId: number;
  title: string;
  progressPercent: number;
  clearedSections: number;
  totalSections: number;
  isCleared: boolean;
}

export interface AssignmentUserProgressSummary {
  userId: string;
  username: string;
  email: string;
  subjects: AssignmentSubjectProgressSummary[];
}

export interface AdminAssignmentProgressResponse {
  users: AssignmentUserProgressSummary[];
}

// 通常題材進捗
export interface SubjectProgressSummary {
  subjectId: number;
  title: string;
  progressPercent: number;
  clearedSections: number;
  totalSections: number;
  isCleared: boolean;
}

export interface UserSubjectProgressSummary {
  userId: string;
  username: string;
  email: string;
  subjects: SubjectProgressSummary[];
}

export interface AdminSubjectProgressResponse {
  users: UserSubjectProgressSummary[];
}

// ===== 管理者ユーザー API =====

/**
 * 管理者ユーザーを作成
 */
export const createAdminUser = async (
  payload: CreateAdminUserRequest,
  adminKey: string
): Promise<AdminUser> => {
  const response = await apiClient.post<AdminUser>('/admin/users', payload, {
    headers: {
      'X-Admin-Key': adminKey,
    },
  });
  return response.data;
};

/**
 * 管理者ユーザー一覧を取得
 */
export const getAdminUsers = async (): Promise<AdminUser[]> => {
  const response = await apiClient.get<AdminUserListResponse>('/admin/users');
  return response.data.admins;
};

/**
 * 管理者ユーザー詳細を取得
 */
export const getAdminUserById = async (userId: string): Promise<AdminUser> => {
  const response = await apiClient.get<AdminUser>(`/admin/users/${userId}`);
  return response.data;
};

/**
 * 管理者ユーザーを更新
 */
export const updateAdminUser = async (
  userId: string,
  payload: UpdateAdminUserRequest
): Promise<AdminUser> => {
  const response = await apiClient.put<AdminUser>(`/admin/users/${userId}`, payload);
  return response.data;
};

/**
 * 管理者ユーザーを削除
 */
export const deleteAdminUser = async (userId: string): Promise<void> => {
  await apiClient.delete(`/admin/users/${userId}`);
};

// ===== 進捗ダッシュボード API =====

/**
 * 全ユーザーの課題題材進捗を取得
 */
export const getAdminAssignmentProgress = async (): Promise<AdminAssignmentProgressResponse> => {
  const response = await apiClient.get<AdminAssignmentProgressResponse>('/admin/progress/assignments');
  return response.data;
};

/**
 * 全ユーザーの通常題材進捗を取得
 */
export const getAdminSubjectProgress = async (): Promise<AdminSubjectProgressResponse> => {
  const response = await apiClient.get<AdminSubjectProgressResponse>('/admin/progress/subjects');
  return response.data;
};
