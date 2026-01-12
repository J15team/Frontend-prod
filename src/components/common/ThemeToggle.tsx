/**
 * Theme Toggle Button
 * ダークモード/ライトモードの切り替えボタン
 * ログイン後のページのみ表示
 */
import React from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import './ThemeToggle.css';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const isDark = theme === 'dark';

  // ランディングページと認証ページでは非表示
  const hiddenPaths = ['/', '/auth/signin', '/auth/signup', '/auth/admin-signin', '/signin', '/signup'];
  const isHidden = hiddenPaths.includes(location.pathname) || 
                   location.pathname.startsWith('/team/') ||
                   location.pathname.startsWith('/auth/');

  if (isHidden) {
    return null;
  }

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
