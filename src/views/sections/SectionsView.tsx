/**
 * Sections View
 * セクション一覧ページのView
 */
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSectionsViewModel } from '@/viewmodels/useSectionsViewModel';
import { ProgressBar } from '@/views/components/ProgressBar';
import { Sidebar } from '@/views/components/Sidebar';
import { ContentArea } from '@/views/components/ContentArea';
import { ConfettiEffect } from '@/views/components/ConfettiEffect';

export const SectionsView: React.FC = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const navigate = useNavigate();
  const {
    subject,
    sections,
    progressData,
    currentSection,
    loading,
    error,
    showCelebration,
    fetchData,
    selectSection,
    toggleSectionComplete,
    isSectionCleared,
    dismissCelebration,
  } = useSectionsViewModel();

  useEffect(() => {
    if (subjectId) {
      fetchData(Number(subjectId));
    }
  }, [subjectId]);

  const handleBackClick = () => {
    navigate('/subjects');
  };

  if (loading) {
    return <div className="loading-container">読み込み中...</div>;
  }

  if (error) {
    return <div className="error-container">エラー: {error}</div>;
  }

  if (!subject || !progressData) {
    return null;
  }

  const formatDate = (value?: string) => {
    if (!value) return '-';
    const date = new Date(value);
    return date.toLocaleString();
  };

  return (
    <div className="sections-container">
      <header className="sections-header">
        <button onClick={handleBackClick} className="btn-back">
          ← 題材一覧に戻る
        </button>
        <div className="sections-header-content">
          <div className="subject-info">
            <h1 id="projectTitle">{subject.title}</h1>
            <p className="subject-description">{subject.description}</p>
            <div className="subject-meta">
              <span>最大 {subject.maxSections} セクション</span>
              <span>作成日: {formatDate(subject.createdAt)}</span>
            </div>
          </div>
          <ProgressBar progressData={progressData} />
        </div>
      </header>

      <div className="progress-summary">
        <div>
          <strong>進捗率:</strong> {progressData.progressPercentage}%
        </div>
        <div>
          <strong>完了:</strong> {progressData.clearedCount} / {progressData.totalSections}
        </div>
        <div>
          <strong>残り:</strong> {progressData.remainingCount}
        </div>
        <div>
          <strong>次のセクション:</strong>{' '}
          {progressData.nextSectionId !== null ? `#${progressData.nextSectionId}` : '全て完了'}
        </div>
      </div>

      <div className="sections-content">
        <Sidebar
          sections={sections}
          currentSection={currentSection}
          onSectionClick={selectSection}
          onCompleteClick={toggleSectionComplete}
          isSectionCleared={isSectionCleared}
        />
        <div className="main-content">
          {currentSection ? (
            <ContentArea section={currentSection} subjectId={Number(subjectId)} />
          ) : (
            <div className="empty-section">セクションが登録されていません</div>
          )}
        </div>
      </div>

      <ConfettiEffect isActive={showCelebration} onComplete={dismissCelebration} />
    </div>
  );
};
