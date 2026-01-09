/**
 * Profile View
 * ユーザープロフィール画面
 */
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfileViewModel } from '@/viewmodels/useProfileViewModel';
import { useAuthViewModel } from '@/viewmodels/useAuthViewModel';

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
  onUpdateUsername: (username: string) => Promise<boolean>;
  onUploadImage: (file: File) => Promise<boolean>;
  onDeleteImage: () => Promise<boolean>;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  user,
  updating,
  updateError,
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
              maxLength={20}
              required
            />
            <button type="submit" className="btn-primary" disabled={updating || username === user.username}>
              {updating ? '更新中...' : '更新'}
            </button>
          </form>
          <p className="settings-hint">1〜20文字で入力してください</p>
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
  const {
    user,
    inProgressSubjects,
    completedSubjects,
    loading,
    updating,
    error,
    updateError,
    handleUpdateUsername,
    handleUploadImage,
    handleDeleteImage,
  } = useProfileViewModel();
  const { handleSignout } = useAuthViewModel();
  const [showSettings, setShowSettings] = useState(false);

  if (loading) {
    return <div className="loading-container">読み込み中...</div>;
  }

  if (error) {
    return <div className="error-container">エラー: {error}</div>;
  }

  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'User')}&background=007bff&color=fff&size=128`;

  return (
    <div className="profile-container">
      <header className="profile-header">
        <button onClick={() => navigate('/subjects')} className="btn-back">
          ← 題材一覧へ
        </button>
        <button onClick={handleSignout} className="btn-secondary">
          サインアウト
        </button>
      </header>

      <div className="profile-card">
        <div className="profile-avatar">
          <img
            src={user?.profileImageUrl || defaultAvatar}
            alt={user?.username || 'User'}
            onError={(e) => {
              (e.target as HTMLImageElement).src = defaultAvatar;
            }}
          />
        </div>
        <h1 className="profile-name">{user?.username || '名前未設定'}</h1>
        <p className="profile-email">{user?.email}</p>
        <button
          className="btn-settings"
          onClick={() => setShowSettings(true)}
        >
          ⚙️ 設定
        </button>
      </div>

      <div className="profile-stats">
        <div className="stat-card">
          <span className="stat-number">{inProgressSubjects.length}</span>
          <span className="stat-label">学習中</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{completedSubjects.length}</span>
          <span className="stat-label">完了</span>
        </div>
      </div>

      {inProgressSubjects.length > 0 && (
        <section className="profile-section">
          <h2>学習中の題材</h2>
          <div className="profile-subject-list">
            {inProgressSubjects.map((subject) => (
              <div
                key={subject.subjectId}
                className="profile-subject-item"
                onClick={() => navigate(`/subjects/${subject.subjectId}/sections`)}
              >
                <div className="subject-info">
                  <span className="subject-title">{subject.title}</span>
                  <span className="subject-progress-text">{subject.progressPercentage}%</span>
                </div>
                {subject.deadline && (
                  <div className={`deadline-badge-small ${getDeadlineClass(subject.daysRemaining)}`}>
                    {subject.daysRemaining !== null && subject.daysRemaining < 0
                      ? `⚠️ ${Math.abs(subject.daysRemaining)}日超過`
                      : subject.daysRemaining === 0
                      ? '🔥 今日まで'
                      : `📅 ${formatDeadline(subject.deadline)}（残り${subject.daysRemaining}日）`}
                  </div>
                )}
                <div className="progress-container">
                  <div
                    className="progress-bar"
                    style={{ width: `${subject.progressPercentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {completedSubjects.length > 0 && (
        <section className="profile-section">
          <h2>完了した題材</h2>
          <div className="profile-subject-list">
            {completedSubjects.map((subject) => (
              <div
                key={subject.subjectId}
                className="profile-subject-item completed"
                onClick={() => navigate(`/subjects/${subject.subjectId}/sections`)}
              >
                <div className="subject-info">
                  <span className="subject-title">{subject.title}</span>
                  <span className="complete-badge">✓ 完了</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {showSettings && user && (
        <SettingsModal
          user={user}
          updating={updating}
          updateError={updateError}
          onUpdateUsername={handleUpdateUsername}
          onUploadImage={handleUploadImage}
          onDeleteImage={handleDeleteImage}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
};
