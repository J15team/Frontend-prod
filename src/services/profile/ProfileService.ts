/**
 * Profile Service
 * プロフィール関連のAPI通信を管理
 */
import apiClient from '../apiClient';
import { type User, normalizeUser } from '@/models/User';
import { saveUser } from '@/utils/storage/tokenStorage';

interface ProfileResponse {
  userId: string;
  username: string;
  email: string;
  profileImageUrl: string | null;
  createdAt: string;
}

interface ProfileUpdateResponse {
  message: string;
  profile: ProfileResponse;
}

/**
 * プロフィール取得
 */
export const getProfile = async (): Promise<User> => {
  const response = await apiClient.get<ProfileResponse>('/profile');
  const user = normalizeUser({
    userId: response.data.userId,
    username: response.data.username,
    email: response.data.email,
    profileImageUrl: response.data.profileImageUrl || undefined,
    createdAt: response.data.createdAt,
  });
  saveUser(user);
  return user;
};

/**
 * プロフィール画像アップロード
 */
export const uploadProfileImage = async (imageFile: File): Promise<User> => {
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await apiClient.post<ProfileUpdateResponse>('/profile/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  const user = normalizeUser({
    userId: response.data.profile.userId,
    username: response.data.profile.username,
    email: response.data.profile.email,
    profileImageUrl: response.data.profile.profileImageUrl || undefined,
    createdAt: response.data.profile.createdAt,
  });
  saveUser(user);
  return user;
};

/**
 * プロフィール画像削除
 */
export const deleteProfileImage = async (): Promise<User> => {
  const response = await apiClient.delete<ProfileUpdateResponse>('/profile/image');

  const user = normalizeUser({
    userId: response.data.profile.userId,
    username: response.data.profile.username,
    email: response.data.profile.email,
    profileImageUrl: response.data.profile.profileImageUrl || undefined,
    createdAt: response.data.profile.createdAt,
  });
  saveUser(user);
  return user;
};

/**
 * ユーザー名更新
 */
export const updateUsername = async (username: string): Promise<User> => {
  const response = await apiClient.put<ProfileUpdateResponse>('/profile/username', {
    username,
  });

  const user = normalizeUser({
    userId: response.data.profile.userId,
    username: response.data.profile.username,
    email: response.data.profile.email,
    profileImageUrl: response.data.profile.profileImageUrl || undefined,
    createdAt: response.data.profile.createdAt,
  });
  saveUser(user);
  return user;
};
