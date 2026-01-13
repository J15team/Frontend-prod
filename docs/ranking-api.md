# ランキング機能 API仕様書

## 概要

題材（Subject）とタグ（Tag）のアクセス数に基づいたランキング機能を提供します。
同じアカウントからのアクセスは1回のみカウントされます。

## エンドポイント一覧

| メソッド | パス | 認証 | 説明 |
|---------|------|------|------|
| POST | `/api/views/subjects/{subjectId}` | 必須 | 題材の閲覧を記録 |
| POST | `/api/views/tags/{tagId}` | 必須 | タグの閲覧を記録 |
| GET | `/api/rankings/subjects` | 不要 | 題材ランキングを取得 |
| GET | `/api/rankings/tags` | 不要 | タグランキングを取得 |

---

## 閲覧記録API

### POST /api/views/subjects/{subjectId}

題材の閲覧を記録します。同じユーザーからの重複アクセスは1回のみカウントされます。

#### リクエスト

```
POST /api/views/subjects/1
Authorization: Bearer <JWT_TOKEN>
```

#### パスパラメータ

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| subjectId | Long | Yes | 題材ID |

#### レスポンス

**成功時 (200 OK)**

```json
{
  "recorded": true,
  "isNewView": true,
  "message": "閲覧を記録しました"
}
```

または（既に閲覧済みの場合）

```json
{
  "recorded": true,
  "isNewView": false,
  "message": "既に閲覧済みです（閲覧日時を更新しました）"
}
```

**エラー時**

- `401 Unauthorized`: 認証トークンが無効
- `404 Not Found`: 題材が存在しない

---

### POST /api/views/tags/{tagId}

タグの閲覧を記録します。同じユーザーからの重複アクセスは1回のみカウントされます。

#### リクエスト

```
POST /api/views/tags/5
Authorization: Bearer <JWT_TOKEN>
```

#### パスパラメータ

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| tagId | Long | Yes | タグID |

#### レスポンス

**成功時 (200 OK)**

```json
{
  "recorded": true,
  "isNewView": true,
  "message": "閲覧を記録しました"
}
```

**エラー時**

- `401 Unauthorized`: 認証トークンが無効
- `404 Not Found`: タグが存在しない

---

## ランキング取得API

### GET /api/rankings/subjects

題材のランキングを閲覧数順に取得します。

#### リクエスト

```
GET /api/rankings/subjects?limit=10
```

#### クエリパラメータ

| パラメータ | 型 | 必須 | デフォルト | 説明 |
|-----------|-----|------|-----------|------|
| limit | Int | No | 10 | 取得件数（1〜100） |

#### レスポンス

**成功時 (200 OK)**

```json
[
  {
    "rank": 1,
    "viewCount": 150,
    "subject": {
      "subjectId": 1,
      "title": "Webアプリ開発",
      "description": "モダンなWebアプリケーション開発を学ぶ",
      "maxSections": 20,
      "weight": 5,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  },
  {
    "rank": 2,
    "viewCount": 120,
    "subject": {
      "subjectId": 3,
      "title": "モバイルアプリ開発",
      "description": "iOS/Android開発の基礎",
      "maxSections": 15,
      "weight": 4,
      "createdAt": "2024-01-20T14:00:00Z"
    }
  }
]
```

---

### GET /api/rankings/tags

タグのランキングを閲覧数順に取得します。

#### リクエスト

```
GET /api/rankings/tags?limit=5
```

#### クエリパラメータ

| パラメータ | 型 | 必須 | デフォルト | 説明 |
|-----------|-----|------|-----------|------|
| limit | Int | No | 10 | 取得件数（1〜100） |

#### レスポンス

**成功時 (200 OK)**

```json
[
  {
    "rank": 1,
    "viewCount": 200,
    "tag": {
      "id": 5,
      "name": "javascript",
      "displayName": "JavaScript",
      "type": "NORMAL",
      "createdAt": "2024-01-10T09:00:00"
    }
  },
  {
    "rank": 2,
    "viewCount": 180,
    "tag": {
      "id": 3,
      "name": "react",
      "displayName": "React",
      "type": "NORMAL",
      "createdAt": "2024-01-10T09:15:00"
    }
  }
]
```

---

## データモデル

### SubjectRankingResponse

| フィールド | 型 | 説明 |
|-----------|-----|------|
| rank | Int | ランキング順位（1から開始） |
| viewCount | Long | 閲覧数（ユニークユーザー数） |
| subject | SubjectResponse | 題材情報 |

### TagRankingResponse

| フィールド | 型 | 説明 |
|-----------|-----|------|
| rank | Int | ランキング順位（1から開始） |
| viewCount | Long | 閲覧数（ユニークユーザー数） |
| tag | TagResponse | タグ情報 |

### ViewRecordResponse

| フィールド | 型 | 説明 |
|-----------|-----|------|
| recorded | Boolean | 記録が成功したか |
| isNewView | Boolean | 新規の閲覧かどうか |
| message | String | メッセージ |

---

## 仕様詳細

### 同一アカウントからの重複カウント防止

- 同じユーザーが同じ題材/タグを複数回閲覧しても、カウントは1回のみ
- データベースレベルで `(subject_id, user_id)` / `(tag_id, user_id)` の複合主キーで保証
- 重複アクセス時は閲覧日時のみ更新

### 認証要件

| エンドポイント | 認証 | 理由 |
|---------------|------|------|
| 閲覧記録API | 必須 | ユーザー識別が必要 |
| ランキング取得API | 不要 | 公開情報として提供 |

### 制限事項

- ランキング取得の最大件数: 100件
- ランキング取得のデフォルト件数: 10件
