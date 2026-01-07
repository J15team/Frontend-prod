/**
 * 管理者ユーザーモデル
 */
export interface AdminUser {
  userId: string;
  email: string;
  username: string;
  role: 'ROLE_ADMIN';
}

/**
 * 管理者ユーザー作成リクエスト
 */
export interface CreateAdminUserRequest {
  email: string;
  username: string;
  password: string;
}

/**
 * 管理者ユーザー更新リクエスト
 */
export interface UpdateAdminUserRequest {
  email?: string;
  username?: string;
}

export interface AdminUserListResponse {
  admins: AdminUser[];
}
