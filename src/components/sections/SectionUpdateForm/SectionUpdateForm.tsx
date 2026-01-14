/**
 * SectionUpdateForm
 * セクション更新/削除フォームコンポーネント
 */
import React from 'react';
import { type Section } from '@/models/Section';

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
        <label>
          タイトル
          <input
            type="text"
            value={formData.title}
            onChange={(e) => onFormChange({ ...formData, title: e.target.value })}
            required
          />
        </label>
        <label>
          説明
          <textarea
            value={formData.description}
            onChange={(e) =>
              onFormChange({ ...formData, description: e.target.value })
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
              onFormChange({ ...formData, image: e.target.files?.[0] ?? null })
            }
          />
        </label>

        {selectedSection && (
          <div className="image-status">
            <p>現在の画像: {selectedSection.images?.length ?? 0}件</p>
            {selectedSection.images && selectedSection.images.length > 0 ? (
              <ul className="image-list">
                {selectedSection.images.map((image) => (
                  <li key={image.imageId}>
                    <div className="image-list-row">
                      <span className="image-label">画像ID: {image.imageId}</span>
                      <a href={image.imageUrl} target="_blank" rel="noreferrer">
                        新しいタブで開く
                      </a>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => onCopyLink(image.imageUrl)}
                      >
                        リンクをコピー
                      </button>
                      <button
                        type="button"
                        className="btn-danger"
                        disabled={loading}
                        onClick={() => onDeleteImage(image.imageId)}
                      >
                        画像を削除
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>画像は登録されていません</p>
            )}
          </div>
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
