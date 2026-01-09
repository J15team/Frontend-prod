/**
 * Subjects View
 * 題材一覧ページのView
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubjectsViewModel } from '@/viewmodels/useSubjectsViewModel';
import { useAuthViewModel } from '@/viewmodels/useAuthViewModel';
import { type Subject } from '@/models/Subject';

const StarRating: React.FC<{ weight: number }> = ({ weight }) => {
  const stars = [];
  const safeWeight = weight || 0;
  for (let i = 0; i < 5; i++) {
    stars.push(
      <span key={i} style={{ color: i < safeWeight ? '#ffc107' : '#e0e0e0', fontSize: '1.2rem' }}>
        ★
      </span>
    );
  }
  return <span className="star-rating">{stars}</span>;
};

interface DeadlineModalProps {
  subject: Subject;
  currentDeadline: string | null;
  onSave: (deadline: string) => void;
  onClear: () => void;
  onClose: () => void;
  googleCalendarUrl: string | null;
}

const DeadlineModal: React.FC<DeadlineModalProps> = ({
  subject,
  currentDeadline,
  onSave,
  onClear,
  onClose,
  googleCalendarUrl,
}) => {
  const [deadline, setDeadline] = useState(currentDeadline || '');

  const handleSave = () => {
    if (deadline) {
      onSave(deadline);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>目標期限を設定</h3>
        <p className="modal-subject-title">{subject.title}</p>
        <div className="modal-form">
          <label>
            完了目標日
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </label>
        </div>
        <div className="modal-actions">
          <button className="btn-primary" onClick={handleSave} disabled={!deadline}>
            保存
          </button>
          {currentDeadline && (
            <button className="btn-secondary" onClick={onClear}>
              期限を削除
            </button>
          )}
          <button className="btn-back" onClick={onClose}>
            キャンセル
          </button>
        </div>
        {googleCalendarUrl && (
          <a
            href={googleCalendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="google-calendar-link"
          >
            📅 Googleカレンダーに追加
          </a>
        )}
      </div>
    </div>
  );
};

export const SubjectsView: React.FC = () => {
  const navigate = useNavigate();
  const {
    subjects,
    progress,
    deadlines,
    loading,
    error,
    setDeadline,
    clearDeadline,
    getGoogleCalendarUrl,
    getDaysRemaining,
  } = useSubjectsViewModel();
  const { handleSignout } = useAuthViewModel();
  const [modalSubject, setModalSubject] = useState<Subject | null>(null);

  const onSubjectClick = (subject: Subject) => {
    navigate(`/subjects/${subject.subjectId}/sections`);
  };

  const handleDeadlineClick = (e: React.MouseEvent, subject: Subject) => {
    e.stopPropagation();
    setModalSubject(subject);
  };

  const handleSaveDeadline = (deadline: string) => {
    if (modalSubject) {
      setDeadline(modalSubject.subjectId, deadline);
      setModalSubject(null);
    }
  };

  const handleClearDeadline = () => {
    if (modalSubject) {
      clearDeadline(modalSubject.subjectId);
      setModalSubject(null);
    }
  };

  const formatDate = (value?: string) => {
    if (!value) return '-';
    const date = new Date(value);
    return date.toLocaleDateString();
  };

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);
    return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
  };

  const getDeadlineClass = (daysRemaining: number | null): string => {
    if (daysRemaining === null) return '';
    if (daysRemaining < 0) return 'deadline-overdue';
    if (daysRemaining <= 3) return 'deadline-urgent';
    if (daysRemaining <= 7) return 'deadline-soon';
    return 'deadline-normal';
  };

  if (loading) {
    return <div className="loading-container">読み込み中...</div>;
  }

  if (error) {
    return <div className="error-container">エラー: {error}</div>;
  }

  // 重み昇順（星1が上、星5が下）、同じ重みならsubjectId昇順
  const sortedSubjects = [...subjects].sort((a, b) => {
    const weightDiff = (a.weight || 0) - (b.weight || 0);
    if (weightDiff !== 0) return weightDiff;
    return a.subjectId - b.subjectId;
  });

  return (
    <div className="subjects-container">
      <header className="subjects-header">
        <h1>題材一覧</h1>
        <div className="header-actions">
          <button onClick={() => navigate('/profile')} className="btn-profile">
            プロフィール
          </button>
          <button onClick={handleSignout} className="btn-secondary">
            サインアウト
          </button>
        </div>
      </header>
      <div className="subjects-grid">
        {sortedSubjects.map((subject) => {
          const progressPercent = progress[subject.subjectId] || 0;
          const deadline = deadlines[subject.subjectId];
          const daysRemaining = getDaysRemaining(subject.subjectId);

          return (
            <div
              key={subject.subjectId}
              className="subject-card"
              onClick={() => onSubjectClick(subject)}
            >
              <div className="subject-card-header">
                <div className="subject-weight">
                  <StarRating weight={subject.weight || 0} />
                </div>
                <button
                  className={`deadline-btn ${deadline ? 'has-deadline' : ''}`}
                  onClick={(e) => handleDeadlineClick(e, subject)}
                  title="目標期限を設定"
                >
                  📅
                </button>
              </div>
              <h2>{subject.title}</h2>
              <p>{subject.description}</p>
              {deadline && (
                <div className={`deadline-badge ${getDeadlineClass(daysRemaining)}`}>
                  {daysRemaining !== null && daysRemaining < 0
                    ? `⚠️ ${Math.abs(daysRemaining)}日超過`
                    : daysRemaining === 0
                    ? '🔥 今日まで'
                    : `📅 ${formatDeadline(deadline)}まで（残り${daysRemaining}日）`}
                </div>
              )}
              <div className="subject-progress">
                <div className="progress-container">
                  <div
                    className="progress-bar"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="progress-percentage">{progressPercent}%</span>
              </div>
              <div className="subject-footer">
                <span className="section-count">
                  {subject.maxSections} セクション
                </span>
                <span className="created-at">作成日: {formatDate(subject.createdAt)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {modalSubject && (
        <DeadlineModal
          subject={modalSubject}
          currentDeadline={deadlines[modalSubject.subjectId] || null}
          onSave={handleSaveDeadline}
          onClear={handleClearDeadline}
          onClose={() => setModalSubject(null)}
          googleCalendarUrl={getGoogleCalendarUrl(modalSubject)}
        />
      )}
    </div>
  );
};
