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
    totalSubjects,
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

        <div className="profile-bottom-actions">
          <button onClick={() => navigate('/subjects')} className="btn-back-bottom">
            ← 題材一覧へ戻る
          </button>
          <button onClick={handleSignout} className="btn-signout-bottom">
            サインアウト
          </button>
        </div>
      </div>

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
