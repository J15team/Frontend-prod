# 課題実行システム API 仕様書

フロントエンド開発者向けの API 仕様書です。

## Base URL

```
/api/assignments
```

## 認証

- `Authorization: Bearer {JWT}` ヘッダーで認証
- 管理者操作には `ROLE_ADMIN` 権限が必要
- 提出操作には認証が必要（`ROLE_USER` または `ROLE_ADMIN`）
- 参照系 API は認証不要（公開）

---

## 課題題材（Assignment Subject）API

### 一覧取得

```
GET /api/assignments
```

**認証:** 不要

**レスポンス:**

```json
[
  {
    "assignmentSubjectId": 1,
    "title": "C言語基礎課題",
    "description": "C言語の基礎を学ぶ課題集",
    "maxSections": 10,
    "weight": 3,
    "createdAt": "2026-01-15T10:00:00Z"
  }
]
```

### 詳細取得

```
GET /api/assignments/{assignmentSubjectId}
```

**認証:** 不要

**パスパラメータ:**
| パラメータ | 型 | 説明 |
|-----------|------|------|
| assignmentSubjectId | Long | 課題題材 ID |

**レスポンス:**

```json
{
  "assignmentSubjectId": 1,
  "title": "C言語基礎課題",
  "description": "C言語の基礎を学ぶ課題集",
  "maxSections": 10,
  "weight": 3,
  "createdAt": "2026-01-15T10:00:00Z"
}
```

**エラー:**

- `404 Not Found` - 課題題材が存在しない

### 作成（管理者のみ）

```
POST /api/assignments
```

**認証:** 必須（ADMIN）

**リクエスト:**

```json
{
  "assignmentSubjectId": 1,
  "title": "C言語基礎課題",
  "description": "C言語の基礎を学ぶ課題集",
  "maxSections": 10,
  "weight": 3
}
```

| フィールド          | 型     | 必須 | 説明                        |
| ------------------- | ------ | ---- | --------------------------- |
| assignmentSubjectId | Long   | ✓    | 課題題材 ID（一意）         |
| title               | String | ✓    | タイトル（空不可）          |
| description         | String | -    | 説明                        |
| maxSections         | Int    | ✓    | 最大セクション数（1〜1000） |
| weight              | Int    | -    | 重み（1〜5、デフォルト: 1） |

**レスポンス:** `201 Created`

```json
{
  "assignmentSubjectId": 1,
  "title": "C言語基礎課題",
  "description": "C言語の基礎を学ぶ課題集",
  "maxSections": 10,
  "weight": 3,
  "createdAt": "2026-01-15T10:00:00Z"
}
```

### 更新（管理者のみ）

```
PUT /api/assignments/{assignmentSubjectId}
```

**認証:** 必須（ADMIN）

**リクエスト:**

```json
{
  "title": "C言語基礎課題（改訂版）",
  "description": "C言語の基礎を学ぶ課題集",
  "maxSections": 15,
  "weight": 4
}
```

**レスポンス:** `200 OK`

**エラー:**

- `404 Not Found` - 課題題材が存在しない

### 削除（管理者のみ）

```
DELETE /api/assignments/{assignmentSubjectId}
```

**認証:** 必須（ADMIN）

**レスポンス:** `204 No Content`

**エラー:**

- `404 Not Found` - 課題題材が存在しない

---

## 課題セクション（Assignment Section）API

### 一覧取得

```
GET /api/assignments/{assignmentSubjectId}/sections
```

**認証:** 不要

**レスポンス:**

```json
[
  {
    "assignmentSubjectId": 1,
    "sectionId": 1,
    "title": "Hello World",
    "description": "最初のプログラム",
    "hasAssignment": true,
    "timeLimit": 2000,
    "memoryLimit": 256
  },
  {
    "assignmentSubjectId": 1,
    "sectionId": 2,
    "title": "変数の説明",
    "description": "変数について学ぶ",
    "hasAssignment": false,
    "timeLimit": null,
    "memoryLimit": null
  }
]
```

### 詳細取得（テストケース含む）

```
GET /api/assignments/{assignmentSubjectId}/sections/{sectionId}
```

**認証:** 不要

**レスポンス:**

