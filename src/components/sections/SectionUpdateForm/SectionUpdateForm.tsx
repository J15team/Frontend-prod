/**
 * SectionUpdateForm
 * セクション更新/削除フォームコンポーネント
 * 共通FormFieldsを使用してDRY原則に準拠
 */
import React from 'react';
import { type Section } from '@/models/Section';
import {
  TextInput,
  DescriptionField,
  ImageUpload,
} from '@/components/common/FormFields/FormFields';
import { ImageList } from './ImageList';

interface SectionUpdateFormData {
  title: string;
  description: string;
  image: File | null;
}

interface SectionUpdateFormProps {
  sections: Section[];
  selectedSectionId: string;
  selectedSection: Section | null;
  formData: SectionUpdateFormData;
  loading: boolean;
  onSectionSelect: (sectionId: string) => void;
  onFormChange: (data: SectionUpdateFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onDelete: () => void;
  onDeleteImage: (imageId: number) => void;
  onCopyLink: (imageUrl: string) => void;
  onPreview: (content: string) => void;
  onOpenMemo: () => void;
}

export const SectionUpdateForm: React.FC<SectionUpdateFormProps> = ({
  sections,
  selectedSectionId,
  selectedSection,
  formData,
  loading,
  onSectionSelect,
  onFormChange,
  onSubmit,
  onDelete,
  onDeleteImage,
  onCopyLink,
  onPreview,
  onOpenMemo,
}) => {
  const updateField = <K extends keyof SectionUpdateFormData>(
    key: K,
    value: SectionUpdateFormData[K]
  ) => {
    onFormChange({ ...formData, [key]: value });
  };

  return (
    <div className="management-card">
      <h2>セクション更新/削除</h2>
      <form className="management-form" onSubmit={onSubmit}>
        <label>
          編集するセクション
          <select
            value={selectedSectionId}
            onChange={(e) => onSectionSelect(e.target.value)}
          >
            <option value="">選択してください</option>
            {sections.map((section) => (
              <option key={section.sectionId} value={section.sectionId}>
                #{section.sectionId} {section.title}
              </option>
            ))}
          </select>
        </label>

        <TextInput
          label="タイトル"
          value={formData.title}
          onChange={(v) => updateField('title', v)}
          required
        />

        <DescriptionField
          value={formData.description}
          onChange={(v) => updateField('description', v)}
          onPreview={onPreview}
          onOpenMemo={onOpenMemo}
        />

        <ImageUpload onChange={(file) => updateField('image', file)} />

        {selectedSection && (
          <ImageList
            images={selectedSection.images ?? []}
            loading={loading}
            onDeleteImage={onDeleteImage}
            onCopyLink={onCopyLink}
          />
        )}

        <div className="management-actions">
          <button
            type="submit"
            className="btn-primary"
            disabled={loading || !selectedSectionId}
          >
            {loading ? '更新中...' : '更新'}
          </button>
          <button
            type="button"
            className="btn-secondary"
            disabled={loading || !selectedSectionId}
            onClick={onDelete}
          >
            削除
          </button>
        </div>
      </form>
    </div>
  );
};
