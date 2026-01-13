/**
 * Ranking Models
 * ランキング関連の型定義
 */
import { type Subject } from './Subject';
import { type Tag } from './Tag';

export interface SubjectRanking {
  rank: number;
  viewCount: number;
  subject: Subject;
}

export interface TagRanking {
  rank: number;
  viewCount: number;
  tag: Tag;
}

export interface ViewRecordResponse {
  recorded: boolean;
  isNewView: boolean;
  message: string;
}
