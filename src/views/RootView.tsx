/**
 * Root View
 * APIエンドポイントの概要ページ
 */
import React from 'react';
import { Link } from 'react-router-dom';

interface EndpointLink {
  label: string;
  to: string;
}

interface EndpointInfo {
  method: string;
  path: string;
}

interface ApiSection {
  title: string;
  description: string;
  endpoints: EndpointInfo[];
  links: EndpointLink[];
}

const apiSections: ApiSection[] = [
  {
    title: '認証 API',
    description: 'ユーザー登録・サインイン・アクセストークン更新。',
    endpoints: [
      { method: 'POST', path: '/api/auth/signup' },
      { method: 'POST', path: '/api/auth/signin' },
      { method: 'POST', path: '/api/auth/refresh' },
    ],
    links: [
      { label: 'サインアップ', to: '/auth/signup' },
      { label: 'サインイン', to: '/auth/signin' },
      { label: 'トークン更新', to: '/auth/token-refresh' },
    ],
  },
  {
    title: '題材 API',
    description: '題材一覧取得と管理（管理者権限）。',
    endpoints: [
      { method: 'GET', path: '/api/subjects' },
      { method: 'POST', path: '/api/subjects' },
      { method: 'PUT', path: '/api/subjects/{subjectId}' },
      { method: 'DELETE', path: '/api/subjects/{subjectId}' },
    ],
    links: [
      { label: '題材一覧', to: '/subjects' },
      { label: '題材管理', to: '/admin/subjects' },
    ],
  },
  {
    title: 'セクション API',
    description: '題材に紐づくセクションの閲覧と画像付きCRUD。',
    endpoints: [
      { method: 'GET', path: '/api/subjects/{subjectId}/sections' },
      { method: 'POST', path: '/api/subjects/{subjectId}/sections' },
      { method: 'PUT', path: '/api/subjects/{subjectId}/sections/{sectionId}' },
      { method: 'DELETE', path: '/api/subjects/{subjectId}/sections/{sectionId}' },
    ],
    links: [
      { label: '学習ビュー', to: '/subjects' },
      { label: 'セクション管理', to: '/admin/sections' },
    ],
  },
  {
    title: '進捗 API',
    description: 'セクション完了状況の取得と更新。',
    endpoints: [
      { method: 'GET', path: '/api/progress/subjects/{subjectId}' },
      { method: 'POST', path: '/api/progress/subjects/{subjectId}/sections' },
      { method: 'DELETE', path: '/api/progress/subjects/{subjectId}/sections/{sectionId}' },
    ],
    links: [{ label: '進捗インスペクター', to: '/progress' }],
  },
  {
    title: '管理者 API',
    description: 'APIキーでの管理者作成と、管理者一覧・更新・削除。',
    endpoints: [
      { method: 'POST', path: '/api/admin/users' },
      { method: 'GET', path: '/api/admin/users' },
      { method: 'GET', path: '/api/admin/users/{userId}' },
      { method: 'PUT', path: '/api/admin/users/{userId}' },
      { method: 'DELETE', path: '/api/admin/users/{userId}' },
    ],
    links: [
      { label: '管理者ダッシュボード', to: '/admin' },
      { label: '管理者管理', to: '/admin/users' },
    ],
  },
];

export const RootView: React.FC = () => {
  return (
    <div className="root-container">
      <section className="root-hero">
        <p className="root-label">J15 Backend API</p>
        <div className="admin-badge">管理者専用ページ</div>
        <h1>エンドポイントと実装フローのポータル</h1>
        <p>
          Backend/docsにある仕様を元に、認証・題材・セクション・進捗・管理者APIを呼び出すためのフロントエンドです。
          すべてのフォームから実際のエンドポイントにリクエストできます。
        </p>
        <div className="hero-base-urls">
          <div>
            <span>本番:</span> https://zu9mkxoir4.execute-api.ap-northeast-1.amazonaws.com
          </div>
          <div>
            <span>ローカル:</span> http://localhost:8080
          </div>
        </div>
      </section>

      <div className="root-grid">
        {apiSections.map((section) => (
          <div key={section.title} className="root-card">
            <h2>{section.title}</h2>
            <p>{section.description}</p>
            <ul className="endpoint-list">
              {section.endpoints.map((endpoint) => (
                <li key={`${endpoint.method}${endpoint.path}`}>
                  <span className={`http-method ${endpoint.method.toLowerCase()}`}>
                    {endpoint.method}
                  </span>
                  <code>{endpoint.path}</code>
                </li>
              ))}
            </ul>
            <div className="root-links">
              {section.links.map((link) => (
                <Link key={link.to} to={link.to} className="root-link">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
