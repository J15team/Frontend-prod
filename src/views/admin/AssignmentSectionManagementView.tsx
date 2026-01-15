/**
 * Assignment Section Management View
 * 課題セクション管理ページ（管理者用）
 */
import React, { useState, useEffect, useCallback } from 'react';
import type {
  AssignmentSubject,
  AssignmentSection,
  CreateAssignmentSectionRequest,
  UpdateAssignmentSectionRequest,
  TestCase,
} from '@/models/Assignment';
import {
  getAllAssignmentSubjects,
  getAssignmentSections,
  getAssignmentSectionDetail,
  createAssignmentSection,
  updateAssignmentSection,
  deleteAssignmentSection,
} from '@/services/assignments/AssignmentService';
import { useMemoStorage } from '@/hooks/useMemoStorage';
import { MarkdownPreviewModal } from '@/components/common/MarkdownPreviewModal/MarkdownPreviewModal';
import { MemoModal } from '@/components/common/MemoModal/MemoModal';
import '@/styles/admin/assignment-management.css';

const MEMO_STORAGE_KEY = 'assignment-section-management-memo';

export const AssignmentSectionManagementView: React.FC = () => {
  const [subjects, setSubjects] = useState<AssignmentSubject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [sections, setSections] = useState<AssignmentSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<AssignmentSection | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // メモ帳フック
  const memo = useMemoStorage(MEMO_STORAGE_KEY);

  // モーダル状態
  const [previewContent, setPreviewContent] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const [showMemo, setShowMemo] = useState(false);

  // フォーム状態
  const [formData, setFormData] = useState({
    sectionId: 1,
    title: '',
    description: '',
    hasAssignment: false,
    timeLimit: 2000,
    memoryLimit: 256,
  });
  const [testCases, setTestCases] = useState<TestCase[]>([]);

  const fetchSubjects = useCallback(async () => {
    try {
      const data = await getAllAssignmentSubjects();
      setSubjects(data);
      if (data.length > 0 && !selectedSubjectId) {
        setSelectedSubjectId(data[0].assignmentSubjectId);
      }
    } catch (err) {
      setError('課題題材の取得に失敗しました');
    }
  }, [selectedSubjectId]);

  const fetchSections = useCallback(async () => {
    if (!selectedSubjectId) return;
    try {
      setLoading(true);
      const data = await getAssignmentSections(selectedSubjectId);
      setSections(data);
    } catch (err) {
      setError('セクションの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [selectedSubjectId]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  const resetForm = () => {
    setFormData({
      sectionId: sections.length + 1,
      title: '',
      description: '',
      hasAssignment: false,
      timeLimit: 2000,
      memoryLimit: 256,
    });
    setTestCases([]);
    setEditingSection(null);
    setIsCreating(false);
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingSection(null);
    const maxId = sections.reduce((max, s) => Math.max(max, s.sectionId), 0);
    setFormData({
      sectionId: maxId + 1,
      title: '',
      description: '',
      hasAssignment: false,
      timeLimit: 2000,
      memoryLimit: 256,
    });
    setTestCases([]);
  };

  const handleEdit = async (section: AssignmentSection) => {
    setEditingSection(section);
    setIsCreating(false);
    setFormData({
      sectionId: section.sectionId,
      title: section.title,
      description: section.description || '',
      hasAssignment: section.hasAssignment,
      timeLimit: section.timeLimit || 2000,
      memoryLimit: section.memoryLimit || 256,
    });
    
    // テストケースを詳細APIから取得
    if (selectedSubjectId && section.hasAssignment) {
      try {
        const detail = await getAssignmentSectionDetail(selectedSubjectId, section.sectionId);
        setTestCases(detail.testCases || []);
      } catch (err) {
        console.error('テストケースの取得に失敗:', err);
        setTestCases([]);
      }
    } else {
      setTestCases([]);
    }
  };

  const addTestCase = () => {
    setTestCases([...testCases, { input: '', expected: '', visible: true }]);
  };

  const updateTestCase = (index: number, field: keyof TestCase, value: string | boolean) => {
    const updated = [...testCases];
    updated[index] = { ...updated[index], [field]: value };
    setTestCases(updated);
  };

  const removeTestCase = (index: number) => {
    setTestCases(testCases.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId) return;

    try {
      const testCasesJson = formData.hasAssignment && testCases.length > 0
        ? JSON.stringify(testCases)
        : undefined;

      if (isCreating) {
        const payload: CreateAssignmentSectionRequest = {
          sectionId: formData.sectionId,
          title: formData.title,
          description: formData.description,
          hasAssignment: formData.hasAssignment,
          testCases: testCasesJson,
          timeLimit: formData.hasAssignment ? formData.timeLimit : undefined,
          memoryLimit: formData.hasAssignment ? formData.memoryLimit : undefined,
        };
        await createAssignmentSection(selectedSubjectId, payload);
      } else if (editingSection) {
        const payload: UpdateAssignmentSectionRequest = {
          title: formData.title,
          description: formData.description,
          hasAssignment: formData.hasAssignment,
          testCases: testCasesJson,
          timeLimit: formData.hasAssignment ? formData.timeLimit : undefined,
          memoryLimit: formData.hasAssignment ? formData.memoryLimit : undefined,
        };
        await updateAssignmentSection(selectedSubjectId, editingSection.sectionId, payload);
      }
      resetForm();
      fetchSections();
    } catch (err) {
      setError('保存に失敗しました');
    }
  };

  const handleDelete = async (sectionId: number) => {
    if (!selectedSubjectId || !confirm('本当に削除しますか？')) return;
    try {
      await deleteAssignmentSection(selectedSubjectId, sectionId);
      fetchSections();
    } catch (err) {
      setError('削除に失敗しました');
    }
  };

  return (
    <div className="assignment-management">
      <div className="management-header">
        <h1>
          課題セクション管理
          <span className="beta-badge">Beta</span>
        </h1>
        <div className="header-controls">
          <select
            value={selectedSubjectId || ''}
            onChange={(e) => setSelectedSubjectId(Number(e.target.value))}
            className="subject-select"
          >
            {subjects.map((s) => (
              <option key={s.assignmentSubjectId} value={s.assignmentSubjectId}>
                {s.title}
              </option>
            ))}
          </select>
          <button className="btn-create btn-create-assignment" onClick={handleCreate} disabled={!selectedSubjectId}>
            + 新規作成
          </button>
          <button className="btn-preview" onClick={() => {
            setPreviewContent(formData.description);
            setShowPreview(true);
          }}>
            👁️ プレビュー
          </button>
          <button className="btn-memo" onClick={() => setShowMemo(true)}>
            📒 メモ帳
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* フォーム */}
      {(isCreating || editingSection) && (
        <div className="form-container">
          <h2>{isCreating ? '新規作成' : '編集'}</h2>
          <form onSubmit={handleSubmit}>
            {isCreating && (
              <div className="form-group">
                <label>セクションID</label>
                <input
                  type="number"
                  value={formData.sectionId}
                  onChange={(e) => setFormData({ ...formData, sectionId: Number(e.target.value) })}
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
              <button
                type="button"
                className="btn-preview-small"
                onClick={() => {
                  setPreviewContent(formData.description);
                  setShowPreview(true);
                }}
              >
                👁️ プレビュー
              </button>
            </div>
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.hasAssignment}
                  onChange={(e) => setFormData({ ...formData, hasAssignment: e.target.checked })}
                />
                課題あり
              </label>
            </div>

            {formData.hasAssignment && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label>制限時間 (ms)</label>
                    <input
                      type="number"
                      value={formData.timeLimit}
                      onChange={(e) => setFormData({ ...formData, timeLimit: Number(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label>メモリ制限 (MB)</label>
                    <input
                      type="number"
                      value={formData.memoryLimit}
                      onChange={(e) => setFormData({ ...formData, memoryLimit: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="test-cases-editor">
                  <h3>テストケース</h3>
                  <div className="test-case-example">
                    <details>
                      <summary>📝 入力例を見る</summary>
                      <div className="example-content">
                        <p><strong>パターン1: 単一の値</strong></p>
                        <pre>{`入力: 5
期待出力: 10

/* 整数を入力し、2倍にして出力 */
int n;
scanf("%d", &n);
printf("%d\\n", n * 2);
`}</pre>
                        <p><strong>パターン2: 複数の値（スペース区切り）</strong></p>
                        <pre>{`入力: 3 5
期待出力: 8

/* 2つの整数を入力し、合計を出力 */
int a, b;
scanf("%d %d", &a, &b);
printf("%d\\n", a + b);
`}</pre>
                        <p><strong>パターン3: 配列（長さ + 要素）</strong></p>
                        <pre>{`入力: 5
1 2 3 4 5
期待出力: 15

/* N個の整数を入力し、合計を出力 */
int n;
scanf("%d", &n);
int sum = 0;
for (int i = 0; i < n; i++) {
    int x;
    scanf("%d", &x);
    sum += x;
}
printf("%d\\n", sum);
`}</pre>
                        <p><strong>パターン4: 入力なし</strong></p>
                        <pre>{`入力: (空)
期待出力: Hello, World!

printf("Hello, World!\\n");
`}</pre>
                      </div>
                    </details>
                  </div>
                  {testCases.map((tc, index) => (
                    <div key={index} className="test-case-form">
                      <div className="test-case-header">
                        <span>テストケース {index + 1}</span>
                        <button type="button" onClick={() => removeTestCase(index)}>✕</button>
                      </div>
                      <div className="form-group">
                        <label>入力</label>
                        <textarea
                          value={tc.input}
                          onChange={(e) => updateTestCase(index, 'input', e.target.value)}
                          rows={2}
                        />
                      </div>
                      <div className="form-group">
                        <label>期待出力</label>
                        <textarea
                          value={tc.expected}
                          onChange={(e) => updateTestCase(index, 'expected', e.target.value)}
                          rows={2}
                        />
                      </div>
                      <div className="form-group checkbox-group">
                        <label>
                          <input
                            type="checkbox"
                            checked={tc.visible}
                            onChange={(e) => updateTestCase(index, 'visible', e.target.checked)}
                          />
                          公開（ユーザーに表示）
                        </label>
                      </div>
                    </div>
                  ))}
                  <button type="button" className="btn-add-testcase" onClick={addTestCase}>
                    + テストケース追加
                  </button>
                </div>
              </>
            )}

            <div className="form-actions">
              <button type="submit" className="btn-save btn-save-assignment">保存</button>
              <button type="button" className="btn-cancel btn-secondary-subject" onClick={resetForm}>キャンセル</button>
            </div>
          </form>
        </div>
      )}

      {/* 一覧 */}
      {loading ? (
        <div className="loading">読み込み中...</div>
      ) : (
        <div className="subjects-table-container">
          <table className="subjects-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>タイトル</th>
                <th>説明</th>
                <th>課題</th>
                <th>制限時間</th>
                <th>メモリ</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {sections.map((section) => (
                <tr key={section.sectionId}>
                  <td>{section.sectionId}</td>
                  <td>{section.title}</td>
                  <td className="description-cell">{section.description}</td>
                  <td>{section.hasAssignment ? '📝 あり' : '-'}</td>
                  <td>{section.timeLimit ? `${section.timeLimit}ms` : '-'}</td>
                  <td>{section.memoryLimit ? `${section.memoryLimit}MB` : '-'}</td>
                  <td className="actions-cell">
                    <button className="btn-edit btn-edit-assignment" onClick={() => handleEdit(section)}>編集</button>
                    <button className="btn-delete btn-delete-assignment" onClick={() => handleDelete(section.sectionId)}>削除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* モーダル */}
      <MarkdownPreviewModal
        isOpen={showPreview}
        content={previewContent}
        onClose={() => setShowPreview(false)}
      />

      <MemoModal
        isOpen={showMemo}
        content={memo.content}
        saved={memo.saved}
        onContentChange={memo.setContent}
        onSave={memo.save}
        onClear={memo.clear}
        onClose={() => setShowMemo(false)}
      />
    </div>
  );
};
