/**
 * Admin Layout
 * 管理者フロー共通のレイアウトとナビゲーション
 */
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const adminNavItems = [
  { path: '/admin', label: 'ダッシュボード', color: '#6b7280' },
  { path: '/admin/progress', label: '進捗ダッシュボード', color: '#8b5cf6' },
  { path: '/admin/subjects', label: '題材管理', color: '#22c55e' },
  { path: '/admin/sections', label: 'セクション管理', color: '#22c55e' },
  { path: '/admin/tags', label: 'タグ管理', color: '#06b6d4' },
  { path: '/admin/assignments', label: '課題題材管理', color: '#f59e0b' },
  { path: '/admin/assignment-sections', label: '課題セクション管理', color: '#f59e0b' },
  { path: '/admin/users', label: '管理者ユーザー', color: '#ef4444' },
];

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <div>
          <p className="admin-label">管理者コンソール</p>
          <h1>Pathly Admin</h1>
        </div>
        <div className="header-buttons">
          <Link to="/admin/endpoints" className="btn-secondary">
            📋 エンドポイント一覧
          </Link>
          <Link to="/subjects" className="btn-secondary">
            ← ユーザー画面へ
          </Link>
        </div>
      </header>

      <nav className="admin-nav">
        {adminNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-nav-link ${isActive ? 'active' : ''}`}
              style={{
                borderBottomColor: isActive ? item.color : 'transparent',
                color: isActive ? item.color : undefined,
                backgroundColor: isActive ? `${item.color}10` : undefined,
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <main className="admin-content">{children}</main>
    </div>
  );
};
