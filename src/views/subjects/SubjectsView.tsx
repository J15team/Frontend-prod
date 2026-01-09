/**
 * Subjects View
 * 題材一覧ページのView
 */
import React from 'react';
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

export const SubjectsView: React.FC = () => {
  const navigate = useNavigate();
  const { subjects, progress, loading, error } = useSubjectsViewModel();
  const { handleSignout } = useAuthViewModel();

  const onSubjectClick = (subject: Subject) => {
    navigate(`/subjects/${subject.subjectId}/sections`);
  };

  const formatDate = (value?: string) => {
    if (!value) return '-';
    const date = new Date(value);
    return date.toLocaleDateString();
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
        <button onClick={handleSignout} className="btn-secondary">
          サインアウト
        </button>
      </header>
      <div className="subjects-grid">
        {sortedSubjects.map((subject) => {
          const progressPercent = progress[subject.subjectId] || 0;
          return (
            <div
              key={subject.subjectId}
              className="subject-card"
              onClick={() => onSubjectClick(subject)}
            >
              <div className="subject-weight">
                <StarRating weight={subject.weight || 0} />
              </div>
              <h2>{subject.title}</h2>
              <p>{subject.description}</p>
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
    </div>
  );
};
