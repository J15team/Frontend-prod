/**
 * Profile View
 * ユーザープロフィール画面
 */
import React from 'react';
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

export const ProfileView: React.FC = () => {
  const navigate = useNavigate();
  const { user, inProgressSubjects, completedSubjects, loading, error } = useProfileViewModel();
  const { handleSignout } = useAuthViewModel();

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
    </div>
  );
};
