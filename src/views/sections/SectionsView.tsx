/**
 * Sections View
 * セクション一覧ページのView
 */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSectionsViewModel } from '@/viewmodels/sections/useSectionsViewModel';
import { useResizableLayout } from '@/hooks/useResizableLayout';

// コンポーネント
import { LoadingSpinner } from '@/components/common/LoadingSpinner/LoadingSpinner';
import { Sidebar } from '@/components/features/Sidebar/Sidebar';
import { ContentArea } from '@/components/features/ContentArea/ContentArea';
import { ConfettiEffect } from '@/components/features/ConfettiEffect/ConfettiEffect';
import { GitHubExportModal } from '@/components/features/GitHubExportModal/GitHubExportModal';
import { Tutorial } from '@/components/features/Tutorial/Tutorial';
import { SectionsHeader } from '@/components/sections/SectionsHeader/SectionsHeader';
import { ProgressSummary } from '@/components/sections/ProgressSummary/ProgressSummary';
import { EditorPanel } from '@/components/sections/EditorPanel/EditorPanel';

export const SectionsView: React.FC = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

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

  // リサイズフック
  const {
    sidebarWidth,
    contentWidth,
    mainContainerRef,
    contentContainerRef,
    handleSidebarMouseDown,
    handleContentMouseDown,
  } = useResizableLayout();

  // モーダル・チュートリアル状態
  const [showExportModal, setShowExportModal] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  // データ取得
  useEffect(() => {
    if (subjectId) {
      fetchData(Number(subjectId));
    }
  }, [subjectId]);

  // チュートリアル表示判定
  useEffect(() => {
    const state = location.state as { continueTutorial?: boolean } | null;
    if (state?.continueTutorial && !localStorage.getItem('tutorial_sections_completed')) {
      const timer = setTimeout(() => setShowTutorial(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [location.state, sections]);

  // ナビゲーション
  const handleBackClick = () => navigate('/subjects');

  const handleNextSection = () => {
    if (!currentSection || !sections.length) return;
    const currentIndex = sections.findIndex(s => s.sectionId === currentSection.sectionId);
    if (currentIndex < sections.length - 1) {
      selectSection(sections[currentIndex + 1]);
    }
  };

  const handlePrevSection = () => {
    if (!currentSection || !sections.length) return;
    const currentIndex = sections.findIndex(s => s.sectionId === currentSection.sectionId);
    if (currentIndex > 0) {
      selectSection(sections[currentIndex - 1]);
    }
  };

  const handleComplete = () => {
    if (currentSection) {
      toggleSectionComplete(currentSection.sectionId);
    }
  };

  // ローディング・エラー状態
  if (loading) {
    return <LoadingSpinner message="セクションを読み込んでいます..." />;
  }

  if (error) {
    return <div className="error-container">エラー: {error}</div>;
  }

  if (!subject || !progressData) {
    return null;
  }

  // ナビゲーション状態
  const currentIndex = currentSection
    ? sections.findIndex(s => s.sectionId === currentSection.sectionId)
    : -1;
  const hasNext = currentIndex < sections.length - 1;
  const hasPrev = currentIndex > 0;

  return (
    <div className="sections-container">
      <SectionsHeader
        subject={subject}
        progressData={progressData}
        onBackClick={handleBackClick}
      />

      <ProgressSummary
        progressData={progressData}
        onExportClick={() => setShowExportModal(true)}
      />

      <div className="sections-content" ref={mainContainerRef}>
        <div className="sidebar-wrapper" style={{ width: sidebarWidth }}>
          <Sidebar
            sections={sections}
            currentSection={currentSection}
            onSectionClick={selectSection}
            onCompleteClick={toggleSectionComplete}
            isSectionCleared={isSectionCleared}
          />
        </div>
        <div className="sidebar-resizer" onMouseDown={handleSidebarMouseDown} />

        <div className="main-content-split" ref={contentContainerRef}>
          <div className="split-left" style={{ width: `${contentWidth}%` }}>
            {currentSection ? (
              <ContentArea
                section={currentSection}
                isCleared={isSectionCleared(currentSection.sectionId)}
                onComplete={handleComplete}
                onNext={handleNextSection}
                onPrev={handlePrevSection}
                hasNext={hasNext}
                hasPrev={hasPrev}
              />
            ) : (
              <div className="empty-section">セクションが登録されていません</div>
            )}
          </div>
          <div className="split-resizer" onMouseDown={handleContentMouseDown} />
          <div className="split-right" style={{ width: `${100 - contentWidth}%` }}>
            {currentSection && (
              <EditorPanel
                subjectId={Number(subjectId)}
                sectionId={currentSection.sectionId}
              />
            )}
          </div>
        </div>
      </div>

      <ConfettiEffect
        isActive={showCelebration && !showExportModal}
        onComplete={dismissCelebration}
      />

      {showExportModal && (
        <GitHubExportModal
          subjectId={Number(subjectId)}
          subjectTitle={subject.title}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {showTutorial && (
        <Tutorial
          page="sections"
          onComplete={() => {
            setShowTutorial(false);
            localStorage.setItem('tutorial_sections_completed', 'true');
          }}
        />
      )}
    </div>
  );
};
