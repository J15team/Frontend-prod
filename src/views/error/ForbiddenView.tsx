/**
 * Forbidden Error Page
 * 管理者権限が必要なページへのアクセスを拒否
 */
import React from 'react';
import { Link } from 'react-router-dom';

export const ForbiddenView: React.FC = () => {
  return (
    <div className="error-container">
      <div className="error-card">
        <h1>403 - アクセス拒否</h1>
        <p>このページにアクセスする権限がありません。</p>
        <p>管理者権限が必要です。</p>
        <div className="error-actions">
          <Link to="/subjects" className="btn-primary">
            題材一覧へ戻る
          </Link>
          <Link to="/auth/admin-signin" className="btn-secondary">
            Admin Portalへサインイン
          </Link>
        </div>
      </div>
    </div>
  );
};
