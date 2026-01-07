/**
 * Admin Signin View
 * Admin Portal専用サインインページ
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminAuthViewModel } from '@/viewmodels/useAdminAuthViewModel';

export const AdminSigninView: React.FC = () => {
  const { loading, error, handleAdminSignin } = useAdminAuthViewModel();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleAdminSignin(formData);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Admin Portalへサインイン</h1>
        <p className="auth-subtitle">管理者専用ページへのアクセス</p>
        <form onSubmit={onSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">メールアドレス</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={onChange}
              required
              placeholder="admin@example.com"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">パスワード</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={onChange}
              required
              placeholder="パスワード"
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'サインイン中...' : 'Admin Portalへサインイン'}
          </button>
        </form>
        <div className="auth-footer">
          通常のユーザーの方はこちら:{' '}
          <Link to="/auth/signin">マイアカウントへサインイン</Link>
        </div>
      </div>
    </div>
  );
};
