/**
 * Section Management View
 * セクション一覧、作成、更新、削除
 */
import React, { useEffect, useState } from 'react';
import { useSectionManagementViewModel } from '@/viewmodels/sections/useSectionManagementViewModel';
import { useMemoStorage } from '@/hooks/useMemoStorage';
import { type Section } from '@/models/Section';

// コンポーネント
import { SectionCreateForm } from '@/components/sections/SectionCreateForm/SectionCreateForm';
import { SectionUpdateForm } from '@/components/sections/SectionUpdateForm/SectionUpdateForm';
import { SectionListTable } from '@/components/sections/SectionListTable/SectionListTable';
import { MarkdownPreviewModal } from '@/components/common/MarkdownPreviewModal/MarkdownPreviewModal';
import { MemoModal } from '@/components/common/MemoModal/MemoModal';

interface SectionUpdateFormState {
  title: string;
  description: string;
  image: File | null;
}

const MEMO_STORAGE_KEY = 'section-management-memo';

export const SectionManagementView: React.FC = () => {
  const {
    subjects,
    sections,
    loading,
    error,
    success,
    fetchSubjects,
    fetchSections,
    loadSectionDetail,
    createSectionItem,
    updateSectionItem,
    deleteSectionItem,
    removeSectionImage,
  } = useSectionManagementViewModel();

  // メモ帳フック
  const memo = useMemoStorage(MEMO_STORAGE_KEY);

  // ローカル状態
  const [subjectId, setSubjectId] = useState<string>('');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [updateForm, setUpdateForm] = useState<SectionUpdateFormState>({
    title: '',
    description: '',
    image: null,
  });

  // モーダル状態
  const [previewContent, setPreviewContent] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const [showMemo, setShowMemo] = useState(false);

  // 初期ロード時に題材一覧を取得
  useEffect(() => {
    fetchSubjects();
  }, []);

  // 選択中のセクションを最新に保つ
  useEffect(() => {
    if (!selectedSectionId) return;
    const latestSection = sections.find(
      (section) => section.sectionId === Number(selectedSectionId)
    );
    if (latestSection) {
      setSelectedSection(latestSection);
    }
  }, [sections, selectedSectionId]);

  const handleSubjectChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSubjectId = event.target.value;
    setSubjectId(newSubjectId);
    setSelectedSectionId('');
    setSelectedSection(null);
    if (newSubjectId) {
      await fetchSections(Number(newSubjectId));
    }
  };

  const handleSectionSelect = async (sectionIdValue: string) => {
    setSelectedSectionId(sectionIdValue);
    if (!subjectId || !sectionIdValue) {
      setUpdateForm({ title: '', description: '', image: null });
      setSelectedSection(null);
      return;
    }
    const detail = await loadSectionDetail(Number(subjectId), Number(sectionIdValue));
    if (detail) {
      setUpdateForm({
        title: detail.title,
        description: detail.description,
        image: null,
      });
      setSelectedSection(detail);
    }
  };

  const handleCreateSubmit = async (data: {
    sectionId: string;
    title: string;
    description: string;
    image: File | null;
  }) => {
    if (!subjectId) return;
    await createSectionItem(Number(subjectId), {
      sectionId: Number(data.sectionId),
      title: data.title,
      description: data.description,
      image: data.image,
    });
  };

  const handleUpdateSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!subjectId || !selectedSectionId) return;
    await updateSectionItem(Number(subjectId), Number(selectedSectionId), {
      title: updateForm.title,
      description: updateForm.description,
      image: updateForm.image,
    });
    setUpdateForm({ ...updateForm, image: null });
  };

  const handleDelete = async () => {
    if (!subjectId || !selectedSectionId) return;
    await deleteSectionItem(Number(subjectId), Number(selectedSectionId));
    setSelectedSectionId('');
    setSelectedSection(null);
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!subjectId || !selectedSectionId) return;
    await removeSectionImage(Number(subjectId), Number(selectedSectionId), imageId);
    await handleSectionSelect(selectedSectionId);
  };

  const handleCopyLink = async (imageUrl: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(imageUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = imageUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      alert('画像URLをコピーしました');
    } catch (error) {
      console.error('コピーに失敗しました', error);
      alert('コピーに失敗しました');
    }
  };

  const handlePreview = (content: string) => {
    setPreviewContent(content);
    setShowPreview(true);
  };

  return (
    <div className="management-container">
      <h1>セクション管理</h1>
      <p>
        multipart/form-dataで画像をアップロード可能な <code>/api/subjects/{'{'}subjectId{'}'}/sections</code> 系エンドポイントを操作できます。
      </p>
      {success && <div className="success-message">{success}</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="management-form inline-form">
        <label>
          題材を選択
          <select
            value={subjectId}
            onChange={handleSubjectChange}
            disabled={loading}
          >
            <option value="">題材を選択してください</option>
            {subjects.map((subject) => (
              <option key={subject.subjectId} value={subject.subjectId}>
                {subject.subjectId}: {subject.title}
              </option>
            ))}
          </select>
        </label>
        {loading && <span className="loading-indicator">読み込み中...</span>}
      </div>

      <div className="management-grid">
        <SectionCreateForm
          loading={loading}
          disabled={!subjectId}
          onSubmit={handleCreateSubmit}
          onPreview={handlePreview}
          onOpenMemo={() => setShowMemo(true)}
        />

        <SectionUpdateForm
          sections={sections}
          selectedSectionId={selectedSectionId}
          selectedSection={selectedSection}
          formData={updateForm}
          loading={loading}
          onSectionSelect={handleSectionSelect}
          onFormChange={setUpdateForm}
          onSubmit={handleUpdateSubmit}
          onDelete={handleDelete}
          onDeleteImage={handleDeleteImage}
          onCopyLink={handleCopyLink}
          onPreview={handlePreview}
          onOpenMemo={() => setShowMemo(true)}
        />
      </div>

      <SectionListTable sections={sections} />

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
