/**
 * Assignment Model
 * 課題題材情報を表すモデル
 */

// 課題題材
export interface AssignmentSubject {
  assignmentSubjectId: number;
  title: string;
  description: string;
  maxSections: number;
  weight?: number;
  createdAt?: string;
}

// 課題セクション（一覧用）
export interface AssignmentSection {
  assignmentSubjectId: number;
  sectionId: number;
  title: string;
  description: string;
  hasAssignment: boolean;
  timeLimit?: number | null;
  memoryLimit?: number | null;
}

// テストケース
export interface TestCase {
  input: string;
  expected: string;
  visible: boolean;
}

// 課題セクション（詳細用、テストケース含む）
export interface AssignmentSectionDetail extends AssignmentSection {
  testCases?: TestCase[];
}

// 提出リクエスト
export interface SubmissionRequest {
  code: string;
  language: string;
}

// 提出レスポンス
export interface SubmissionResponse {
  submissionId: number;
  status: 'PENDING' | 'JUDGING' | 'COMPLETED';
}

// 提出履歴アイテム
export interface SubmissionHistoryItem {
  submissionId: number;
  status: 'PENDING' | 'JUDGING' | 'COMPLETED';
  score?: number;
  submittedAt: string;
}

// 提出履歴レスポンス
export interface SubmissionHistoryResponse {
  submissions: SubmissionHistoryItem[];
}

// 判定結果
export type Verdict = 'AC' | 'WA' | 'TLE' | 'MLE' | 'RE' | 'CE';

// テスト結果
export interface TestResult {
  index: number;
  verdict: Verdict;
  executionTime: number;
  visible: boolean;
  actualOutput: string | null;
}

// 提出詳細
export interface SubmissionDetail {
  submissionId: number;
  status: 'PENDING' | 'JUDGING' | 'COMPLETED';
  score?: number;
  totalTestCases?: number;
  passedTestCases?: number;
  submittedAt: string;
  results?: TestResult[];
}

// 課題題材作成リクエスト
export interface CreateAssignmentSubjectRequest {
  assignmentSubjectId: number;
  title: string;
  description?: string;
  maxSections: number;
  weight?: number;
}

// 課題題材更新リクエスト
export interface UpdateAssignmentSubjectRequest {
  title: string;
  description?: string;
  maxSections: number;
  weight?: number;
}

// 課題セクション作成リクエスト
export interface CreateAssignmentSectionRequest {
  sectionId: number;
  title: string;
  description?: string;
  hasAssignment?: boolean;
  testCases?: string; // JSON文字列
  timeLimit?: number;
  memoryLimit?: number;
}

// 課題セクション更新リクエスト
export interface UpdateAssignmentSectionRequest {
  title?: string;
  description?: string;
  hasAssignment?: boolean;
  testCases?: string;
  timeLimit?: number;
  memoryLimit?: number;
}


// 進捗セクション
export interface ProgressSection {
  sectionId: number;
  title: string;
  bestScore: number;
  isCleared: boolean;
  submissionCount: number;
}

// 進捗レスポンス
export interface AssignmentProgress {
  sections: ProgressSection[];
  totalSections: number;
  clearedSections: number;
  isSubjectCleared: boolean;
  progressPercent: number;
}
