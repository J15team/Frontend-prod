/**
 * Tag Management View
 * タグ作成/削除と題材へのタグ付与管理
 */
import React, { useState, useEffect } from 'react';
import { useTagManagementViewModel } from '@/viewmodels/admin/useTagManagementViewModel';
import { CopyableCode } from '@/components/common/CopyableCode';

export const TagManagementView: React.FC = () => {
  const {
    tags,
    subjects,
    subjectTags,
    loading,
    error,
    success,
    searchQuery,
    setSearchQuery,
    createTag,
    deleteTag,
    addTagToSubject,
    removeTagFromSubject,
    fetchSubjectTags,
  } = useTagManagementViewModel();

  const [newTagName, setNewTagName] = useState('');
  const [newTagType, setNewTagType] = useState<'NORMAL' | 'PREMIUM'>('NORMAL');
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [selectedTagToAdd, setSelectedTagToAdd] = useState('');

  useEffect(() => {
    if (selectedSubjectId) {
      fetchSubjectTags(selectedSubjectId);
    }
  }, [selectedSubjectId, fetchSubjectTags]);

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    await createTag({ name: newTagName.trim(), type: newTagType });
    setNewTagName('');
  };

  const handleDeleteTag = async (tagId: number) => {
    if (!confirm('このタグを削除しますか？関連する全ての題材からも削除されます。')) return;
    await deleteTag(tagId);
  };

  const handleAddTagToSubject = async () => {
    if (!selectedSubjectId || !selectedTagToAdd) return;
    await addTagToSubject(selectedSubjectId, selectedTagToAdd);
    setSelectedTagToAdd('');
  };

  const handleRemoveTagFromSubject = async (tagName: string) => {
    if (!selectedSubjectId) return;
    await removeTagFromSubject(selectedSubjectId, tagName);
  };

  const currentSubjectTags = selectedSubjectId ? subjectTags[selectedSubjectId] || [] : [];
  const availableTags = tags.filter(
    tag => !currentSubjectTags.some(st => st.id === tag.id)
  );

  return (
    <div className="management-container">
      <h1>タグ管理</h1>
      <p>
        <CopyableCode>/api/tags</CopyableCode> 系エンドポイントに対応した管理画面です。
      </p>

      {success && <div className="success-message">{success}</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="management-grid">
        {/* タグ作成 */}
        <div className="management-card">
          <h2>タグ作成 (POST /api/tags)</h2>
          <form className="management-form" onSubmit={handleCreateTag}>
            <label>
              タグ名
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="例: Kotlin"
                maxLength={50}
                required
              />
            </label>
            <label>
              タイプ
              <select
                value={newTagType}
                onChange={(e) => setNewTagType(e.target.value as 'NORMAL' | 'PREMIUM')}
              >
                <option value="NORMAL">NORMAL</option>
                <option value="PREMIUM">PREMIUM</option>
              </select>
            </label>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? '作成中...' : 'タグを作成'}
            </button>
          </form>
        </div>

        {/* 題材へのタグ付与 */}
        <div className="management-card">
          <h2>題材にタグを付与</h2>
          <div className="management-form">
            <label>
              題材を選択
              <select
                value={selectedSubjectId || ''}
                onChange={(e) => setSelectedSubjectId(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">選択してください</option>
                {subjects.map((subject) => (
                  <option key={subject.subjectId} value={subject.subjectId}>
                    #{subject.subjectId} {subject.title}
                  </option>
                ))}
              </select>
            </label>

            {selectedSubjectId && (
              <>
                <div className="current-tags">
                  <span className="label">現在のタグ:</span>
                  <div className="tag-list">
                    {currentSubjectTags.length === 0 ? (
                      <span className="no-tags">タグなし</span>
                    ) : (
                      currentSubjectTags.map((tag) => (
                        <span key={tag.id} className="tag-badge">
                          {tag.displayName}
                          <button
                            className="tag-remove-btn"
                            onClick={() => handleRemoveTagFromSubject(tag.name)}
                            title="削除"
                          >
                            ×
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>

                <label>
                  追加するタグ
                  <select
                    value={selectedTagToAdd}
                    onChange={(e) => setSelectedTagToAdd(e.target.value)}
                  >
                    <option value="">選択してください</option>
                    {availableTags.map((tag) => (
                      <option key={tag.id} value={tag.name}>
                        {tag.displayName}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleAddTagToSubject}
                  disabled={loading || !selectedTagToAdd}
                >
                  タグを追加
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* タグ一覧 */}
      <section className="data-section">
        <h2>登録済みタグ (GET /api/tags)</h2>
        <div className="search-bar">
          <input
            type="text"
            placeholder="タグを検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="data-table">
          <div className="data-table-header">
            <span>ID</span>
            <span>タグ名</span>
            <span>表示名</span>
            <span>タイプ</span>
            <span>作成日</span>
            <span>操作</span>
          </div>
          {tags.map((tag) => (
            <div key={tag.id} className="data-table-row">
              <span>#{tag.id}</span>
              <span>{tag.name}</span>
              <span>{tag.displayName}</span>
              <span className={`tag-type ${tag.type.toLowerCase()}`}>{tag.type}</span>
              <span>{new Date(tag.createdAt).toLocaleString()}</span>
              <span>
                <button
                  className="btn-danger-small"
                  onClick={() => handleDeleteTag(tag.id)}
                  disabled={loading}
                >
                  削除
                </button>
              </span>
            </div>
          ))}
          {tags.length === 0 && (
            <div className="data-table-empty">
              {searchQuery ? '検索結果がありません' : 'タグがありません'}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
