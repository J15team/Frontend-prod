/**
 * Token Refresh View
 * リフレッシュトークンを使ってアクセストークンを取得
 */
import React, { useState } from 'react';
import { useAuthViewModel } from '@/viewmodels/auth/useAuthViewModel';

export const TokenRefreshView: React.FC = () => {
  const { loading, error, handleRefresh } = useAuthViewModel();
  const [success, setSuccess] = useState<string | null>(null);

  const onRefresh = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = await handleRefresh();
    setSuccess(result ? 'アクセストークンを更新しました' : null);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>アクセストークン更新</h1>
        <p className="auth-description">
          ログイン時に取得したリフレッシュトークン（localStorageに保持）を使用して新しいアクセストークンを取得します。
          成功すると自動的にストレージ内のトークンが更新されます。
        </p>
        <form onSubmit={onRefresh} className="auth-form">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? '更新中...' : 'トークンを更新する'}
          </button>
        </form>
        {success && <div className="success-message">{success}</div>}
        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
};
