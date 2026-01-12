/**
 * Theme Toggle Button
 * ダークモード/ライトモードの切り替えボタン
 */
import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import './ThemeToggle.css';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      className={`theme-toggle ${isDark ? 'active' : ''}`}
      onClick={toggleTheme}
      aria-label={isDark ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
    >
      ダークモード
    </button>
  );
};
