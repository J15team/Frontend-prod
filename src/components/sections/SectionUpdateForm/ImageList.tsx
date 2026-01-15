/**
 * ImageList
 * セクションに紐づく画像一覧コンポーネント
 * Single Responsibility: 画像リストの表示と操作のみを担当
 */
import React from 'react';

interface Image {
  imageId: number;
  imageUrl: string;
}

interface ImageListProps {
  images: Image[];
  loading: boolean;
  onDeleteImage: (imageId: number) => void;
  onCopyLink: (imageUrl: string) => void;
}

export const ImageList: React.FC<ImageListProps> = ({
  images,
  loading,
  onDeleteImage,
  onCopyLink,
}) => {
  return (
    <div className="image-status">
      <p>現在の画像: {images.length}件</p>
      {images.length > 0 ? (
        <ul className="image-list">
          {images.map((image) => (
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
  );
};
