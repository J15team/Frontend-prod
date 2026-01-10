/**
 * Tag Model
 * タグ情報を表すモデル
 */
export interface Tag {
  id: number;
  name: string;
  displayName: string;
  type: 'NORMAL' | 'PREMIUM';
  createdAt: string;
}

/**
 * タグ作成リクエスト
 */
export interface CreateTagRequest {
  name: string;
  type?: 'NORMAL' | 'PREMIUM';
}

/**
 * タグ存在確認レスポンス
 */
export interface TagExistsResponse {
  exists: boolean;
  tag: Tag | null;
}
