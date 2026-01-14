/**
 * GitHub OAuth Callback View
 * GitHubからのコールバックを処理
 */
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { saveTokens, saveUser } from '@/utils/storage/tokenStorage';
import { LoadingSpinner } from '@/components/common/LoadingSpinner/LoadingSpinner';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://zu9mkxoir4.execute-api.ap-northeast-1.amazonaws.com';

export const GitHubCallbackView: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError('GitHub認証がキャンセルされました');
      return;
    }

    if (code) {
      authenticateWithGitHub(code);
    } else {
      setError('認証コードが見つかりません');
    }
  }, [searchParams]);

  const authenticateWithGitHub = async (code: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/github`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (response.ok) {
        // トークンとユーザー情報を保存
        saveTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
        saveUser(data.user);

        // 題材ページへリダイレクト
        navigate('/subjects', { replace: true });
      } else {
        setError(data.message || 'GitHub認証に失敗しました');
      }
    } catch (err) {
      console.error('GitHub認証エラー:', err);
      setError('認証リクエストに失敗しました');
    }
  };

  if (error) {
    return (
      <div className="auth-page">
        <div className="auth-page-bg" />
        <div className="auth-card-modern">
          <div className="auth-logo">
            <img src="/icon.PNG" alt="Pathly" className="auth-logo-icon" />
            <img src="/title_black.PNG" alt="Pathly" className="auth-logo-title" />
          </div>
          <h1>認証エラー</h1>
          <div className="auth-error">{error}</div>
          <button
            className="btn-auth-primary"
            onClick={() => navigate('/auth/signin')}
            style={{ marginTop: '1rem' }}
          >
            ログインページへ戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <LoadingSpinner message="GitHubアカウントを確認しています..." />
  );
};
