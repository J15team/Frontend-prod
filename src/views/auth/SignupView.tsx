/**
 * Signup View
 * サインアップページのView
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthViewModel } from '@/viewmodels/useAuthViewModel';
import { type SignupRequest } from '@/models/User';

export const SignupView: React.FC = () => {
  const { loading, error, handleSignup } = useAuthViewModel();
  const [formData, setFormData] = useState<SignupRequest>({
    email: '',
    password: '',
    username: '',
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSignup(formData);
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
        <h1>アカウント作成</h1>
        <form onSubmit={onSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">ユーザー名</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={onChange}
              required
              placeholder="testuser"
            />
          </div>
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
              placeholder="8文字以上"
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? '登録中...' : 'アカウント作成'}
          </button>
        </form>
        <div className="auth-footer">
          すでにアカウントをお持ちですか？{' '}
          <Link to="/auth/signin">サインイン</Link>
        </div>
      </div>
    </div>
  );
};
