/**
 * SidebarItem
 * サイドバーの個別アイテムコンポーネント
 * Single Responsibility: 単一セクションアイテムの表示と操作のみを担当
 */
import React from 'react';
import { type Section } from '@/models/Section';

interface SidebarItemProps {
  section: Section;
  isActive: boolean;
  isCleared: boolean;
  onClick: () => void;
  onCompleteClick: () => void;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
  section,
  isActive,
  isCleared,
  onClick,
  onCompleteClick,
}) => {
  const handleCompleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCompleteClick();
  };

  return (
    <div
      className={`sidebar-item ${isActive ? 'active' : ''} ${isCleared ? 'cleared' : ''}`}
      onClick={onClick}
    >
      {isCleared && <span className="finish-icon">✓</span>}
      <span className="item-text">
        #{section.sectionId} {section.title}
      </span>
      <button className="complete-btn" onClick={handleCompleteClick}>
        {isCleared ? '未完了にする' : '完了にする'}
      </button>
    </div>
  );
};
