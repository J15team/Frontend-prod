/**
 * Admin Users View
 * 管理者APIの操作
 */
import React, { useEffect, useState } from 'react';
import { useAdminUsersViewModel } from '@/viewmodels/admin/useAdminUsersViewModel';

interface AdminCreateForm {
  email: string;
  username: string;
  password: string;
  adminKey: string;
}

interface AdminUpdateForm {
  email: string;
  username: string;
}

export const AdminUsersView: React.FC = () => {
  const {
    admins,
    loading,
    error,
    success,
    createAdmin,
    updateAdmin,
    deleteAdmin,
  } = useAdminUsersViewModel();

  const [createForm, setCreateForm] = useState<AdminCreateForm>({
    email: '',
    username: '',
    password: '',
    adminKey: '',
  });
  const [selectedAdminId, setSelectedAdminId] = useState<string>('');
  const [updateForm, setUpdateForm] = useState<AdminUpdateForm>({
    email: '',
    username: '',
  });

  useEffect(() => {
    if (!selectedAdminId) {
      setUpdateForm({ email: '', username: '' });
      return;
    }
    const target = admins.find((admin) => admin.userId === selectedAdminId);
    if (target) {
      setUpdateForm({ email: target.email, username: target.username });
    }
  }, [selectedAdminId, admins]);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    await createAdmin(
      {
        email: createForm.email,
        username: createForm.username,
        password: createForm.password,
      },
      createForm.adminKey
    );
    setCreateForm({ email: '', username: '', password: '', adminKey: '' });
  };

  const handleUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedAdminId) return;
    await updateAdmin(selectedAdminId, {
      email: updateForm.email,
      username: updateForm.username,
    });
  };

  const handleDelete = async () => {
    if (!selectedAdminId) return;
    await deleteAdmin(selectedAdminId);
    setSelectedAdminId('');
  };

  return (
    <div className="management-container">
      <h1>管理者API</h1>
      <p>
        <code>X-Admin-Key</code> ヘッダーを用いる <code>POST /api/admin/users</code> と、JWTで保護された管理者一覧/更新エンドポイントを操作します。
      </p>
      {success && <div className="success-message">{success}</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="management-grid">
        <div className="management-card">
          <h2>管理者作成 (APIキー)</h2>
          <form className="management-form" onSubmit={handleCreate}>
            <label>
              メールアドレス
              <input
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                required
              />
            </label>
            <label>
              ユーザー名
              <input
                type="text"
                value={createForm.username}
                onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                required
              />
            </label>
            <label>
              パスワード
              <input
                type="password"
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                required
              />
            </label>
            <label>
              X-Admin-Key
              <input
                type="password"
                value={createForm.adminKey}
                onChange={(e) => setCreateForm({ ...createForm, adminKey: e.target.value })}
                required
              />
            </label>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? '送信中...' : '管理者を作成'}
            </button>
          </form>
        </div>

        <div className="management-card">
          <h2>管理者更新/削除</h2>
          <form className="management-form" onSubmit={handleUpdate}>
            <label>
              編集する管理者
              <select
                value={selectedAdminId}
                onChange={(e) => setSelectedAdminId(e.target.value)}
              >
                <option value="">選択してください</option>
                {admins.map((admin) => (
                  <option key={admin.userId} value={admin.userId}>
                    {admin.username} ({admin.email})
                  </option>
                ))}
              </select>
            </label>
            <label>
              メールアドレス
              <input
                type="email"
                value={updateForm.email}
                onChange={(e) => setUpdateForm({ ...updateForm, email: e.target.value })}
              />
            </label>
            <label>
              ユーザー名
              <input
                type="text"
                value={updateForm.username}
                onChange={(e) => setUpdateForm({ ...updateForm, username: e.target.value })}
              />
            </label>
            <div className="management-actions">
              <button type="submit" className="btn-primary" disabled={!selectedAdminId || loading}>
                {loading ? '更新中...' : '更新'}
              </button>
              <button
                type="button"
                className="btn-secondary"
                disabled={!selectedAdminId || loading}
                onClick={handleDelete}
              >
                削除
              </button>
            </div>
          </form>
        </div>
      </div>

      <section className="data-section">
        <h2>管理者一覧 (GET)</h2>
        <div className="data-table">
          <div className="data-table-header">
            <span>ID</span>
            <span>メールアドレス</span>
            <span>ユーザー名</span>
            <span>ロール</span>
          </div>
          {admins.map((admin) => (
            <div key={admin.userId} className="data-table-row">
              <span>{admin.userId}</span>
              <span>{admin.email}</span>
              <span>{admin.username}</span>
              <span>{admin.role}</span>
            </div>
          ))}
          {admins.length === 0 && <p>まだ登録された管理者が表示できません。</p>}
        </div>
      </section>
    </div>
  );
};
