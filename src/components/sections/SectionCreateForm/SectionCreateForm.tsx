/**
 * SectionCreateForm
 * セクション作成フォームコンポーネント
 */
import React, { useState } from 'react';

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

export const SectionCreateForm: React.FC<SectionCreateFormProps> = ({
  loading,
  disabled,
  onSubmit,
  onPreview,
  onOpenMemo,
}) => {
  const [formData, setFormData] = useState<SectionFormData>({
    sectionId: '',
    title: '',
    description: '',
    image: null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    setFormData({ sectionId: '', title: '', description: '', image: null });
  };

  return (
    <div className="management-card">
      <h2>セクション作成 (POST)</h2>
      <form className="management-form" onSubmit={handleSubmit}>
        <label>
          セクションID
          <input
            type="number"
            min="0"
            max="100"
            value={formData.sectionId}
            onChange={(e) =>
              setFormData({ ...formData, sectionId: e.target.value })
            }
            required
          />
        </label>
        <label>
          タイトル
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </label>
        <label>
          説明 (Markdown可)
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
          <button
            type="button"
            className="btn-preview"
            onClick={() => onPreview(formData.description)}
            disabled={!formData.description}
          >
            👁️ プレビュー
          </button>
          <button
            type="button"
            className="btn-memo"
            onClick={onOpenMemo}
          >
            📝 メモ帳
          </button>
        </label>
        <label>
          画像ファイル (任意)
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setFormData({ ...formData, image: e.target.files?.[0] ?? null })
            }
          />
        </label>
        <button type="submit" className="btn-primary" disabled={loading || disabled}>
          {loading ? '送信中...' : '作成'}
        </button>
      </form>
    </div>
  );
};
