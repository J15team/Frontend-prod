/**
 * Sidebar Component
 * サイドバーコンポーネント（セクション一覧）
 * SidebarItemに個別アイテムを分離（Single Responsibility原則）
 */
import React from 'react';
import { type Section } from '@/models/Section';
import { SidebarItem } from './SidebarItem';

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
      {sections.map((section) => (
        <SidebarItem
          key={section.sectionId}
          section={section}
          isActive={currentSection?.sectionId === section.sectionId}
          isCleared={isSectionCleared(section.sectionId)}
          onClick={() => onSectionClick(section)}
          onCompleteClick={() => onCompleteClick(section.sectionId)}
        />
      ))}
    </div>
  );
};
