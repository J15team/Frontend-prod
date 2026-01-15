/**
 * Assignment Sidebar Component
 * 課題セクション一覧サイドバー
 */
import React from 'react';
import type { AssignmentSection, ProgressSection } from '@/models/Assignment';
import './AssignmentSidebar.css';

interface AssignmentSidebarProps {
  sections: AssignmentSection[];
  currentSection: AssignmentSection | null;
  onSectionClick: (section: AssignmentSection) => void;
  getSectionProgress?: (sectionId: number) => ProgressSection | undefined;
}

export const AssignmentSidebar: React.FC<AssignmentSidebarProps> = ({
  sections,
  currentSection,
  onSectionClick,
  getSectionProgress,
}) => {
  return (
    <div className="assignment-sidebar">
      <div className="sidebar-header">セクション一覧</div>
      <div className="sidebar-list">
        {sections.map((section) => {
          const progress = getSectionProgress?.(section.sectionId);
          const isCleared = progress?.isCleared ?? false;
          const hasSubmission = progress && progress.submissionCount > 0;
          
          return (
            <div
              key={section.sectionId}
              className={`sidebar-item ${currentSection?.sectionId === section.sectionId ? 'active' : ''} ${isCleared ? 'cleared' : ''}`}
              onClick={() => onSectionClick(section)}
            >
              <span className={`item-number ${section.hasAssignment ? 'has-assignment' : ''} ${isCleared ? 'cleared' : ''}`}>
                {isCleared ? '✓' : section.sectionId}
              </span>
              <div className="item-content">
                <span className="item-title">{section.title}</span>
                {hasSubmission && !isCleared && (
                  <span className="item-score">{progress.bestScore}点</span>
                )}
              </div>
              {section.hasAssignment && !isCleared && <span className="item-badge">📝</span>}
              {isCleared && <span className="item-badge cleared-badge">🏆</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
};
