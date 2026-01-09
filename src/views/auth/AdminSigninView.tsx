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
    <div className="auth-page admin-auth-page">
      <div className="auth-page-bg admin-bg" />
      
      <Link to="/" className="auth-back-link">
        <span>←</span> トップページへ戻る
      </Link>

      <div className="auth-card-modern admin-card">
        <div className="auth-logo">
          <span className="auth-logo-icon">🔐</span>
          <span className="auth-logo-text">Pathly Admin</span>
        </div>
        
        <div className="admin-badge-auth">管理者専用</div>
        
        <h1>Admin Portal</h1>
        <p className="auth-subtitle">管理者アカウントでサインイン</p>

        <form onSubmit={onSubmit} className="auth-form-modern">
          <div className="form-group-modern">
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
          <div className="form-group-modern">
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
          {error && <div className="auth-error">{error}</div>}
          <button type="submit" className="btn-auth-admin" disabled={loading}>
            {loading ? 'サインイン中...' : 'Admin Portalへサインイン'}
          </button>
        </form>
        
        <div className="auth-footer-modern">
          一般ユーザーの方はこちら{' '}
          <Link to="/auth/signin">ユーザーログイン</Link>
        </div>
      </div>
    </div>
  );
};
