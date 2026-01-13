/**
 * Profile View
 * ユーザープロフィール画面
 */
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfileViewModel } from '@/viewmodels/profile/useProfileViewModel';
import { useAuthViewModel } from '@/viewmodels/auth/useAuthViewModel';
import { useTheme } from '@/contexts/ThemeContext';
import { isGitHubConnected, getGitHubUser, clearGitHubConnection } from '@/utils/storage/githubStorage';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID || 'Ov23li1eg2wFShx5hmTd';

const getDeadlineClass = (daysRemaining: number | null): string => {
  if (daysRemaining === null) return '';
  if (daysRemaining < 0) return 'deadline-overdue';
  if (daysRemaining <= 3) return 'deadline-urgent';
  if (daysRemaining <= 7) return 'deadline-soon';
  return 'deadline-normal';
};

const formatDeadline = (deadline: string) => {
  const date = new Date(deadline);
  return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
};

interface SettingsModalProps {
  user: {
    username: string;
    profileImageUrl?: string;
  };
  updating: boolean;
  updateError: string | null;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onUpdateUsername: (username: string) => Promise<boolean>;
  onUploadImage: (file: File) => Promise<boolean>;
  onDeleteImage: () => Promise<boolean>;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  user,
  updating,
  updateError,
  theme,
  onToggleTheme,
  onUpdateUsername,
  onUploadImage,
  onDeleteImage,
  onClose,
}) => {
  const [username, setUsername] = useState(user.username);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    const success = await onUpdateUsername(username);
    if (success) {
      setSuccessMessage('ユーザー名を更新しました');
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSuccessMessage(null);
      const success = await onUploadImage(file);
      if (success) {
        setSuccessMessage('プロフィール画像を更新しました');
      }
    }
  };

  const handleDeleteImage = async () => {
    setSuccessMessage(null);
    const success = await onDeleteImage();
    if (success) {
      setSuccessMessage('プロフィール画像を削除しました');
    }
  };

  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=007bff&color=fff&size=128`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content settings-modal" onClick={(e) => e.stopPropagation()}>
        <h3>プロフィール設定</h3>

        {successMessage && <div className="success-message">{successMessage}</div>}
        {updateError && <div className="error-message">{updateError}</div>}

        <div className="settings-section">
          <h4>プロフィール画像</h4>
          <div className="settings-image-section">
            <div className="settings-avatar">
              <img
                src={user.profileImageUrl || defaultAvatar}
                alt={user.username}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = defaultAvatar;
                }}
              />
            </div>
            <div className="settings-image-actions">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/jpeg,image/png,image/gif,image/webp"
                style={{ display: 'none' }}
              />
              <button
                className="btn-primary"
                onClick={() => fileInputRef.current?.click()}
                disabled={updating}
              >
                画像を変更
              </button>
              {user.profileImageUrl && (
                <button
                  className="btn-danger"
                  onClick={handleDeleteImage}
                  disabled={updating}
                >
                  画像を削除
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h4>ユーザー名</h4>
          <form onSubmit={handleUsernameSubmit} className="settings-form">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={50}
              required
            />
            <button type="submit" className="btn-primary" disabled={updating || username === user.username}>
              {updating ? '更新中...' : '更新'}
            </button>
          </form>
          <p className="settings-hint">1〜50文字で入力してください（日本語OK）</p>
        </div>

        <div className="settings-section">
          <h4>テーマ設定</h4>
          <div className="theme-toggle-setting">
            <span className="theme-label">ダークモード</span>
            <button 
              className={`theme-switch ${theme === 'dark' ? 'active' : ''}`}
              onClick={onToggleTheme}
              type="button"
            >
              <span className="theme-switch-slider" />
            </button>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};

export const ProfileView: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const {
    user,
    inProgressSubjects,
    completedSubjects,
    totalSubjects,
    loading,
    updating,
    deleting,
    error,
    updateError,
    handleUpdateUsername,
    handleUploadImage,
    handleDeleteImage,
    handleDeleteAccount,
  } = useProfileViewModel();
  const { handleSignout } = useAuthViewModel();
  const [showSettings, setShowSettings] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [githubConnected, setGithubConnected] = useState(isGitHubConnected());
  const githubUser = getGitHubUser();

  const handleGitHubConnect = () => {
    const redirectUri = `${window.location.origin}/github/connect/callback`;
    const scope = 'repo user:email';
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;
    window.location.href = githubAuthUrl;
  };

  const handleGitHubDisconnect = () => {
    clearGitHubConnection();
    setGithubConnected(false);
  };

  const onDeleteAccount = async () => {
    const success = await handleDeleteAccount();
    if (success) {
      navigate('/');
    }
  };

  if (loading) {
    return <LoadingSpinner message="プロフィールを読み込んでいます..." />;
  }

  if (error) {
    return <div className="error-container">エラー: {error}</div>;
  }

  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'User')}&background=667eea&color=fff&size=128`;

  return (
    <div className="profile-page">
      <div className="profile-hero">
        <div className="profile-hero-bg" />

        <div className="profile-hero-content">
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar-ring">
              <svg viewBox="0 0 36 36" className="avatar-progress-ring">
                <path
                  className="ring-bg"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="ring-progress"
                  strokeDasharray={`${totalSubjects > 0 ? Math.round((completedSubjects.length / totalSubjects) * 100) : 0}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
            </div>
            <div className="profile-avatar-large">
              <img
                src={user?.profileImageUrl || defaultAvatar}
                alt={user?.username || 'User'}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = defaultAvatar;
                }}
              />
            </div>
          </div>
          <h1 className="profile-name-large">{user?.username || '名前未設定'}</h1>
          <p className="profile-email-light">{user?.email}</p>
          <button
            className="btn-settings-outline"
            onClick={() => setShowSettings(true)}
          >
            ⚙️ プロフィールを編集
          </button>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-stats-grid">
          <div className="stat-card-fancy">
            <div className="stat-icon">🔥</div>
            <div className="stat-info">
              <span className="stat-number-large">{inProgressSubjects.length}</span>
              <span className="stat-label-small">学習中</span>
            </div>
          </div>
          <div className="stat-card-fancy completed">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <span className="stat-number-large">{completedSubjects.length}</span>
              <span className="stat-label-small">完了</span>
            </div>
          </div>
          <div className="stat-card-fancy progress">
            <div className="stat-icon">📚</div>
            <div className="stat-info">
              <span className="stat-number-large">{totalSubjects}</span>
              <span className="stat-label-small">総題材</span>
            </div>
          </div>
        </div>

        {inProgressSubjects.length > 0 && (
          <section className="profile-section-fancy">
            <div className="section-header">
              <h2>🔥 学習中の題材</h2>
              <span className="section-count">{inProgressSubjects.length}件</span>
            </div>
            <div className="profile-subject-grid">
              {inProgressSubjects.map((subject) => (
                <div
                  key={subject.subjectId}
                  className="profile-subject-card"
                  onClick={() => navigate(`/subjects/${subject.subjectId}/sections`)}
                >
                  <div className="subject-card-top">
                    <span className="subject-title-card">{subject.title}</span>
                    <div className="circular-progress-small">
                      <svg viewBox="0 0 36 36">
                        <path
                          className="circle-bg-small"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="circle-progress-small"
                          strokeDasharray={`${subject.progressPercentage}, 100`}
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <span className="progress-text-small">{subject.progressPercentage}%</span>
                    </div>
                  </div>
                  {subject.deadline && (
                    <div className={`deadline-tag ${getDeadlineClass(subject.daysRemaining)}`}>
                      {subject.daysRemaining !== null && subject.daysRemaining < 0
                        ? `⚠️ ${Math.abs(subject.daysRemaining)}日超過`
                        : subject.daysRemaining === 0
                        ? '🔥 今日まで'
                        : `📅 ${formatDeadline(subject.deadline)}（残り${subject.daysRemaining}日）`}
                    </div>
                  )}
                  <div className="subject-card-bar">
                    <div
                      className="subject-card-bar-fill"
                      style={{ width: `${subject.progressPercentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {completedSubjects.length > 0 && (
          <section className="profile-section-fancy">
            <div className="section-header">
              <h2>✅ 完了した題材</h2>
              <span className="section-count">{completedSubjects.length}件</span>
            </div>
            <div className="profile-subject-grid">
              {completedSubjects.map((subject) => (
                <div
                  key={subject.subjectId}
                  className="profile-subject-card completed"
                  onClick={() => navigate(`/subjects/${subject.subjectId}/sections`)}
                >
                  <div className="subject-card-top">
                    <span className="subject-title-card">{subject.title}</span>
                    <span className="complete-check">✓</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {inProgressSubjects.length === 0 && completedSubjects.length === 0 && (
          <div className="profile-empty">
            <span className="empty-icon">📚</span>
            <p>まだ学習を始めていません</p>
            <button className="btn-primary" onClick={() => navigate('/subjects')}>
              題材を見る
            </button>
          </div>
        )}

        {/* GitHub連携セクション */}
        <section className="profile-section-fancy github-section">
          <div className="section-header">
            <h2>🐙 GitHub連携</h2>
          </div>
          <div className="github-connect-card">
            {githubConnected && githubUser ? (
              <div className="github-connected">
                <div className="github-user-info">
                  <img src={githubUser.avatar_url} alt={githubUser.login} className="github-avatar" />
                  <div>
                    <p className="github-username">@{githubUser.login}</p>
                    <p className="github-status">✓ 連携済み</p>
                  </div>
                </div>
                <p className="github-description">
                  学習で作成したプロジェクトをGitHubリポジトリとして保存できます。
                </p>
                <button className="btn-github-disconnect" onClick={handleGitHubDisconnect}>
                  連携を解除
                </button>
              </div>
            ) : (
              <div className="github-not-connected">
                <p className="github-description">
                  GitHubアカウントを連携すると、学習で作成したプロジェクトを<br />
                  ワンクリックでGitHubリポジトリとして保存できます。
                </p>
                <button className="btn-github-connect" onClick={handleGitHubConnect}>
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  GitHubと連携する
                </button>
              </div>
            )}
          </div>
        </section>

        <div className="profile-bottom-actions">
          <button onClick={() => navigate('/subjects')} className="btn-back-bottom">
            ← 題材一覧へ戻る
          </button>
          <button onClick={handleSignout} className="btn-signout-bottom">
            サインアウト
          </button>
        </div>

        {/* アカウント削除セクション */}
        <section className="profile-section-fancy danger-section">
          <div className="section-header">
            <h2>⚠️ アカウント削除</h2>
          </div>
          <div className="danger-zone-card">
            <p className="danger-description">
              アカウントを削除すると、すべての学習データ・進捗が完全に削除されます。<br />
              この操作は取り消せません。
            </p>
            <button 
              className="btn-danger-outline" 
              onClick={() => setShowDeleteConfirm(true)}
            >
              アカウントを削除する
            </button>
          </div>
        </section>
      </div>

      {/* アカウント削除確認モーダル */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>⚠️ アカウント削除の確認</h3>
            <p>本当にアカウントを削除しますか？</p>
            <p className="delete-warning">
              この操作は取り消せません。すべてのデータが完全に削除されます。
            </p>
            {updateError && <div className="error-message">{updateError}</div>}
            <div className="modal-actions">
              <button 
                className="btn-secondary" 
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
              >
                キャンセル
              </button>
              <button 
                className="btn-danger" 
                onClick={onDeleteAccount}
                disabled={deleting}
              >
                {deleting ? '削除中...' : '削除する'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSettings && user && (
        <SettingsModal
          user={user}
          updating={updating}
          updateError={updateError}
          theme={theme}
          onToggleTheme={toggleTheme}
          onUpdateUsername={handleUpdateUsername}
          onUploadImage={handleUploadImage}
          onDeleteImage={handleDeleteImage}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
};
