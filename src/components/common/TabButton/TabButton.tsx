/**
 * TabButton
 * 再利用可能なタブボタンコンポーネント
 * Single Responsibility: タブボタンの表示と選択状態管理のみを担当
 */
import React from 'react';

interface TabButtonProps {
  label: string;
  icon?: string;
  isActive: boolean;
  onClick: () => void;
  className?: string;
}

export const TabButton: React.FC<TabButtonProps> = ({
  label,
  icon,
  isActive,
  onClick,
  className = 'tab-btn',
}) => (
  <button
    className={`${className} ${isActive ? 'active' : ''}`}
    onClick={onClick}
  >
    {icon && `${icon} `}{label}
  </button>
);
