/**
 * Admin Dashboard View
 * 管理者向けの概要ページ
 */
import React from 'react';
import { Link } from 'react-router-dom';

const cards = [
  {
    title: '題材管理',
    description: 'POST/PUT/DELETE /api/subjects。maxSectionsや題材メタデータを管理。',
    link: '/admin/subjects',
    endpoint: '/api/subjects',
  },
  {
    title: 'セクション管理',
    description: '画像付き multipart 対応のセクション作成・更新・削除。',
    link: '/admin/sections',
    endpoint: '/api/subjects/{subjectId}/sections',
  },
  {
    title: 'タグ管理',
    description: 'タグの作成・削除と題材へのタグ付与。検索・フィルタリング用。',
    link: '/admin/tags',
    endpoint: '/api/tags',
  },
  {
    title: '課題題材管理 (Beta)',
    description: '課題題材の作成・更新・削除。コード提出・自動採点システム用。',
    link: '/admin/assignments',
    endpoint: '/api/assignments',
    badge: 'Beta',
  },
  {
    title: '課題セクション管理 (Beta)',
    description: 'テストケース付きセクションの管理。制限時間・メモリ制限の設定。',
    link: '/admin/assignment-sections',
    endpoint: '/api/assignments/{id}/sections',
    badge: 'Beta',
  },
  {
    title: '進捗確認',
    description: 'GET/POST/DELETE /api/progress/subjects/{subjectId} を手動検証。',
    link: '/progress',
    endpoint: '/api/progress/...',
  },
  {
    title: '管理者ユーザー',
    description: 'APIキー経由の作成と JWT 認証済みの一覧/更新/削除。',
    link: '/admin/users',
    endpoint: '/api/admin/users',
  },
];

export const AdminDashboardView: React.FC = () => {
  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-grid">
        {cards.map((card) => (
          <div key={card.title} className={`admin-card ${card.badge ? 'admin-card-beta' : ''}`}>
            <p className="admin-card-endpoint">
              {card.endpoint}
              {card.badge && <span className="admin-card-badge">{card.badge}</span>}
            </p>
            <h2>{card.title}</h2>
            <p>{card.description}</p>
            <Link to={card.link} className={card.badge ? 'btn-primary btn-assignment' : 'btn-primary'}>
              開く
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};
