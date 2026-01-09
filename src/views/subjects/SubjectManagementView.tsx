/**
 * Subject Management View
 * 題材作成/更新/削除のフォーム
 */
import React, { useEffect, useState } from 'react';
import { useSubjectManagementViewModel } from '@/viewmodels/useSubjectManagementViewModel';

interface SubjectFormState {
  subjectId: string;
  title: string;
  description: string;
  maxSections: string;
  weight: string;
}

interface SubjectUpdateFormState {
  title: string;
  description: string;
  maxSections: string;
  weight: string;
}

const StarRating: React.FC<{ weight: number }> = ({ weight }) => {
  const stars = [];
  for (let i = 0; i < 5; i++) {
    stars.push(
      <span key={i} style={{ color: i < weight ? '#ffc107' : '#e0e0e0' }}>
        ★
      </span>
    );
  }
  return <span className="star-rating">{stars}</span>;
};

export const SubjectManagementView: React.FC = () => {
  const {
    subjects,
    loading,
    error,
    success,
    createSubjectItem,
    updateSubjectItem,
    deleteSubjectItem,
  } = useSubjectManagementViewModel();

  const [createForm, setCreateForm] = useState<SubjectFormState>({
    subjectId: '',
    title: '',
    description: '',
    maxSections: '1',
    weight: '1',
  });
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [updateForm, setUpdateForm] = useState<SubjectUpdateFormState>({
    title: '',
    description: '',
    maxSections: '1',
    weight: '1',
  });

  useEffect(() => {
    if (!selectedSubjectId) {
      setUpdateForm({ title: '', description: '', maxSections: '1', weight: '1' });
      return;
    }
    const subject = subjects.find((item) => item.subjectId === Number(selectedSubjectId));
    if (subject) {
      setUpdateForm({
        title: subject.title,
        description: subject.description,
        maxSections: String(subject.maxSections),
        weight: String(subject.weight),
      });
    }
  }, [selectedSubjectId, subjects]);

  const handleCreateSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await createSubjectItem({
      subjectId: Number(createForm.subjectId),
      title: createForm.title,
      description: createForm.description,
      maxSections: Number(createForm.maxSections),
      weight: Number(createForm.weight),
    });
    setCreateForm({ subjectId: '', title: '', description: '', maxSections: '1', weight: '1' });
  };

  const handleUpdateSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedSubjectId) return;
    await updateSubjectItem(Number(selectedSubjectId), {
      title: updateForm.title,
      description: updateForm.description,
      maxSections: Number(updateForm.maxSections),
      weight: Number(updateForm.weight),
    });
  };

  const handleDelete = async () => {
    if (!selectedSubjectId) return;
    await deleteSubjectItem(Number(selectedSubjectId));
    setSelectedSubjectId('');
  };

  return (
    <div className="management-container">
      <h1>題材管理</h1>
      <p>
        <code>/api/subjects</code> 系エンドポイントに対応した管理画面です。管理者トークンを所持した状態で実行してください。
      </p>
      {success && <div className="success-message">{success}</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="management-grid">
        <div className="management-card">
          <h2>題材作成 (POST /api/subjects)</h2>
          <form className="management-form" onSubmit={handleCreateSubmit}>
            <label>
              題材ID
              <input
                type="number"
                min="1"
                value={createForm.subjectId}
                onChange={(e) =>
                  setCreateForm({ ...createForm, subjectId: e.target.value })
                }
                required
              />
            </label>
            <label>
              タイトル
              <input
                type="text"
                value={createForm.title}
                onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                required
              />
            </label>
            <label>
              説明
              <textarea
                value={createForm.description}
                onChange={(e) =>
                  setCreateForm({ ...createForm, description: e.target.value })
                }
              />
            </label>
            <label>
              最大セクション数
              <input
                type="number"
                min="1"
                max="1000"
                value={createForm.maxSections}
                onChange={(e) =>
                  setCreateForm({ ...createForm, maxSections: e.target.value })
                }
                required
              />
            </label>
            <label>
              重み（1〜5）
              <input
                type="number"
                min="1"
                max="5"
                value={createForm.weight}
                onChange={(e) =>
                  setCreateForm({ ...createForm, weight: e.target.value })
                }
                required
              />
            </label>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? '送信中...' : '題材を作成'}
            </button>
          </form>
        </div>

        <div className="management-card">
          <h2>題材更新/削除</h2>
          <form className="management-form" onSubmit={handleUpdateSubmit}>
            <label>
              編集する題材
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
              >
                <option value="">選択してください</option>
                {subjects.map((subject) => (
                  <option key={subject.subjectId} value={subject.subjectId}>
                    #{subject.subjectId} {subject.title}
                  </option>
                ))}
              </select>
            </label>
            <label>
              タイトル
              <input
                type="text"
                value={updateForm.title}
                onChange={(e) =>
                  setUpdateForm({ ...updateForm, title: e.target.value })
                }
                required
              />
            </label>
            <label>
              説明
              <textarea
                value={updateForm.description}
                onChange={(e) =>
                  setUpdateForm({ ...updateForm, description: e.target.value })
                }
              />
            </label>
            <label>
              最大セクション数
              <input
                type="number"
                min="1"
                max="1000"
                value={updateForm.maxSections}
                onChange={(e) =>
                  setUpdateForm({ ...updateForm, maxSections: e.target.value })
                }
                required
              />
            </label>
            <label>
              重み（1〜5）
              <input
                type="number"
                min="1"
                max="5"
                value={updateForm.weight}
                onChange={(e) =>
                  setUpdateForm({ ...updateForm, weight: e.target.value })
                }
                required
              />
            </label>
            <div className="management-actions">
              <button type="submit" className="btn-primary" disabled={loading || !selectedSubjectId}>
                {loading ? '更新中...' : '題材を更新'}
              </button>
              <button
                type="button"
                className="btn-secondary"
                disabled={!selectedSubjectId || loading}
                onClick={handleDelete}
              >
                削除
              </button>
            </div>
          </form>
        </div>
      </div>

      <section className="data-section">
        <h2>登録済み題材 (GET /api/subjects)</h2>
        <div className="data-table">
          <div className="data-table-header">
            <span>ID</span>
            <span>タイトル</span>
            <span>重み</span>
            <span>最大セクション</span>
            <span>作成日</span>
          </div>
          {[...subjects].sort((a, b) => b.weight - a.weight).map((subject) => (
            <div key={subject.subjectId} className="data-table-row">
              <span>#{subject.subjectId}</span>
              <span>{subject.title}</span>
              <span><StarRating weight={subject.weight} /></span>
              <span>{subject.maxSections}</span>
              <span>{subject.createdAt ? new Date(subject.createdAt).toLocaleString() : '-'}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