```json
{
  "assignmentSubjectId": 1,
  "sectionId": 1,
  "title": "Hello World",
  "description": "最初のプログラム",
  "hasAssignment": true,
  "testCases": [
    {
      "input": "",
      "expected": "Hello, World!\n",
      "visible": true
    },
    {
      "input": "5",
      "expected": "25\n",
      "visible": false
    }
  ],
  "timeLimit": 2000,
  "memoryLimit": 256
}
```

**注意:** `visible: false` のテストケースは入出力が表示されますが、提出結果では実際の出力が非表示になります。

### 作成（管理者のみ）

```
POST /api/assignments/{assignmentSubjectId}/sections
```

**認証:** 必須（ADMIN）

**リクエスト:**

```json
{
  "sectionId": 1,
  "title": "Hello World",
  "description": "最初のプログラム",
  "hasAssignment": true,
  "testCases": "[{\"input\":\"\",\"expected\":\"Hello, World!\\n\",\"visible\":true}]",
  "timeLimit": 2000,
  "memoryLimit": 256
}
```

| フィールド    | 型      | 必須 | 説明                                               |
| ------------- | ------- | ---- | -------------------------------------------------- |
| sectionId     | Int     | ✓    | セクション ID                                      |
| title         | String  | ✓    | タイトル                                           |
| description   | String  | -    | 説明                                               |
| hasAssignment | Boolean | -    | 課題あり（デフォルト: false）                      |
| testCases     | String  | △    | テストケース JSON（hasAssignment=true の場合必須） |
| timeLimit     | Int     | △    | 制限時間（ミリ秒、hasAssignment=true の場合必須）  |
| memoryLimit   | Int     | △    | メモリ制限（MB、hasAssignment=true の場合必須）    |

**テストケース JSON 形式:**

```json
[
  {
    "input": "入力文字列",
    "expected": "期待される出力",
    "visible": true
  }
]
```

**レスポンス:** `201 Created`

**エラー:**

- `400 Bad Request` - バリデーションエラー（hasAssignment=true なのに testCases がない等）

### 更新（管理者のみ）

```
PUT /api/assignments/{assignmentSubjectId}/sections/{sectionId}
```

**認証:** 必須（ADMIN）

**リクエスト:**

```json
{
  "title": "Hello World（改訂版）",
  "description": "最初のプログラム",
  "hasAssignment": true,
  "testCases": "[{\"input\":\"\",\"expected\":\"Hello, World!\\n\",\"visible\":true}]",
  "timeLimit": 3000,
  "memoryLimit": 512
}
```

**レスポンス:** `200 OK`

### 削除（管理者のみ）

```
DELETE /api/assignments/{assignmentSubjectId}/sections/{sectionId}
```

**認証:** 必須（ADMIN）

**レスポンス:** `204 No Content`

---

## 提出（Submission）API

### コード提出

```
POST /api/assignments/{assignmentSubjectId}/sections/{sectionId}/submissions
```

**認証:** 必須（USER または ADMIN）

**リクエスト:**

```json
{
  "code": "#include <stdio.h>\nint main() { printf(\"Hello, World!\\n\"); return 0; }",
  "language": "C"
}
```

| フィールド | 型     | 必須 | 説明                        |
| ---------- | ------ | ---- | --------------------------- |
| code       | String | ✓    | 提出コード                  |
| language   | String | ✓    | 言語（現在は "C" のみ対応） |

**レスポンス:** `201 Created`

```json
{
  "submissionId": 123,
  "status": "PENDING"
}
```

**ステータス:**
| ステータス | 説明 |
|-----------|------|
| PENDING | 判定待ち |
| JUDGING | 判定中 |
| COMPLETED | 判定完了 |

**エラー:**

- `400 Bad Request` - 課題なしセクションへの提出、不正な言語

### 提出履歴取得

```
GET /api/assignments/{assignmentSubjectId}/sections/{sectionId}/submissions
```

**認証:** 必須

**クエリパラメータ:**
| パラメータ | 型 | デフォルト | 説明 |
|-----------|------|------|------|
| all | Boolean | false | 全ユーザーの提出を取得（管理者のみ） |

**レスポンス:**

```json
{
  "submissions": [
    {
      "submissionId": 123,
      "status": "COMPLETED",
      "score": 100,
      "submittedAt": "2026-01-15T10:00:00Z"
    },
    {
      "submissionId": 122,
      "status": "COMPLETED",
      "score": 50,
      "submittedAt": "2026-01-15T09:30:00Z"
    }
  ]
}
```

