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
          <div key={card.title} className="admin-card">
            <p className="admin-card-endpoint">{card.endpoint}</p>
            <h2>{card.title}</h2>
            <p>{card.description}</p>
            <Link to={card.link} className="btn-primary">
              開く
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};
