/**
 * Subjects View
 * 題材一覧ページのView
 */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSubjectsViewModel } from '@/viewmodels/subjects/useSubjectsViewModel';
import { useAuthViewModel } from '@/viewmodels/auth/useAuthViewModel';
import { recordSubjectView, recordTagView } from '@/services/ranking/RankingService';
import { type Subject } from '@/models/Subject';
import { LoadingSpinner } from '@/components/common/LoadingSpinner/LoadingSpinner';
import { Tutorial, shouldShowTutorial } from '@/components/features/Tutorial/Tutorial';

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

interface ProgressSidebarProps {
  subjects: Subject[];
  progress: Record<number, number>;
  deadlines: Record<number, string>;
  getDaysRemaining: (subjectId: number) => number | null;
  onClose: () => void;
  onSubjectClick: (subject: Subject) => void;
  allTags: { id: number; name: string }[];
}

const ProgressSidebar: React.FC<ProgressSidebarProps> = ({
  subjects,
  progress,
  deadlines,
  getDaysRemaining,
  onClose,
  onSubjectClick,
  allTags,
}) => {
  const [showAllNotStarted, setShowAllNotStarted] = useState(false);
  // サイドバー専用のフィルター状態
  const [sidebarSelectedTags, setSidebarSelectedTags] = useState<string[]>([]);
  const [sidebarSelectedWeight, setSidebarSelectedWeight] = useState<number | null>(null);

  // フィルタリング適用
  const filteredSubjects = subjects.filter((s) => {
    // 難易度フィルター
    if (sidebarSelectedWeight !== null && (s.weight || 1) !== sidebarSelectedWeight) {
      return false;
    }
    return true;
  });

  // 進捗でカテゴリ分け
  const inProgress = filteredSubjects.filter((s) => {
    const p = progress[s.subjectId] || 0;
    return p > 0 && p < 100;
  });
  const completed = filteredSubjects.filter((s) => (progress[s.subjectId] || 0) === 100);
  const notStarted = filteredSubjects.filter((s) => (progress[s.subjectId] || 0) === 0);

  // 全体の進捗計算（フィルター適用後）
  const totalProgress = filteredSubjects.length > 0
    ? Math.round(filteredSubjects.reduce((sum, s) => sum + (progress[s.subjectId] || 0), 0) / filteredSubjects.length)
    : 0;

  const getDeadlineClass = (daysRemaining: number | null): string => {
    if (daysRemaining === null) return '';
    if (daysRemaining < 0) return 'deadline-overdue';
    if (daysRemaining <= 3) return 'deadline-urgent';
    return '';
  };

  const displayedNotStarted = showAllNotStarted ? notStarted : notStarted.slice(0, 5);
  const hiddenCount = notStarted.length - 5;

  return (
    <>
      <div className="sidebar-overlay" onClick={onClose} />
      <div className="progress-sidebar">
        <div className="sidebar-header">
          <h2>学習進捗</h2>
          <button className="sidebar-close" onClick={onClose}>×</button>
        </div>

        <div className="sidebar-summary">
          <div className="summary-circle">
            <svg viewBox="0 0 36 36" className="circular-chart">
              <path
                className="circle-bg"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="circle-progress"
                strokeDasharray={`${totalProgress}, 100`}
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <text x="18" y="20.35" className="percentage">{totalProgress}%</text>
            </svg>
          </div>
          <div className="summary-stats">
            <div className="stat-item">
              <span className="stat-value">{completed.length}</span>
              <span className="stat-label">完了</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{inProgress.length}</span>
              <span className="stat-label">進行中</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{notStarted.length}</span>
              <span className="stat-label">未着手</span>
            </div>
          </div>
        </div>

        <div className="sidebar-content">
          {inProgress.length > 0 && (
            <div className="sidebar-section">
              <h3>🔥 進行中</h3>
              {inProgress.map((subject) => {
                const p = progress[subject.subjectId] || 0;
                const deadline = deadlines[subject.subjectId];
                const daysRemaining = getDaysRemaining(subject.subjectId);
                return (
                  <div
                    key={subject.subjectId}
                    className="sidebar-item"
                    onClick={() => onSubjectClick(subject)}
                  >
                    <div className="sidebar-item-header">
                      <span className="sidebar-item-title">{subject.title}</span>
                      <span className="sidebar-item-progress">{p}%</span>
                    </div>
                    <div className="mini-progress-bar">
                      <div className="mini-progress-fill" style={{ width: `${p}%` }} />
                    </div>
                    {deadline && daysRemaining !== null && daysRemaining <= 3 && (
                      <span className={`sidebar-deadline ${getDeadlineClass(daysRemaining)}`}>
                        {daysRemaining < 0 ? `${Math.abs(daysRemaining)}日超過` : daysRemaining === 0 ? '今日まで' : `残り${daysRemaining}日`}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {completed.length > 0 && (
            <div className="sidebar-section">
              <h3>✅ 完了</h3>
              {completed.map((subject) => (
                <div
                  key={subject.subjectId}
                  className="sidebar-item completed"
                  onClick={() => onSubjectClick(subject)}
                >
                  <span className="sidebar-item-title">{subject.title}</span>
                </div>
              ))}
            </div>
          )}

          {notStarted.length > 0 && (
            <div className="sidebar-section">
              <h3>📚 未着手</h3>
              {displayedNotStarted.map((subject) => (
                <div
                  key={subject.subjectId}
                  className="sidebar-item not-started"
                  onClick={() => onSubjectClick(subject)}
                >
                  <span className="sidebar-item-title">{subject.title}</span>
                </div>
              ))}
              {hiddenCount > 0 && !showAllNotStarted && (
                <button
                  className="sidebar-show-more"
                  onClick={() => setShowAllNotStarted(true)}
                >
                  他 {hiddenCount} 件を表示
                </button>
              )}
              {showAllNotStarted && notStarted.length > 5 && (
                <button
                  className="sidebar-show-more"
                  onClick={() => setShowAllNotStarted(false)}
                >
                  折りたたむ
                </button>
              )}
            </div>
          )}

          {/* フィルターセクション */}
          <div className="sidebar-section sidebar-filters">
            <h3>🔍 絞り込み</h3>
            
            {/* 難易度フィルター */}
            <div className="sidebar-filter-group">
              <span className="filter-group-label">難易度</span>
              <div className="sidebar-star-filter">
                {[1, 2, 3, 4, 5].map((weight) => (
                  <button
                    key={weight}
                    className={`sidebar-star-btn ${sidebarSelectedWeight === weight ? 'active' : ''}`}
                    onClick={() => setSidebarSelectedWeight(sidebarSelectedWeight === weight ? null : weight)}
                  >
                    {'★'.repeat(weight)}
                  </button>
                ))}
              </div>
            </div>

            {/* タグフィルター */}
            {allTags.length > 0 && (
              <div className="sidebar-filter-group">
                <span className="filter-group-label">タグ</span>
                <div className="sidebar-tag-filter">
                  {allTags.map((tag) => (
                    <button
                      key={tag.id}
                      className={`sidebar-tag-btn ${sidebarSelectedTags.includes(tag.name) ? 'active' : ''}`}
                      onClick={() => {
                        setSidebarSelectedTags(prev => 
                          prev.includes(tag.name) 
                            ? prev.filter(t => t !== tag.name)
                            : [...prev, tag.name]
                        );
                      }}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 期限フィルター */}
            <div className="sidebar-filter-group">
              <span className="filter-group-label">期限</span>
              <div className="sidebar-deadline-info">
                期限設定済み: {Object.keys(deadlines).length}件
              </div>
            </div>

            {/* フィルタークリア */}
            {(sidebarSelectedTags.length > 0 || sidebarSelectedWeight !== null) && (
              <button
                className="sidebar-clear-filter"
                onClick={() => {
                  setSidebarSelectedTags([]);
                  setSidebarSelectedWeight(null);
                }}
              >
                フィルターをクリア
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export const SubjectsView: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    subjects,
    progress,
    deadlines,
    allTags,
    subjectTags,
    selectedTags,
    loading,
    error,
    setDeadline,
    clearDeadline,
    getGoogleCalendarUrl,
    getDaysRemaining,
    toggleTagFilter,
    clearTagFilters,
  } = useSubjectsViewModel();
  const { handleSignout } = useAuthViewModel();
  const [modalSubject, setModalSubject] = useState<Subject | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  
  // フィルター・ソート用の状態
  const [selectedWeight, setSelectedWeight] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'sections' | 'progress'>('sections');
  const [effectsEnabled, setEffectsEnabled] = useState(true);
  
  // チュートリアル
  const [showTutorial, setShowTutorial] = useState(false);
  
  useEffect(() => {
    // ログイン時にisFirstLoginがlocationのstateで渡される場合
    const state = location.state as { isFirstLogin?: boolean } | null;
    if (shouldShowTutorial(state?.isFirstLogin)) {
      // 少し遅延させてDOMが準備できてから表示
      const timer = setTimeout(() => setShowTutorial(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  const onSubjectClick = (subject: Subject) => {
    // 閲覧記録を送信（エラーは無視）
    recordSubjectView(subject.subjectId).catch(() => {});
    
    // 紐づいてるタグの閲覧も記録
    const tags = subjectTags[subject.subjectId] || [];
    tags.forEach((tag) => {
      recordTagView(tag.id).catch(() => {});
    });
    
    // チュートリアル中の場合はフラグを渡してセクションページでも継続
    if (showTutorial) {
      navigate(`/subjects/${subject.subjectId}/sections`, { 
        state: { continueTutorial: true } 
      });
    } else {
      navigate(`/subjects/${subject.subjectId}/sections`);
    }
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
    return <LoadingSpinner message="題材を読み込んでいます..." />;
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

  // 重みフィルタリング（タグフィルタリングはバックエンドで実行済み）
  const filteredSubjects = selectedWeight
    ? subjects.filter(s => (s.weight || 1) === selectedWeight)
    : subjects;

  // ソート
  const sortedSubjects = [...filteredSubjects].sort((a, b) => {
    switch (sortBy) {
      case 'progress':
        return (progress[b.subjectId] || 0) - (progress[a.subjectId] || 0);
      case 'sections':
      default:
        return (a.maxSections || 0) - (b.maxSections || 0); // 少ない順
    }
  });

  // 重みでグループ化（カテゴリ表示用）
  const groupedSubjects = sortedSubjects.reduce((acc, subject) => {
    const weight = subject.weight || 1;
    if (!acc[weight]) acc[weight] = [];
    acc[weight].push(subject);
    return acc;
  }, {} as Record<number, Subject[]>);

  // 重み順にソート（1→5）
  const sortedWeights = Object.keys(groupedSubjects)
    .map(Number)
    .sort((a, b) => a - b);

  // 星フィルターのクリック
  const handleStarClick = (weight: number) => {
    setSelectedWeight(selectedWeight === weight ? null : weight);
  };

  return (
    <div className={`subjects-page-wrapper ${effectsEnabled ? 'effects-on' : 'effects-off'}`}>
      <header className="subjects-header">
        <div className="header-left">
          <button
            className="hamburger-btn"
            onClick={() => setShowSidebar(true)}
            aria-label="進捗を表示"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          <h1>題材一覧</h1>
        </div>
        <div className="header-actions">
          <button onClick={() => navigate('/ranking')} className="btn-ranking">
            🏆 ランキング
          </button>
          <button onClick={() => navigate('/profile')} className="btn-profile">
            プロフィール
          </button>
          <button onClick={handleSignout} className="btn-secondary">
            サインアウト
          </button>
        </div>
      </header>

      <main className="subjects-container">
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

          {/* タグフィルター */}
          {allTags.length > 0 && (
            <div className="filter-section">
              <span className="filter-label">タグで絞り込み:</span>
              <div className="tag-filter">
                {allTags.map((tag) => (
                  <button
                    key={tag.id}
                    className={`tag-filter-btn ${selectedTags.includes(tag.name) ? 'active' : ''}`}
                    onClick={() => toggleTagFilter(tag.name)}
                  >
                    {tag.displayName}
                  </button>
                ))}
                {selectedTags.length > 0 && (
                  <button className="clear-filter-btn" onClick={clearTagFilters}>
                    ✕ クリア
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="sort-section">
            <span className="filter-label">並び替え:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'sections' | 'progress')}
              className="sort-select"
            >
              <option value="sections">セクション数順</option>
              <option value="progress">進捗率順</option>
            </select>
          </div>
          <div className="filter-result">
            {filteredSubjects.length} 件表示中
          </div>
        </div>

        {/* 浮遊エフェクトトグル */}
        <div className="floating-effect-toggle">
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={effectsEnabled}
              onChange={(e) => setEffectsEnabled(e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
          <span className="toggle-label">エフェクト</span>
        </div>
        {sortedWeights.map((weight) => {
          const category = categoryLabels[weight] || { label: `レベル${weight}`, emoji: '📚' };
          const categorySubjects = groupedSubjects[weight];

          return (
            <div key={weight} className="subject-category">
              <div className="category-header">
                <span className="category-emoji">{category.emoji}</span>
                <h2 className="category-title">{category.label}</h2>
                <span className="category-count">{categorySubjects.length}件</span>
                <div className="category-stars">
                  <StarRating weight={weight} />
                </div>
              </div>
              <div className="subjects-grid">
                {categorySubjects.map((subject, index) => {
                  const progressPercent = progress[subject.subjectId] || 0;
                  const deadline = deadlines[subject.subjectId];
                  const daysRemaining = getDaysRemaining(subject.subjectId);
                  const tags = subjectTags[subject.subjectId] || [];

                  return (
                    <AnimatedCard key={subject.subjectId} delay={index * 50}>
                      <div
                        className="subject-card"
                        data-subject-id={subject.subjectId}
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
                        <div className="subject-card-body">
                          <h2>{subject.title}</h2>
                          <p>{subject.description}</p>
                          {tags.length > 0 && (
                            <div className="subject-tags">
                              {tags.map((tag) => (
                                <span key={tag.id} className="subject-tag">
                                  {tag.displayName}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
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
                          <span className="progress-label">進捗率</span>
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
                          <span className="created-at">{formatDate(subject.createdAt)}</span>
                        </div>
                      </div>
                    </AnimatedCard>
                  );
                })}
              </div>
            </div>
          );
        })}
      </main>

      <footer className="subjects-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="footer-logo">🌿 Pathly</span>
            <p className="footer-tagline">学習の道筋を、あなたと共に</p>
          </div>
          <div className="footer-links">
            <a href="https://docs.google.com/forms/d/e/1FAIpQLScxw4sQcRCVQ5e8bHqe0Fl_G5e0PHER_fdWazzTR1aBqR6zZA/viewform" target="_blank" rel="noopener noreferrer" className="footer-link">
              📧 お問い合わせ
            </a>
            <a href="/" className="footer-link">
              🏠 トップページ
            </a>
          </div>
          <div className="footer-copyright">
            © 2026 Pathly. All rights reserved.
          </div>
        </div>
      </footer>

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

      {showSidebar && (
        <ProgressSidebar
          subjects={subjects}
          progress={progress}
          deadlines={deadlines}
          getDaysRemaining={getDaysRemaining}
          onClose={() => setShowSidebar(false)}
          onSubjectClick={(subject) => {
            setShowSidebar(false);
            onSubjectClick(subject);
          }}
          allTags={allTags}
        />
      )}

      {showTutorial && (
        <Tutorial onComplete={() => setShowTutorial(false)} />
      )}
    </div>
  );
};
