/**
 * Signin View
 * サインインページのView
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthViewModel } from '@/viewmodels/useAuthViewModel';
import { type SigninRequest } from '@/models/User';

export const SigninView: React.FC = () => {
  const { loading, error, handleSignin } = useAuthViewModel();
  const [formData, setFormData] = useState<SigninRequest>({
    email: '',
    password: '',
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSignin(formData);
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
        <h1>サインイン</h1>
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
              placeholder="example@example.com"
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
            {loading ? 'サインイン中...' : 'サインイン'}
          </button>
        </form>
        <div className="auth-footer">
          アカウントをお持ちでないですか？{' '}
          <Link to="/auth/signup">アカウント作成</Link>
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e0e0e0' }}>
            管理者の方はこちら:{' '}
            <Link to="/auth/admin-signin">Admin Portalへサインイン</Link>
          </div>
        </div>
      </div>
    </div>
  );
};
