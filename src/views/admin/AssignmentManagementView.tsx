/**
 * Assignment Management View
 * 課題題材管理ページ（管理者用）
 */
import React, { useState, useEffect, useCallback } from 'react';
import type {
  AssignmentSubject,
  CreateAssignmentSubjectRequest,
  UpdateAssignmentSubjectRequest,
} from '@/models/Assignment';
import {
  getAllAssignmentSubjects,
  createAssignmentSubject,
  updateAssignmentSubject,
  deleteAssignmentSubject,
} from '@/services/assignments/AssignmentService';
import '@/styles/admin/assignment-management.css';

export const AssignmentManagementView: React.FC = () => {
  const [subjects, setSubjects] = useState<AssignmentSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSubject, setEditingSubject] = useState<AssignmentSubject | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // フォーム状態
  const [formData, setFormData] = useState({
    assignmentSubjectId: 0,
    title: '',
    description: '',
    maxSections: 1,
    weight: 1,
  });

  const fetchSubjects = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllAssignmentSubjects();
      setSubjects(data);
    } catch (err) {
      setError('課題題材の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const resetForm = () => {
    setFormData({
      assignmentSubjectId: 0,
      title: '',
      description: '',
      maxSections: 1,
      weight: 1,
    });
    setEditingSubject(null);
    setIsCreating(false);
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingSubject(null);
    // 次のIDを自動設定
    const maxId = subjects.reduce((max, s) => Math.max(max, s.assignmentSubjectId), 0);
    setFormData({
      assignmentSubjectId: maxId + 1,
      title: '',
      description: '',
      maxSections: 1,
      weight: 1,
    });
  };

  const handleEdit = (subject: AssignmentSubject) => {
    setEditingSubject(subject);
    setIsCreating(false);
    setFormData({
      assignmentSubjectId: subject.assignmentSubjectId,
      title: subject.title,
      description: subject.description || '',
      maxSections: subject.maxSections,
      weight: subject.weight || 1,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isCreating) {
        const payload: CreateAssignmentSubjectRequest = {
          assignmentSubjectId: formData.assignmentSubjectId,
          title: formData.title,
          description: formData.description,
          maxSections: formData.maxSections,
          weight: formData.weight,
        };
        await createAssignmentSubject(payload);
      } else if (editingSubject) {
        const payload: UpdateAssignmentSubjectRequest = {
          title: formData.title,
          description: formData.description,
          maxSections: formData.maxSections,
          weight: formData.weight,
        };
        await updateAssignmentSubject(editingSubject.assignmentSubjectId, payload);
      }
      resetForm();
      fetchSubjects();
    } catch (err) {
      setError('保存に失敗しました');
    }
  };

  const handleDelete = async (subjectId: number) => {
    if (!confirm('本当に削除しますか？')) return;
    try {
      await deleteAssignmentSubject(subjectId);
      fetchSubjects();
    } catch (err) {
      setError('削除に失敗しました');
    }
  };

  if (loading) {
    return <div className="loading">読み込み中...</div>;
  }

  return (
    <div className="assignment-management">
      <div className="management-header">
        <h1>
          課題題材管理
          <span className="beta-badge">Beta</span>
        </h1>
        <button className="btn-create btn-create-assignment" onClick={handleCreate}>
          + 新規作成
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* フォーム */}
      {(isCreating || editingSubject) && (
        <div className="form-container">
          <h2>{isCreating ? '新規作成' : '編集'}</h2>
          <form onSubmit={handleSubmit}>
            {isCreating && (
              <div className="form-group">
                <label>課題題材ID</label>
                <input
                  type="number"
                  value={formData.assignmentSubjectId}
                  onChange={(e) => setFormData({ ...formData, assignmentSubjectId: Number(e.target.value) })}
                  required
                />
              </div>
            )}
            <div className="form-group">
              <label>タイトル</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>説明</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>最大セクション数</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={formData.maxSections}
                  onChange={(e) => setFormData({ ...formData, maxSections: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="form-group">
                <label>難易度 (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-save btn-save-assignment">保存</button>
              <button type="button" className="btn-cancel btn-secondary-subject" onClick={resetForm}>キャンセル</button>
            </div>
          </form>
        </div>
      )}

      {/* 一覧 */}
      <div className="subjects-table-container">
        <table className="subjects-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>タイトル</th>
              <th>説明</th>
              <th>セクション数</th>
              <th>難易度</th>
              <th>作成日</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((subject) => (
              <tr key={subject.assignmentSubjectId}>
                <td>{subject.assignmentSubjectId}</td>
                <td>{subject.title}</td>
                <td className="description-cell">{subject.description}</td>
                <td>{subject.maxSections}</td>
                <td>{'★'.repeat(subject.weight || 1)}</td>
                <td>{subject.createdAt ? new Date(subject.createdAt).toLocaleDateString() : '-'}</td>
                <td className="actions-cell">
                  <button className="btn-edit btn-edit-assignment" onClick={() => handleEdit(subject)}>編集</button>
                  <button className="btn-delete btn-delete-assignment" onClick={() => handleDelete(subject.assignmentSubjectId)}>削除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
