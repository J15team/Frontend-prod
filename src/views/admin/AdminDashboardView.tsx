/**
 * Admin Dashboard View
 * 管理者向けの概要ページ
 */
import React from 'react';
import { Link } from 'react-router-dom';

const cards = [
  {
    title: '📊 進捗ダッシュボード',
    description: '全ユーザーの学習進捗を一覧で確認。',
    link: '/admin/progress',
    color: '#8b5cf6',
  },
  {
    title: '📚 題材管理',
    description: '題材の作成・編集・削除。',
    link: '/admin/subjects',
    color: '#22c55e',
  },
  {
    title: '📄 セクション管理',
    description: 'セクションの作成・編集・画像アップロード。',
    link: '/admin/sections',
    color: '#22c55e',
  },
  {
    title: '🏷️ タグ管理',
    description: 'タグの作成・削除と題材へのタグ付与。',
    link: '/admin/tags',
    color: '#3b82f6',
  },
  {
    title: '📝 課題題材管理',
    description: '課題題材の作成・編集・削除。',
    link: '/admin/assignments',
    color: '#f59e0b',
  },
  {
    title: '✏️ 課題セクション管理',
    description: 'テストケース付きセクションの管理。',
    link: '/admin/assignment-sections',
    color: '#f59e0b',
  },
  {
    title: '👤 管理者ユーザー',
    description: '管理者アカウントの一覧・作成・削除。',
    link: '/admin/users',
    color: '#ef4444',
  },
];

export const AdminDashboardView: React.FC = () => {
  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-grid">
        {cards.map((card) => (
          <div 
            key={card.title} 
            className="admin-card"
            style={{ borderTopColor: card.color }}
          >
            <h2>{card.title}</h2>
            <p>{card.description}</p>
            <Link 
              to={card.link} 
              className="btn-primary"
              style={{ background: card.color }}
            >
              開く
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};
