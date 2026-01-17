# 管理者向け進捗ダッシュボード API

## 概要

管理者が全ユーザーの進捗状況を一覧で確認できる API です。

---

## エンドポイント一覧

| メソッド | パス                              | 説明               |
| -------- | --------------------------------- | ------------------ |
| GET      | `/api/admin/progress/assignments` | 課題題材の進捗一覧 |
| GET      | `/api/admin/progress/subjects`    | 通常題材の進捗一覧 |

---

## GET /api/admin/progress/assignments

全ユーザーの課題題材進捗を取得します。

### 認証

- **必須**: Bearer Token
- **権限**: ADMIN ロールが必要

### リクエスト

```http
GET /api/admin/progress/assignments
Authorization: Bearer <admin_token>
```

### レスポンス

```json
{
  "users": [
    {
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "username": "tanaka",
      "email": "tanaka@example.com",
      "subjects": [
        {
          "subjectId": 1,
          "title": "C言語入門（課題）",
          "progressPercent": 66,
          "clearedSections": 2,
          "totalSections": 3,
          "isCleared": false
        }
      ]
    }
  ]
}
```

### レスポンスフィールド

| フィールド                   | 型      | 説明                   |
| ---------------------------- | ------- | ---------------------- |
| `users`                      | array   | ユーザー進捗リスト     |
| `users[].userId`             | string  | ユーザー ID (UUID)     |
| `users[].username`           | string  | ユーザー名             |
| `users[].email`              | string  | メールアドレス         |
| `users[].subjects`           | array   | 課題題材進捗リスト     |
| `subjects[].subjectId`       | number  | 課題題材 ID            |
| `subjects[].title`           | string  | 題材タイトル           |
| `subjects[].progressPercent` | number  | 進捗率 (0-100)         |
| `subjects[].clearedSections` | number  | クリア済みセクション数 |
| `subjects[].totalSections`   | number  | 課題ありセクション総数 |
| `subjects[].isCleared`       | boolean | 題材クリア済みフラグ   |

### 進捗計算ロジック

- **セクションクリア条件**: 最高スコアが 100 点
- **進捗率**: `(クリア済みセクション数 / 課題ありセクション総数) * 100`
- **題材クリア条件**: 全ての課題ありセクションをクリア
- **課題なし題材**: `progressPercent: 100`, `isCleared: true`, `totalSections: 0`

---

## GET /api/admin/progress/subjects

全ユーザーの通常題材進捗を取得します。

### 認証

- **必須**: Bearer Token
- **権限**: ADMIN ロールが必要

### リクエスト

```http
GET /api/admin/progress/subjects
Authorization: Bearer <admin_token>
```

### レスポンス

```json
{
  "users": [
    {
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "username": "tanaka",
      "email": "tanaka@example.com",
      "subjects": [
        {
          "subjectId": 1,
          "title": "C言語入門",
          "progressPercent": 80,
          "clearedSections": 4,
          "totalSections": 5,
          "isCleared": false
        },
        {
          "subjectId": 2,
          "title": "アルゴリズム基礎",
          "progressPercent": 100,
          "clearedSections": 10,
          "totalSections": 10,
          "isCleared": true
        }
      ]
    }
  ]
}
```

### レスポンスフィールド

| フィールド                   | 型      | 説明                   |
| ---------------------------- | ------- | ---------------------- |
| `users`                      | array   | ユーザー進捗リスト     |
| `users[].userId`             | string  | ユーザー ID (UUID)     |
| `users[].username`           | string  | ユーザー名             |
| `users[].email`              | string  | メールアドレス         |
| `users[].subjects`           | array   | 通常題材進捗リスト     |
| `subjects[].subjectId`       | number  | 題材 ID                |
| `subjects[].title`           | string  | 題材タイトル           |
| `subjects[].progressPercent` | number  | 進捗率 (0-100)         |
| `subjects[].clearedSections` | number  | クリア済みセクション数 |
| `subjects[].totalSections`   | number  | セクション総数         |
| `subjects[].isCleared`       | boolean | 題材クリア済みフラグ   |

### 進捗計算ロジック

- **セクションクリア条件**: ユーザーがセクションを「完了」としてマーク
- **進捗率**: `(クリア済みセクション数 / セクション総数) * 100`
- **題材クリア条件**: 全てのセクションをクリア
- **セクションなし題材**: `progressPercent: 100`, `isCleared: true`, `totalSections: 0`

---

## エラーレスポンス

**401 Unauthorized** - 認証なし

```json
{
  "error": "Unauthorized",
  "message": "認証が必要です"
}
```

**403 Forbidden** - ADMIN 権限なし

```json
{
  "error": "Forbidden",
  "message": "管理者権限が必要です"
}
```

---

## フロントエンド実装例

### TypeScript 型定義

```typescript
// 課題題材進捗
interface AssignmentSubjectProgressSummary {
  subjectId: number;
  title: string;
  progressPercent: number;
  clearedSections: number;
  totalSections: number;
  isCleared: boolean;
}

interface AssignmentUserProgressSummary {
  userId: string;
  username: string;
  email: string;
  subjects: AssignmentSubjectProgressSummary[];
}

interface AdminAssignmentProgressResponse {
  users: AssignmentUserProgressSummary[];
}

// 通常題材進捗
interface SubjectProgressSummary {
  subjectId: number;
  title: string;
  progressPercent: number;
  clearedSections: number;
  totalSections: number;
  isCleared: boolean;
}

interface UserSubjectProgressSummary {
  userId: string;
  username: string;
  email: string;
  subjects: SubjectProgressSummary[];
}

interface AdminSubjectProgressResponse {
  users: UserSubjectProgressSummary[];
}
```

### API 呼び出し例

```typescript
// 課題題材進捗取得
const fetchAssignmentProgress = async (
  token: string
): Promise<AdminAssignmentProgressResponse> => {
  const response = await fetch("/api/admin/progress/assignments", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
};

// 通常題材進捗取得
const fetchSubjectProgress = async (
  token: string
): Promise<AdminSubjectProgressResponse> => {
  const response = await fetch("/api/admin/progress/subjects", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
};
```

---

## 注意事項

1. **パフォーマンス**: 全ユーザー・全題材を取得するため、ユーザー数が多い場合はレスポンスが大きくなります
2. **キャッシュ推奨**: 頻繁に更新されないデータのため、フロントエンドでのキャッシュを推奨
3. **権限チェック**: ADMIN 以外のユーザーがアクセスすると 403 エラー
