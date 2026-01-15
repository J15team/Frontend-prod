/**
 * Assignment Sections View
 * 課題セクション一覧ページ（Beta）
 * 既存の題材ページと同じ構造、色だけオレンジ系
 */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAssignmentSectionsViewModel } from '@/viewmodels/assignments/useAssignmentSectionsViewModel';
import { useResizableLayout } from '@/hooks/useResizableLayout';

// 共通コンポーネント
import { LoadingSpinner } from '@/components/common/LoadingSpinner/LoadingSpinner';

// 課題専用コンポーネント
import { AssignmentSidebar } from '@/components/assignments/AssignmentSidebar/AssignmentSidebar';
import { AssignmentContentArea } from '@/components/assignments/AssignmentContentArea/AssignmentContentArea';
import { AssignmentEditorPanel } from '@/components/assignments/AssignmentEditorPanel/AssignmentEditorPanel';

import '@/styles/assignments/assignment-sections.css';

export const AssignmentSectionsView: React.FC = () => {
  const { assignmentSubjectId } = useParams<{ assignmentSubjectId: string }>();
  const navigate = useNavigate();
  const subjectId = Number(assignmentSubjectId);

  const {
    subject,
    sections,
    currentSection,
    submissions,
    currentSubmission,
    progress,
    loading,
    submitting,
    error,
    loadSubject,
    loadSections,
    loadSectionDetail,
    loadProgress,
    submit,
    loadSubmissionHistory,
    pollSubmissionResult,
    selectSection,
    getSectionProgress,
  } = useAssignmentSectionsViewModel();

  // リサイズフック
  const {
    sidebarWidth,
    contentWidth,
    mainContainerRef,
    contentContainerRef,
    handleSidebarMouseDown,
    handleContentMouseDown,
  } = useResizableLayout();

  const [judging, setJudging] = useState(false);

  // データ取得
  useEffect(() => {
    if (subjectId) {
      loadSubject(subjectId);
      loadSections(subjectId);
      loadProgress(subjectId);
    }
  }, [subjectId, loadSubject, loadSections, loadProgress]);

  // セクション選択時に詳細と履歴を取得
  useEffect(() => {
    if (currentSection && subjectId) {
      loadSectionDetail(subjectId, currentSection.sectionId);
      if (currentSection.hasAssignment) {
        loadSubmissionHistory(subjectId, currentSection.sectionId);
      }
    }
  }, [currentSection?.sectionId, subjectId, loadSectionDetail, loadSubmissionHistory]);

  // ナビゲーション
  const handleBackClick = () => navigate('/assignments');

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

  // 提出処理
  const handleSubmit = async (code: string) => {
    if (!currentSection || !code.trim()) return;

    setJudging(true);
    const submissionId = await submit(subjectId, currentSection.sectionId, code, 'C');
    
    if (submissionId) {
      await pollSubmissionResult(subjectId, currentSection.sectionId, submissionId);
      await loadSubmissionHistory(subjectId, currentSection.sectionId);
      // 提出後に進捗を再取得
      await loadProgress(subjectId);
    }
    setJudging(false);
  };

  // ローディング・エラー状態
  if (loading && !subject) {
    return <LoadingSpinner message="課題を読み込んでいます..." />;
  }

  if (error) {
    return <div className="error-container">エラー: {error}</div>;
  }

  if (!subject) {
    return null;
  }

  // ナビゲーション状態
  const currentIndex = currentSection
    ? sections.findIndex(s => s.sectionId === currentSection.sectionId)
    : -1;
  const hasNext = currentIndex < sections.length - 1;
  const hasPrev = currentIndex > 0;

  return (
    <div className="assignment-sections-container">
      {/* ヘッダー */}
      <header className="assignment-sections-header">
        <div className="header-left">
          <button className="btn-back" onClick={handleBackClick}>
            ← 戻る
          </button>
          <h1>
            {subject.title}
            <span className="beta-badge">Beta</span>
          </h1>
        </div>
        <div className="header-right">
          {progress && (
            <span className="header-progress">
              <span className="progress-cleared">{progress.clearedSections}</span>
              <span className="progress-divider">/</span>
              <span className="progress-total">{progress.totalSections}</span>
              <span className="progress-label">クリア</span>
            </span>
          )}
          <span className="progress-text">
            セクション: {currentIndex + 1} / {sections.length}
          </span>
        </div>
      </header>

      {/* メインコンテンツ */}
      <div className="sections-content" ref={mainContainerRef}>
        <div className="sidebar-wrapper" style={{ width: sidebarWidth }}>
          <AssignmentSidebar
            sections={sections}
            currentSection={currentSection}
            onSectionClick={selectSection}
            getSectionProgress={getSectionProgress}
          />
        </div>
        <div className="sidebar-resizer assignment-resizer" onMouseDown={handleSidebarMouseDown} />

        <div className="main-content-split" ref={contentContainerRef}>
          <div className="split-left" style={{ width: `${contentWidth}%` }}>
            {currentSection ? (
              <AssignmentContentArea
                section={currentSection}
                submissions={submissions}
                currentSubmission={currentSubmission}
                onNext={handleNextSection}
                onPrev={handlePrevSection}
                hasNext={hasNext}
                hasPrev={hasPrev}
              />
            ) : (
              <div className="empty-section">セクションを選択してください</div>
            )}
          </div>
          <div className="split-resizer assignment-resizer" onMouseDown={handleContentMouseDown} />
          <div className="split-right" style={{ width: `${100 - contentWidth}%` }}>
            {currentSection && (
              <AssignmentEditorPanel
                subjectId={subjectId}
                sectionId={currentSection.sectionId}
                hasAssignment={currentSection.hasAssignment}
                onSubmit={handleSubmit}
                isSubmitting={submitting || judging}
                lastSubmission={currentSubmission}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
