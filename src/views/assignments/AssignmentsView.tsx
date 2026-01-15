/**
 * Assignments View
 * 課題題材一覧ページ（Beta）
 */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssignmentsViewModel, type AssignmentSubjectWithProgress } from '@/viewmodels/assignments/useAssignmentsViewModel';
import { useAuthViewModel } from '@/viewmodels/auth/useAuthViewModel';
import { LoadingSpinner } from '@/components/common/LoadingSpinner/LoadingSpinner';
import '@/styles/assignments/assignments.css';

// スクロールアニメーション用フック
const useScrollAnimation = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
};

// アニメーション付きカードラッパー
const AnimatedCard: React.FC<{ children: React.ReactNode; delay?: number }> = ({ 
  children, 
  delay = 0 
}) => {
  const { ref, isVisible } = useScrollAnimation();
  
  return (
    <div
      ref={ref}
      className={`animated-card ${isVisible ? 'visible' : ''}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const StarRating: React.FC<{ weight: number }> = ({ weight }) => {
  const stars = [];
  const safeWeight = weight || 1;
  for (let i = 0; i < 5; i++) {
    stars.push(
      <span key={i} style={{ color: i < safeWeight ? '#f59e0b' : '#e0e0e0', fontSize: '1.2rem' }}>
        ★
      </span>
    );
  }
  return <span className="star-rating">{stars}</span>;
};

export const AssignmentsView: React.FC = () => {
  const navigate = useNavigate();
  const { subjects, loading, error } = useAssignmentsViewModel();
  const { handleSignout } = useAuthViewModel();
  
  // フィルター・ソート用の状態
  const [selectedWeight, setSelectedWeight] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'sections' | 'weight'>('sections');

  const onSubjectClick = (subject: AssignmentSubjectWithProgress) => {
    navigate(`/assignments/${subject.assignmentSubjectId}/sections`);
  };

  const formatDate = (value?: string) => {
    if (!value) return '-';
    const date = new Date(value);
    return date.toLocaleDateString();
  };

  if (loading) {
    return <LoadingSpinner message="課題を読み込んでいます..." />;
  }

  if (error) {
    return <div className="error-container">エラー: {error}</div>;
  }

  // 重みでカテゴリ分け
  const categoryLabels: Record<number, { label: string; emoji: string }> = {
    1: { label: '入門', emoji: '🌱' },
    2: { label: '基礎', emoji: '📖' },
    3: { label: '中級', emoji: '🚀' },
    4: { label: '応用', emoji: '💡' },
    5: { label: '発展', emoji: '🏆' },
  };

  // 重みフィルタリング
  const filteredSubjects = selectedWeight
    ? subjects.filter(s => (s.weight || 1) === selectedWeight)
    : subjects;

  // ソート
  const sortedSubjects = [...filteredSubjects].sort((a, b) => {
    switch (sortBy) {
      case 'weight':
        return (a.weight || 1) - (b.weight || 1);
      case 'sections':
      default:
        return (a.maxSections || 0) - (b.maxSections || 0);
    }
  });

  // 重みでグループ化
  const groupedSubjects = sortedSubjects.reduce((acc, subject) => {
    const weight = subject.weight || 1;
    if (!acc[weight]) acc[weight] = [];
    acc[weight].push(subject);
    return acc;
  }, {} as Record<number, AssignmentSubjectWithProgress[]>);

  const sortedWeights = Object.keys(groupedSubjects)
    .map(Number)
    .sort((a, b) => a - b);

  const handleStarClick = (weight: number) => {
    setSelectedWeight(selectedWeight === weight ? null : weight);
  };

  return (
    <div className="assignments-page-wrapper">
      <header className="assignments-header">
        <div className="header-left">
          <h1>
            課題題材
            <span className="beta-badge">Beta</span>
          </h1>
        </div>
        <div className="header-actions">
          <button onClick={() => navigate('/subjects')} className="btn-secondary">
            📚 題材一覧
          </button>
          <button onClick={() => navigate('/profile')} className="btn-profile">
            プロフィール
          </button>
          <button onClick={handleSignout} className="btn-secondary">
            サインアウト
          </button>
        </div>
      </header>

      <main className="assignments-container">
        {/* Beta版の説明 */}
        <div className="beta-notice">
          <div className="beta-notice-icon">🧪</div>
          <div className="beta-notice-content">
            <h3>Beta版について</h3>
            <p>
              課題題材は現在Beta版として提供しています。
              コードを提出してジャッジサーバーで自動採点を受けることができます。
              開発中のため、予期しない動作が発生する可能性があります。
            </p>
          </div>
        </div>

        {/* フィルター・ソートバー */}
        <div className="filter-bar">
          <div className="filter-section">
            <span className="filter-label">難易度で絞り込み:</span>
            <div className="star-filter">
              {[1, 2, 3, 4, 5].map((weight) => (
                <button
                  key={weight}
                  className={`star-filter-btn ${selectedWeight === weight ? 'active' : ''}`}
                  onClick={() => handleStarClick(weight)}
                  title={categoryLabels[weight]?.label}
                >
                  {'★'.repeat(weight)}{'☆'.repeat(5 - weight)}
                </button>
              ))}
              {selectedWeight && (
                <button className="clear-filter-btn" onClick={() => setSelectedWeight(null)}>
                  ✕ クリア
                </button>
              )}
            </div>
          </div>

          <div className="sort-section">
            <span className="filter-label">並び替え:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'sections' | 'weight')}
              className="sort-select"
            >
              <option value="sections">セクション数順</option>
              <option value="weight">難易度順</option>
            </select>
          </div>
          <div className="filter-result">
            {filteredSubjects.length} 件表示中
          </div>
        </div>

        {sortedWeights.length === 0 ? (
          <div className="empty-state">
            <p>📭 課題題材がまだありません</p>
          </div>
        ) : (
          sortedWeights.map((weight) => {
            const category = categoryLabels[weight] || { label: `レベル${weight}`, emoji: '📚' };
            const categorySubjects = groupedSubjects[weight];

            return (
              <div key={weight} className="assignment-category">
                <div className="category-header">
                  <span className="category-emoji">{category.emoji}</span>
                  <h2 className="category-title">{category.label}</h2>
                  <span className="category-count">{categorySubjects.length}件</span>
                  <div className="category-stars">
                    <StarRating weight={weight} />
                  </div>
                </div>
                <div className="assignments-grid">
                  {categorySubjects.map((subject, index) => (
                    <AnimatedCard key={subject.assignmentSubjectId} delay={index * 50}>
                      <div
                        className={`assignment-card ${subject.progress?.isSubjectCleared ? 'cleared' : ''}`}
                        onClick={() => onSubjectClick(subject)}
                      >
                        <div className="assignment-card-header">
                          <div className="assignment-weight">
                            <StarRating weight={subject.weight || 1} />
                          </div>
                          {subject.progress?.isSubjectCleared ? (
                            <span className="assignment-badge cleared">✓ クリア</span>
                          ) : (
                            <span className="assignment-badge">課題</span>
                          )}
                        </div>
                        <div className="assignment-card-body">
                          <h2>{subject.title}</h2>
                          <p>{subject.description}</p>
                        </div>
                        {/* 進捗表示 */}
                        {subject.progress && (
                          <div className="assignment-progress">
                            <div className="progress-header">
                              <span className="progress-label">進捗</span>
                              <span className="progress-text">
                                {subject.progress.clearedSections} / {subject.progress.totalSections} クリア
                              </span>
                            </div>
                            <div className="progress-bar-container">
                              <div 
                                className="progress-bar-fill"
                                style={{ width: `${subject.progress.progressPercent}%` }}
                              />
                            </div>
                            <span className="progress-percent">{subject.progress.progressPercent}%</span>
                          </div>
                        )}
                        <div className="assignment-footer">
                          <span className="section-count">
                            {subject.maxSections} セクション
                          </span>
                          <span className="created-at">{formatDate(subject.createdAt)}</span>
                        </div>
                      </div>
                    </AnimatedCard>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </main>

      <footer className="assignments-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="footer-logo">
              <img src="/icon.PNG" alt="Pathly" className="footer-logo-icon" />
              <img src="/title_white.PNG" alt="Pathly" className="footer-logo-title" />
            </span>
            <p className="footer-tagline">学習の道筋を、あなたと共に</p>
          </div>
          <div className="footer-copyright">
            © 2026 Pathly. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
