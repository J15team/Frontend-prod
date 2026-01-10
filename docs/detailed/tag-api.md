# タグ API 仕様書

## 概要

題材（Subject）にタグを付与して分類・絞り込みを行うための API。

## 認証

- `POST`, `DELETE` エンドポイントは **ADMIN 権限** が必要
- `GET` エンドポイントは認証不要

---

## タグ管理 API

### タグ作成

```
POST /api/tags
```

**Request Body:**

```json
{
  "name": "Kotlin",
  "type": "NORMAL" // optional, default: "NORMAL"
}
```

**Response:** `201 Created`

```json
{
  "id": 1,
  "name": "Kotlin",
  "displayName": "#Kotlin",
  "type": "NORMAL",
  "createdAt": "2026-01-10T12:00:00"
}
```

**エラー:**

- `400` - タグ名が不正（空、51 文字以上、不正な文字）
- `400` - 同名のタグが既に存在

---

### タグ一覧取得

```
GET /api/tags
GET /api/tags?search=Kot
```

**Query Parameters:**
| パラメータ | 型 | 説明 |
|-----------|-----|------|
| search | string | 部分一致検索（オプション） |

**Response:** `200 OK`

```json
[
  {
    "id": 1,
    "name": "Kotlin",
    "displayName": "#Kotlin",
    "type": "NORMAL",
    "createdAt": "2026-01-10T12:00:00"
  }
]
```

---

### タグ取得（ID 指定）

```
GET /api/tags/{tagId}
```

**Response:** `200 OK`

```json
{
  "id": 1,
  "name": "Kotlin",
  "displayName": "#Kotlin",
  "type": "NORMAL",
  "createdAt": "2026-01-10T12:00:00"
}
```

**エラー:**

- `404` - タグが見つからない

---

### タグ取得（名前指定）

```
GET /api/tags/name/{name}
```

**Response:** `200 OK`

```json
{
  "id": 1,
  "name": "Kotlin",
  "displayName": "#Kotlin",
  "type": "NORMAL",
  "createdAt": "2026-01-10T12:00:00"
}
```

**エラー:**

- `404` - タグが見つからない

---

### タグ存在確認

```
GET /api/tags/exists?name=Kotlin
```

**Query Parameters:**
| パラメータ | 型 | 説明 |
|-----------|-----|------|
| name | string | 確認するタグ名（必須） |

**Response:** `200 OK`

```json
{
  "exists": true,
  "tag": {
    "id": 1,
    "name": "Kotlin",
    "displayName": "#Kotlin",
    "type": "NORMAL",
    "createdAt": "2026-01-10T12:00:00"
  }
}
```

存在しない場合:

```json
{
  "exists": false,
  "tag": null
}
```

---

### タグ削除

```
DELETE /api/tags/{tagId}
```

**Response:** `204 No Content`

**エラー:**

- `404` - タグが見つからない

**注意:** タグを削除すると、全ての題材との関連も削除される

---

## 題材-タグ関連 API

### 題材にタグを付与

```
POST /api/subjects/{subjectId}/tags/{tagName}
```

**Response:** `201 Created`

**エラー:**

- `404` - 題材またはタグが見つからない

**注意:** 既に付与済みの場合は何もせず成功を返す（冪等）

---

### 題材からタグを削除

```
DELETE /api/subjects/{subjectId}/tags/{tagName}
```

**Response:** `204 No Content`

**注意:** 付与されていない場合も成功を返す（冪等）

---

### 題材のタグ一覧取得

```
GET /api/subjects/{subjectId}/tags
```

**Response:** `200 OK`

```json
[
  {
    "id": 1,
    "name": "Kotlin",
    "displayName": "#Kotlin",
    "type": "NORMAL",
    "createdAt": "2026-01-10T12:00:00"
  }
]
```

**エラー:**

- `404` - 題材が見つからない

---

### タグで題材を絞り込み

```
GET /api/subjects?tags=Kotlin,Java
```

**Query Parameters:**
| パラメータ | 型 | 説明 |
|-----------|-----|------|
| tags | string | カンマ区切りのタグ名（AND 条件） |

**Response:** `200 OK`

```json
[
  {
    "subjectId": 1,
    "title": "Webアプリ開発",
    "description": "...",
    "maxSections": 100,
    "weight": 3,
    "createdAt": "2026-01-10T12:00:00"
  }
]
```

**注意:**

- 複数タグ指定時は AND 条件（全てのタグを持つ題材のみ返す）
- タグ未指定時は全題材を返す

---

## データ型

### TagResponse

| フィールド  | 型     | 説明                         |
| ----------- | ------ | ---------------------------- |
| id          | number | タグ ID                      |
| name        | string | タグ名（1-50 文字）          |
| displayName | string | 表示用タグ名（#付き）        |
| type        | string | タグ種類（NORMAL / PREMIUM） |
| createdAt   | string | 作成日時（ISO 8601）         |

### タグ名の制約

- 1〜50 文字
- 使用可能文字: 英数字、日本語（ひらがな・カタカナ・漢字）、ハイフン、アンダースコア
- 重複不可（ユニーク）