**注意:** 結果は提出日時の降順（新しい順）で返されます。

### 提出詳細取得

```
GET /api/assignments/{assignmentSubjectId}/sections/{sectionId}/submissions/{submissionId}
```

**認証:** 必須（自分の提出のみ、管理者は全員分）

**レスポンス:**

```json
{
  "submissionId": 123,
  "status": "COMPLETED",
  "score": 100,
  "totalTestCases": 2,
  "passedTestCases": 2,
  "submittedAt": "2026-01-15T10:00:00Z",
  "results": [
    {
      "index": 0,
      "verdict": "AC",
      "executionTime": 15,
      "visible": true,
      "actualOutput": "Hello, World!\n"
    },
    {
      "index": 1,
      "verdict": "AC",
      "executionTime": 12,
      "visible": false,
      "actualOutput": null
    }
  ]
}
```

**Verdict（判定結果）:**
| Verdict | 説明 |
|---------|------|
| AC | Accepted - 正解 |
| WA | Wrong Answer - 不正解 |
| TLE | Time Limit Exceeded - 時間超過 |
| MLE | Memory Limit Exceeded - メモリ超過 |
| RE | Runtime Error - 実行時エラー |
| CE | Compilation Error - コンパイルエラー |

**注意:** `visible: false` のテストケースは `actualOutput` が `null` になります。

**エラー:**

- `403 Forbidden` - 他人の提出を参照しようとした
- `404 Not Found` - 提出が存在しない

---

## エラーレスポンス

共通のエラーレスポンス形式:

```json
{
  "timestamp": "2026-01-15T10:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "エラーメッセージ",
  "path": "/api/assignments/1/sections"
}
```

### エラーコード一覧

| HTTP ステータス         | 説明                                       |
| ----------------------- | ------------------------------------------ |
| 400 Bad Request         | リクエストが不正（バリデーションエラー等） |
| 401 Unauthorized        | 認証が必要                                 |
| 403 Forbidden           | 権限がない                                 |
| 404 Not Found           | リソースが存在しない                       |
| 503 Service Unavailable | Judge Service が利用不可                   |

---

## 使用例（フロントエンド）

### 課題一覧画面

```typescript
// 課題題材一覧を取得
const subjects = await fetch("/api/assignments").then((r) => r.json());

// 各題材のセクション一覧を取得
for (const subject of subjects) {
  const sections = await fetch(
    `/api/assignments/${subject.assignmentSubjectId}/sections`
  ).then((r) => r.json());
}
```

### 課題詳細画面

```typescript
// セクション詳細（テストケース含む）を取得
const section = await fetch(
  `/api/assignments/${subjectId}/sections/${sectionId}`
).then((r) => r.json());

// visibleなテストケースのみ表示
const visibleTestCases = section.testCases?.filter((tc) => tc.visible) || [];
```

### コード提出

```typescript
// コードを提出
const response = await fetch(
  `/api/assignments/${subjectId}/sections/${sectionId}/submissions`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      code: userCode,
      language: "C",
    }),
  }
).then((r) => r.json());

// 提出IDを取得
const submissionId = response.submissionId;

// ポーリングで結果を確認
const checkResult = async () => {
  const detail = await fetch(
    `/api/assignments/${subjectId}/sections/${sectionId}/submissions/${submissionId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  ).then((r) => r.json());

  if (detail.status === "COMPLETED") {
    // 結果を表示
    console.log(`スコア: ${detail.score}点`);
    console.log(`通過: ${detail.passedTestCases}/${detail.totalTestCases}`);
  } else {
    // まだ判定中なら再度確認
    setTimeout(checkResult, 1000);
  }
};
checkResult();
```

### 提出履歴画面

```typescript
// 自分の提出履歴を取得
const history = await fetch(
  `/api/assignments/${subjectId}/sections/${sectionId}/submissions`,
  { headers: { Authorization: `Bearer ${token}` } }
).then((r) => r.json());

// 履歴を表示（新しい順）
for (const submission of history.submissions) {
  console.log(`${submission.submittedAt}: ${submission.score}点`);
}
```

---

## 部分点について

- 部分点は `(通過テストケース数 / 全テストケース数) × 100` で計算
- 例: 5 つ中 3 つ通過 → 60 点
- 全テストケース通過で 100 点（AC）
