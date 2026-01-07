/**
 * Admin Key Required Error Page
 * X-Admin-Keyが必要なページへのアクセス時のエラー
 */
import React from 'react';
import { Link } from 'react-router-dom';

export const AdminKeyRequiredView: React.FC = () => {
  return (
    <div className="error-container">
      <div className="error-card">
        <h1>X-Admin-Key が必要です</h1>
        <p>このページにアクセスするには有効なX-Admin-Keyが必要です。</p>
        <p>Admin Portal経由でサインインしてください。</p>
        <div className="error-actions">
          <Link to="/auth/admin-signin" className="btn-primary">
            Admin Portalへサインイン
          </Link>
          <Link to="/subjects" className="btn-secondary">
            題材一覧へ戻る
          </Link>
        </div>
      </div>
    </div>
  );
};
