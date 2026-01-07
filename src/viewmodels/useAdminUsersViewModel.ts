/**
 * Admin Users ViewModel
 * 管理者ユーザーAPIの状態管理
 */
import { useEffect, useState } from 'react';
import {
  createAdminUser,
  getAdminUsers,
  getAdminUserById,
  updateAdminUser,
  deleteAdminUser,
} from '@/services/AdminService';
import type {
  AdminUser,
  CreateAdminUserRequest,
  UpdateAdminUserRequest,
} from '@/models/AdminUser';

interface AdminUsersViewModelReturn {
  admins: AdminUser[];
  loading: boolean;
  error: string | null;
  success: string | null;
  fetchAdmins: () => Promise<void>;
  createAdmin: (payload: CreateAdminUserRequest, adminKey: string) => Promise<void>;
  updateAdmin: (userId: string, payload: UpdateAdminUserRequest) => Promise<void>;
  deleteAdmin: (userId: string) => Promise<void>;
  loadAdminDetail: (userId: string) => Promise<AdminUser | null>;
}

export const useAdminUsersViewModel = (): AdminUsersViewModelReturn => {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchAdmins = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminUsers();
      setAdmins(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('管理者一覧の取得に失敗しました');
      }
    } finally {
      setLoading(false);
    }
  };

  const createAdmin = async (
    payload: CreateAdminUserRequest,
    adminKey: string
  ): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const admin = await createAdminUser(payload, adminKey);
      setSuccess(`管理者「${admin.username}」を作成しました`);
      await fetchAdmins();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('管理者の作成に失敗しました');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateAdmin = async (
    userId: string,
    payload: UpdateAdminUserRequest
  ): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const admin = await updateAdminUser(userId, payload);
      setSuccess(`管理者「${admin.username}」を更新しました`);
      await fetchAdmins();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('管理者の更新に失敗しました');
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteAdmin = async (userId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await deleteAdminUser(userId);
      setSuccess(`管理者(${userId})を削除しました`);
      await fetchAdmins();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('管理者の削除に失敗しました');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadAdminDetail = async (userId: string): Promise<AdminUser | null> => {
    setLoading(true);
    setError(null);
    try {
      const admin = await getAdminUserById(userId);
      return admin;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('管理者詳細の取得に失敗しました');
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  return {
    admins,
    loading,
    error,
    success,
    fetchAdmins,
    createAdmin,
    updateAdmin,
    deleteAdmin,
    loadAdminDetail,
  };
};
