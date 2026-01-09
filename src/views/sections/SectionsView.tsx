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

  // リサイズ用の状態
  const [leftWidth, setLeftWidth] = useState(50); // パーセント
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  useEffect(() => {
    if (subjectId) {
      fetchData(Number(subjectId));
    }
  }, [subjectId]);

  // ドラッグでリサイズ
  const handleMouseDown = useCallback(() => {
    isDragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    
    // 20%〜80%の範囲に制限
    if (newWidth >= 20 && newWidth <= 80) {
      setLeftWidth(newWidth);
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
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

  // セクションの説明からデフォルトコードを抽出
  const extractDefaultCode = (description: string): { code: string; language: string } => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/;
    const match = description.match(codeBlockRegex);
    if (match) {
      return {
        language: match[1] || 'javascript',
        code: match[2].trim(),
      };
    }
    return { code: '', language: 'javascript' };
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

  const { code: defaultCode, language } = currentSection 
    ? extractDefaultCode(currentSection.description)
    : { code: '', language: 'javascript' };

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
        <div className="main-content-split" ref={containerRef}>
          <div className="split-left" style={{ width: `${leftWidth}%` }}>
            {currentSection ? (
              <ContentArea section={currentSection} />
            ) : (
              <div className="empty-section">セクションが登録されていません</div>
            )}
          </div>
          <div 
            className="split-resizer"
            onMouseDown={handleMouseDown}
          />
          <div className="split-right" style={{ width: `${100 - leftWidth}%` }}>
            {currentSection && (
              <div className="editor-panel">
                <div className="editor-panel-header">
                  <span>📝 コードエディタ</span>
                </div>
                <CodeEditor
                  subjectId={Number(subjectId)}
                  sectionId={currentSection.sectionId}
                  defaultCode={defaultCode}
                  language={language}
                  height="calc(100vh - 350px)"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfettiEffect isActive={showCelebration} onComplete={dismissCelebration} />
    </div>
  );
};
