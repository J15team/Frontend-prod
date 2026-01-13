/**
 * Ranking View
 * ランキングページ（リボンスタイル）
 */
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRankingViewModel } from '@/viewmodels/ranking/useRankingViewModel';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import '@/styles/ranking.css';

type TabType = 'subjects' | 'tags';

const RankBadge: React.FC<{ rank: number }> = ({ rank }) => {
  const showCrown = rank <= 3;
  return (
    <div className="rank-badge">
      {showCrown && <span className="crown">👑</span>}
      <span className="rank-num">{rank}</span>
      <span className="rank-suffix">位</span>
    </div>
  );
};

export const RankingView: React.FC = () => {
  const navigate = useNavigate();
  const { subjectRankings, tagRankings, loading, error, refresh } = useRankingViewModel();
  const [activeTab, setActiveTab] = useState<TabType>('subjects');
  const [selectedDifficulty, setSelectedDifficulty] = useState<number | null>(null);

  // 難易度でフィルタリング＆順位を振り直し
  const filteredSubjects = useMemo(() => {
    if (selectedDifficulty === null) {
      return subjectRankings;
    }
    return subjectRankings
      .filter(item => (item.subject.weight || 1) === selectedDifficulty)
      .map((item, index) => ({ ...item, rank: index + 1 }));
  }, [subjectRankings, selectedDifficulty]);

  if (loading) {
    return <LoadingSpinner message="ランキングを読み込んでいます..." />;
  }

  if (error) {
    return (
      <div className="ranking-page">
        <div className="ranking-error">
          <p>{error}</p>
          <button onClick={refresh} className="btn-retry">再試行</button>
        </div>
      </div>
    );
  }

  return (
    <div className="ranking-page">
      {/* 紙吹雪 */}
      <div className="confetti" />
      <div className="confetti" />
      <div className="confetti" />
      <div className="confetti" />
      <div className="confetti" />
      <div className="confetti" />

      <header className="ranking-header">
        <button className="btn-back" onClick={() => navigate('/subjects')}>
          ←
        </button>
        <h1>🏆 ランキング</h1>
        <button className="btn-refresh" onClick={refresh}>
          ↻
        </button>
      </header>

      <nav className="ranking-nav">
        <button
          className={`nav-tab ${activeTab === 'subjects' ? 'active' : ''}`}
          onClick={() => setActiveTab('subjects')}
        >
          題材ランキング
        </button>
        <button
          className={`nav-tab ${activeTab === 'tags' ? 'active' : ''}`}
          onClick={() => setActiveTab('tags')}
        >
          タグランキング
        </button>
      </nav>

      <main className="ranking-content">
        {activeTab === 'subjects' && (
          <>
            {/* 難易度フィルター */}
            <div className="difficulty-filter">
              <span className="filter-label">難易度で絞り込み:</span>
              <div className="filter-buttons">
                <button
                  className={`filter-btn ${selectedDifficulty === null ? 'active' : ''}`}
                  onClick={() => setSelectedDifficulty(null)}
                >
                  すべて
                </button>
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    className={`filter-btn ${selectedDifficulty === level ? 'active' : ''}`}
                    onClick={() => setSelectedDifficulty(level)}
                  >
                    {'★'.repeat(level)}
                  </button>
                ))}
              </div>
            </div>

            {filteredSubjects.length === 0 ? (
              <p className="no-data">
                {selectedDifficulty !== null 
                  ? `難易度${'★'.repeat(selectedDifficulty)}のデータがありません` 
                  : 'まだランキングデータがありません'}
              </p>
            ) : (
              <div className="ranking-list">
                {filteredSubjects.map((item) => (
                  <div
                    key={item.subject.subjectId}
                    className={`ranking-item ${item.rank <= 3 ? `top-${item.rank}` : ''}`}
                    onClick={() => navigate(`/subjects/${item.subject.subjectId}/sections`)}
                  >
                    <RankBadge rank={item.rank} />
                    <div className="item-info">
                      <h3 className="item-title">{item.subject.title}</h3>
                      <p className="item-desc">{item.subject.description}</p>
                      <div className="item-meta">
                        <span className="meta-difficulty">難易度: <span className="meta-stars">{'★'.repeat(item.subject.weight || 1)}{'☆'.repeat(5 - (item.subject.weight || 1))}</span></span>
                        <span className="meta-sections">{item.subject.maxSections}セクション</span>
                        <span className="meta-views">{item.viewCount.toLocaleString()}閲覧</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'tags' && (
          <>
            {tagRankings.length === 0 ? (
              <p className="no-data">まだランキングデータがありません</p>
            ) : (
              <div className="ranking-list">
                {tagRankings.map((item) => (
                  <div
                    key={item.tag.id}
                    className={`ranking-item tag-item ${item.rank <= 3 ? `top-${item.rank}` : ''}`}
                  >
                    <RankBadge rank={item.rank} />
                    <div className="item-info">
                      <h3 className="item-title">{item.tag.displayName}</h3>
                      <div className="item-meta">
                        <span className={`tag-badge ${item.tag.type.toLowerCase()}`}>
                          {item.tag.type}
                        </span>
                        <span className="meta-views">{item.viewCount.toLocaleString()}閲覧</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};
