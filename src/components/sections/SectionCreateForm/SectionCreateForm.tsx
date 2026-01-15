/**
 * SectionCreateForm
 * セクション作成フォームコンポーネント
 * 共通FormFieldsを使用してDRY原則に準拠
 */
import React, { useState } from 'react';
import {
  TextInput,
  DescriptionField,
  ImageUpload,
  SubmitButton,
} from '@/components/common/FormFields/FormFields';

interface SectionFormData {
  sectionId: string;
  title: string;
  description: string;
  image: File | null;
}

interface SectionCreateFormProps {
  loading: boolean;
  disabled: boolean;
  onSubmit: (data: SectionFormData) => Promise<void>;
  onPreview: (content: string) => void;
  onOpenMemo: () => void;
}

const INITIAL_FORM_DATA: SectionFormData = {
  sectionId: '',
  title: '',
  description: '',
  image: null,
};

export const SectionCreateForm: React.FC<SectionCreateFormProps> = ({
  loading,
  disabled,
  onSubmit,
  onPreview,
  onOpenMemo,
}) => {
  const [formData, setFormData] = useState<SectionFormData>(INITIAL_FORM_DATA);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    setFormData(INITIAL_FORM_DATA);
  };

  const updateField = <K extends keyof SectionFormData>(
    key: K,
    value: SectionFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="management-card">
      <h2>セクション作成 (POST)</h2>
      <form className="management-form" onSubmit={handleSubmit}>
        <TextInput
          label="セクションID"
          type="number"
          value={formData.sectionId}
          onChange={(v) => updateField('sectionId', v)}
          required
          min={0}
          max={100}
        />
        <TextInput
          label="タイトル"
          value={formData.title}
          onChange={(v) => updateField('title', v)}
          required
        />
        <DescriptionField
          label="説明 (Markdown可)"
          value={formData.description}
          onChange={(v) => updateField('description', v)}
          onPreview={onPreview}
          onOpenMemo={onOpenMemo}
        />
        <ImageUpload onChange={(file) => updateField('image', file)} />
        <SubmitButton
          loading={loading}
          disabled={disabled}
          loadingText="送信中..."
          defaultText="作成"
        />
      </form>
    </div>
  );
};
