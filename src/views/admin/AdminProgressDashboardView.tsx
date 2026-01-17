/**
 * Admin Progress Dashboard View
 * 管理者用ユーザー進捗ダッシュボード
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  getAdminAssignmentProgress,
  getAdminSubjectProgress,
  type AssignmentUserProgressSummary,
  type UserSubjectProgressSummary,
} from '@/services/admin/AdminService';
import '@/styles/admin/progress-dashboard.css';

type ProgressType = 'assignments' | 'subjects';
type ViewMode = 'list' | 'detail';

export const AdminProgressDashboardView: React.FC = () => {
  const [progressType, setProgressType] = useState<ProgressType>('subjects');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  
  const [assignmentUsers, setAssignmentUsers] = useState<AssignmentUserProgressSummary[]>([]);
  const [subjectUsers, setSubjectUsers] = useState<UserSubjectProgressSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [assignmentRes, subjectRes] = await Promise.all([
        getAdminAssignmentProgress(),
        getAdminSubjectProgress(),
      ]);
      setAssignmentUsers(assignmentRes.users);
      setSubjectUsers(subjectRes.users);
    } catch (err) {
      console.error('進捗の取得に失敗:', err);
      setError('進捗データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const currentUsers = progressType === 'assignments' ? assignmentUsers : subjectUsers;
  const selectedUser = currentUsers.find(u => u.userId === selectedUserId);

  // ユーザーの総合進捗を計算
  const calculateOverallProgress = (subjects: { progressPercent: number }[]) => {
    if (subjects.length === 0) return 0;
    return Math.round(subjects.reduce((sum, s) => sum + s.progressPercent, 0) / subjects.length);
  };

  const handleUserClick = (userId: string) => {
    setSelectedUserId(userId);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedUserId(null);
  };

  if (loading) {
    return (
      <div className="progress-dashboard">
        <div className="loading-state">
          <img src="/icon.PNG" alt="Loading" className="loading-icon spinning" />
          <span>進捗データを読み込み中...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="progress-dashboard">
        <div className="error-state">{error}</div>
      </div>
    );
  }


  return (
    <div className="progress-dashboard">
      <div className="dashboard-header">
        <h1>📊 ユーザー進捗ダッシュボード</h1>
        <div className="header-controls">
          <div className="type-toggle">
            <button
              className={`toggle-btn ${progressType === 'subjects' ? 'active' : ''}`}
              onClick={() => setProgressType('subjects')}
            >
              📚 通常題材
            </button>
            <button
              className={`toggle-btn ${progressType === 'assignments' ? 'active' : ''}`}
              onClick={() => setProgressType('assignments')}
            >
              📝 課題題材
            </button>
          </div>
          <button className="btn-refresh" onClick={fetchProgress}>
            🔄 更新
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="users-list-view">
          <div className="list-header">
            <span className="user-count">{currentUsers.length} 人のユーザー</span>
          </div>
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>ユーザー名</th>
                  <th>メールアドレス</th>
                  <th>総合進捗</th>
                  <th>クリア題材</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((user) => {
                  const overallProgress = calculateOverallProgress(user.subjects);
                  const clearedCount = user.subjects.filter(s => s.isCleared).length;
                  return (
                    <tr key={user.userId}>
                      <td className="username-cell">
                        <span className="username">{user.username}</span>
                      </td>
                      <td className="email-cell">{user.email}</td>
                      <td className="progress-cell">
                        <div className="progress-bar-mini">
                          <div 
                            className="progress-fill"
                            style={{ width: `${overallProgress}%` }}
                          />
                        </div>
                        <span className="progress-text">{overallProgress}%</span>
                      </td>
                      <td className="cleared-cell">
                        <span className="cleared-badge">
                          {clearedCount} / {user.subjects.length}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <button 
                          className="btn-detail"
                          onClick={() => handleUserClick(user.userId)}
                        >
                          詳細
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="user-detail-view">
          <button className="btn-back" onClick={handleBackToList}>
            ← 一覧に戻る
          </button>
          
          {selectedUser && (
            <>
              <div className="user-info-card">
                <div className="user-avatar">
                  {selectedUser.username.charAt(0).toUpperCase()}
                </div>
                <div className="user-details">
                  <h2>{selectedUser.username}</h2>
                  <p>{selectedUser.email}</p>
                </div>
                <div className="user-stats">
                  <div className="stat">
                    <span className="stat-value">{calculateOverallProgress(selectedUser.subjects)}%</span>
                    <span className="stat-label">総合進捗</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{selectedUser.subjects.filter(s => s.isCleared).length}</span>
                    <span className="stat-label">クリア題材</span>
                  </div>
                </div>
              </div>

              <div className="subjects-progress-list">
                <h3>{progressType === 'assignments' ? '📝 課題題材の進捗' : '📚 通常題材の進捗'}</h3>
                {selectedUser.subjects.length === 0 ? (
                  <div className="empty-state">まだ進捗データがありません</div>
                ) : (
                  <div className="subjects-grid">
                    {selectedUser.subjects.map((subject) => (
                      <div 
                        key={subject.subjectId} 
                        className={`subject-card ${subject.isCleared ? 'cleared' : ''}`}
                      >
                        <div className="subject-header">
                          <span className="subject-title">{subject.title}</span>
                          {subject.isCleared && <span className="cleared-icon">✅</span>}
                        </div>
                        <div className="subject-progress">
                          <div className="progress-bar">
                            <div 
                              className="progress-fill"
                              style={{ width: `${subject.progressPercent}%` }}
                            />
                          </div>
                          <span className="progress-percent">{subject.progressPercent}%</span>
                        </div>
                        <div className="subject-sections">
                          {subject.clearedSections} / {subject.totalSections} セクションクリア
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 両方の進捗を表示するトグル */}
              <div className="other-progress-section">
                <button 
                  className="btn-toggle-other"
                  onClick={() => setProgressType(progressType === 'assignments' ? 'subjects' : 'assignments')}
                >
                  {progressType === 'assignments' ? '📚 通常題材の進捗を見る' : '📝 課題題材の進捗を見る'}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
