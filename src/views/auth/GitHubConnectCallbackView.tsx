/**
 * GitHub Connect Callback View
 * GitHub連携（リポジトリ作成用）のコールバック処理
 */
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { saveGitHubToken, saveGitHubUser } from '@/utils/storage/githubStorage';
import { LoadingSpinner } from '@/components/common/LoadingSpinner/LoadingSpinner';

export const GitHubConnectCallbackView: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError('GitHub連携がキャンセルされました');
      return;
    }

    if (code) {
      exchangeToken(code);
    } else {
      setError('認証コードが見つかりません');
    }
  }, [searchParams]);

  const exchangeToken = async (code: string) => {
    try {
      const response = await fetch('/api/github/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (response.ok && data.access_token) {
        // トークンとユーザー情報を保存
        saveGitHubToken(data.access_token);
        saveGitHubUser(data.user);

        // プロフィールページへ戻る
        navigate('/profile', { replace: true });
      } else {
        setError(data.error || 'GitHub連携に失敗しました');
      }
    } catch (err) {
      console.error('GitHub連携エラー:', err);
      setError('連携リクエストに失敗しました');
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
          <h1>連携エラー</h1>
          <div className="auth-error">{error}</div>
          <button
            className="btn-auth-primary"
            onClick={() => navigate('/profile')}
            style={{ marginTop: '1rem' }}
          >
            プロフィールへ戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <LoadingSpinner message="GitHubアカウントを連携しています..." />
  );
};
