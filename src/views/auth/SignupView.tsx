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
    <div className="auth-page">
      <div className="auth-page-bg" />
      
      <Link to="/" className="auth-back-link">
        <span>←</span> トップページへ戻る
      </Link>

      <div className="auth-card-modern">
        <div className="auth-logo">
          <span className="auth-logo-icon">🛤️</span>
          <span className="auth-logo-text">Pathly</span>
        </div>
        
        <h1>はじめまして</h1>
        <p className="auth-subtitle">アカウントを作成して学習を始めましょう</p>

        <form onSubmit={onSubmit} className="auth-form-modern">
          <div className="form-group-modern">
            <label htmlFor="username">ユーザー名</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={onChange}
              required
              placeholder="あなたの名前"
            />
          </div>
          <div className="form-group-modern">
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
          <div className="form-group-modern">
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
          {error && <div className="auth-error">{error}</div>}
          <button type="submit" className="btn-auth-primary" disabled={loading}>
            {loading ? '登録中...' : 'アカウント作成'}
          </button>
        </form>
        
        <div className="auth-footer-modern">
          すでにアカウントをお持ちですか？{' '}
          <Link to="/auth/signin">サインイン</Link>
        </div>
      </div>
    </div>
  );
};
