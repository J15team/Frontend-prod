/**
 * Signin View
 * サインインページのView
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthViewModel } from '@/viewmodels/auth/useAuthViewModel';
import { GoogleSignInButton } from '@/components/features/GoogleSignInButton/GoogleSignInButton';
import { GitHubSignInButton } from '@/components/features/GitHubSignInButton/GitHubSignInButton';
import { type SigninRequest } from '@/models/User';

export const SigninView: React.FC = () => {
  const { loading, error, handleSignin, handleGoogleSignin } = useAuthViewModel();
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

  const onGoogleSuccess = async (credential: string) => {
    await handleGoogleSignin(credential);
  };

  return (
    <div className="auth-page">
      <div className="auth-page-bg" />
      
      <Link to="/" className="auth-back-link">
        <span>←</span> トップページへ戻る
      </Link>

      <div className="auth-card-modern">
        <div className="auth-logo">
          <img src="/icon.PNG" alt="Pathly" className="auth-logo-icon" />
          <img src="/title_black.PNG" alt="Pathly" className="auth-logo-title" />
        </div>
        
        <h1>おかえりなさい</h1>
        <p className="auth-subtitle">アカウントにサインインして学習を続けましょう</p>
        
        <GoogleSignInButton
          onSuccess={onGoogleSuccess}
          onError={(err) => console.error('Google Sign-In error:', err)}
        />
        
        <GitHubSignInButton />
        
        <div className="auth-divider">
          <span>または</span>
        </div>

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
              placeholder="パスワード"
            />
          </div>
          {error && <div className="auth-error">{error}</div>}
          <button type="submit" className="btn-auth-primary" disabled={loading}>
            {loading ? 'サインイン中...' : 'サインイン'}
          </button>
        </form>
        
        <div className="auth-footer-modern">
          アカウントをお持ちでないですか？{' '}
          <Link to="/auth/signup">アカウント作成</Link>
        </div>
      </div>
    </div>
  );
};
