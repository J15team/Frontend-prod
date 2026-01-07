/**
 * Progress Inspector View
 * 進捗APIを手動で呼び出し
 */
import React, { useState } from 'react';
import { useProgressInspectorViewModel } from '@/viewmodels/useProgressInspectorViewModel';

export const ProgressInspectorView: React.FC = () => {
  const { progress, loading, error, message, fetchProgress, markSection, unmarkSection } =
    useProgressInspectorViewModel();
  const [subjectId, setSubjectId] = useState<string>('');
  const [sectionId, setSectionId] = useState<string>('');

  const handleFetch = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!subjectId) return;
    await fetchProgress(Number(subjectId));
  };

  const handleMark = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!subjectId || !sectionId) return;
    await markSection(Number(subjectId), Number(sectionId));
  };

  const handleUnmark = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!subjectId || !sectionId) return;
    await unmarkSection(Number(subjectId), Number(sectionId));
  };

  return (
    <div className="management-container">
      <h1>進捗インスペクター</h1>
      <p>
        <code>/api/progress/subjects/{'{'}subjectId{'}'}</code> 系エンドポイントを検証するためのツールです。
      </p>
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="management-grid">
        <div className="management-card">
          <h2>進捗取得 (GET)</h2>
          <form className="management-form" onSubmit={handleFetch}>
            <label>
              題材ID
              <input
                type="number"
                min="1"
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                required
              />
            </label>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? '取得中...' : '進捗を取得'}
            </button>
          </form>
        </div>

        <div className="management-card">
          <h2>セクション完了 (POST/DELETE)</h2>
          <form className="management-form" onSubmit={handleMark}>
            <label>
              セクションID
              <input
                type="number"
                min="0"
                max="100"
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
                required
              />
            </label>
            <div className="management-actions">
              <button type="submit" className="btn-primary" disabled={loading || !subjectId}>
                完了にする
              </button>
              <button
                type="button"
                className="btn-secondary"
                disabled={loading || !subjectId}
                onClick={handleUnmark}
              >
                未完了にする
              </button>
            </div>
          </form>
        </div>
      </div>

      {progress && (
        <section className="data-section">
          <h2>レスポンス</h2>
          <div className="progress-details">
            <div>
              <strong>ユーザーID:</strong> {progress.userId}
            </div>
            <div>
              <strong>進捗率:</strong> {progress.progressPercentage}%
            </div>
            <div>
              <strong>完了:</strong> {progress.clearedCount} / {progress.totalSections}
            </div>
            <div>
              <strong>残り:</strong> {progress.remainingCount}
            </div>
            <div>
              <strong>次のセクション:</strong>{' '}
              {progress.nextSectionId !== null ? `#${progress.nextSectionId}` : '全て完了'}
            </div>
          </div>
          <h3>完了済みセクション</h3>
          <ul className="cleared-section-list">
            {progress.clearedSections.map((section) => (
              <li key={section.sectionId}>
                #{section.sectionId} - {new Date(section.completedAt).toLocaleString()}
              </li>
            ))}
            {progress.clearedSections.length === 0 && <li>まだ完了したセクションはありません。</li>}
          </ul>
        </section>
      )}
    </div>
  );
};
