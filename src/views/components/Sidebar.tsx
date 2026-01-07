/**
 * Sidebar Component
 * サイドバーコンポーネント（セクション一覧）
 */
import React from 'react';
import { type Section } from '@/models/Section';

interface SidebarProps {
  sections: Section[];
  currentSection: Section | null;
  onSectionClick: (section: Section) => void;
  onCompleteClick: (sectionId: number) => void;
  isSectionCleared: (sectionId: number) => boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sections,
  currentSection,
  onSectionClick,
  onCompleteClick,
  isSectionCleared,
}) => {
  return (
    <div className="sidebar">
      {sections.map((section) => {
        const isActive = currentSection?.sectionId === section.sectionId;
        const isCleared = isSectionCleared(section.sectionId);

        return (
          <div
            key={section.sectionId}
            className={`sidebar-item ${isActive ? 'active' : ''} ${isCleared ? 'cleared' : ''}`}
            onClick={() => onSectionClick(section)}
          >
            {isCleared && <span className="finish-icon">✓</span>}
            <span className="item-text">
              #{section.sectionId} {section.title}
            </span>
            <button
              className="complete-btn"
              onClick={(e) => {
                e.stopPropagation();
                onCompleteClick(section.sectionId);
              }}
            >
              {isCleared ? '未完了にする' : '完了にする'}
            </button>
          </div>
        );
      })}
    </div>
  );
};
