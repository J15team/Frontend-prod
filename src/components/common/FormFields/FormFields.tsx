/**
 * FormFields
 * 再利用可能なフォームフィールドコンポーネント群
 * DRY原則に従い、SectionCreateForm/SectionUpdateFormの共通部分を抽出
 */
import React from 'react';

// ===== 基本フィールド =====

interface TextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'number';
  required?: boolean;
  min?: number;
  max?: number;
  placeholder?: string;
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  min,
  max,
  placeholder,
}) => (
  <label>
    {label}
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      min={min}
      max={max}
      placeholder={placeholder}
    />
  </label>
);

// ===== テキストエリア with アクションボタン =====

interface DescriptionFieldProps {
  value: string;
  onChange: (value: string) => void;
  onPreview: (content: string) => void;
  onOpenMemo: () => void;
  label?: string;
  placeholder?: string;
}

export const DescriptionField: React.FC<DescriptionFieldProps> = ({
  value,
  onChange,
  onPreview,
  onOpenMemo,
  label = '説明',
  placeholder,
}) => (
  <label>
    {label}
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
    <button
      type="button"
      className="btn-preview"
      onClick={() => onPreview(value)}
      disabled={!value}
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
);

// ===== 画像アップロード =====

interface ImageUploadProps {
  onChange: (file: File | null) => void;
  label?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onChange,
  label = '画像ファイル (任意)',
}) => (
  <label>
    {label}
    <input
      type="file"
      accept="image/*"
      onChange={(e) => onChange(e.target.files?.[0] ?? null)}
    />
  </label>
);

// ===== 送信ボタン =====

interface SubmitButtonProps {
  loading: boolean;
  disabled?: boolean;
  loadingText?: string;
  defaultText?: string;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({
  loading,
  disabled = false,
  loadingText = '送信中...',
  defaultText = '送信',
}) => (
  <button
    type="submit"
    className="btn-primary"
    disabled={loading || disabled}
  >
    {loading ? loadingText : defaultText}
  </button>
);
