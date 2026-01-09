/**
 * Sections View
 * セクション一覧ページのView
 */
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSectionsViewModel } from '@/viewmodels/useSectionsViewModel';
import { ProgressBar } from '@/views/components/ProgressBar';
import { Sidebar } from '@/views/components/Sidebar';
import { ContentArea } from '@/views/components/ContentArea';
import { CodeEditor } from '@/views/components/CodeEditor';
import { CodePreview } from '@/views/components/CodePreview';
import { ConfettiEffect } from '@/views/components/ConfettiEffect';
import { GitHubExportModal } from '@/views/components/GitHubExportModal';
import { isGitHubConnected } from '@/utils/githubStorage';

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

  // リサイズ用の状態
  const [sidebarWidth, setSidebarWidth] = useState(200); // px
  const [contentWidth, setContentWidth] = useState(50); // パーセント（残りの中での割合）
  const [showExportModal, setShowExportModal] = useState(false);
  const [rightTab, setRightTab] = useState<'editor' | 'preview'>('editor');
  
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const contentContainerRef = useRef<HTMLDivElement>(null);
  const draggingSidebar = useRef(false);
  const draggingContent = useRef(false);

  useEffect(() => {
    if (subjectId) {
      fetchData(Number(subjectId));
    }
  }, [subjectId]);

  // サイドバーリサイズ
  const handleSidebarMouseDown = useCallback(() => {
    draggingSidebar.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  // コンテンツリサイズ
  const handleContentMouseDown = useCallback(() => {
    draggingContent.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (draggingSidebar.current && mainContainerRef.current) {
      const containerRect = mainContainerRef.current.getBoundingClientRect();
      const newWidth = e.clientX - containerRect.left;
      if (newWidth >= 150 && newWidth <= 400) {
        setSidebarWidth(newWidth);
      }
    }
    
    if (draggingContent.current && contentContainerRef.current) {
      const containerRect = contentContainerRef.current.getBoundingClientRect();
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      if (newWidth >= 25 && newWidth <= 75) {
        setContentWidth(newWidth);
      }
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    draggingSidebar.current = false;
    draggingContent.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const handleBackClick = () => {
    navigate('/subjects');
  };

  // 次のセクションへ
  const handleNextSection = () => {
    if (!currentSection || !sections.length) return;
    const currentIndex = sections.findIndex(s => s.sectionId === currentSection.sectionId);
    if (currentIndex < sections.length - 1) {
      selectSection(sections[currentIndex + 1]);
    }
  };

  // 前のセクションへ
  const handlePrevSection = () => {
    if (!currentSection || !sections.length) return;
    const currentIndex = sections.findIndex(s => s.sectionId === currentSection.sectionId);
    if (currentIndex > 0) {
      selectSection(sections[currentIndex - 1]);
    }
  };

  // 完了して次へ
  const handleComplete = () => {
    if (currentSection) {
      toggleSectionComplete(currentSection.sectionId);
    }
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

  const currentIndex = currentSection 
    ? sections.findIndex(s => s.sectionId === currentSection.sectionId)
    : -1;
  const hasNext = currentIndex < sections.length - 1;
  const hasPrev = currentIndex > 0;

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
        <button
          className="btn-github-export-small"
          onClick={() => setShowExportModal(true)}
          title={isGitHubConnected() ? 'GitHubにエクスポート' : 'GitHub連携が必要です'}
        >
          🐙 GitHubに保存
        </button>
      </div>

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
              <div className="editor-panel">
                <div className="editor-panel-tabs">
                  <button
                    className={`tab-btn ${rightTab === 'editor' ? 'active' : ''}`}
                    onClick={() => setRightTab('editor')}
                  >
                    📝 エディタ
                  </button>
                  <button
                    className={`tab-btn ${rightTab === 'preview' ? 'active' : ''}`}
                    onClick={() => setRightTab('preview')}
                  >
                    👁️ プレビュー
                  </button>
                </div>
                {rightTab === 'editor' ? (
                  <CodeEditor
                    subjectId={Number(subjectId)}
                    sectionId={currentSection.sectionId}
                    height="calc(100vh - 420px)"
                  />
                ) : (
                  <CodePreview
                    subjectId={Number(subjectId)}
                    currentSectionId={currentSection.sectionId}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfettiEffect isActive={showCelebration} onComplete={dismissCelebration} />

      {showExportModal && (
        <GitHubExportModal
          subjectId={Number(subjectId)}
          subjectTitle={subject.title}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
};
