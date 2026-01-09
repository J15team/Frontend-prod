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
  { path: '/admin', label: 'ダッシュボード' },
  { path: '/admin/subjects', label: '題材管理' },
  { path: '/admin/sections', label: 'セクション管理' },
  { path: '/admin/users', label: '管理者ユーザー' },
];

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <div>
          <p className="admin-label">管理者コンソール</p>
          <h1>J15 Admin Portal</h1>
          <p className="admin-subtext">
            バックエンドAPI（docs/detailed）で定義された題材・セクション・進捗・管理者エンドポイントを操作できます。
          </p>
        </div>
        <Link to="/admin/endpoints" className="btn-secondary">
          エンドポイント一覧へ戻る
        </Link>
      </header>

      <div className="admin-warning">
        本番環境へはサンプル管理者アカウントやデフォルトの <code>ADMIN_API_KEY</code> を絶対に配置しないでください。
      </div>

      <nav className="admin-nav">
        {adminNavItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`admin-nav-link ${location.pathname === item.path ? 'active' : ''}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <main className="admin-content">{children}</main>
    </div>
  );
};
