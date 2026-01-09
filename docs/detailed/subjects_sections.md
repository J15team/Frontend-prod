# 題材・セクション管理 API 詳細

## 題材管理 API

題材（学習プロジェクト）を管理します。各題材には複数のセクションが属します。

### 題材一覧取得

すべての題材を取得します。

**エンドポイント**

```http
GET /api/subjects
```

**認証**: 不要

**レスポンス**

**成功時 (200 OK)**

```json
[
  {
    "subjectId": 1,
    "title": "デフォルト題材",
    "description": "マイグレーションで作成されたデフォルト題材",
    "maxSections": 101,
    "createdAt": "2025-12-06T10:00:00Z"
  },
  {
    "subjectId": 2,
    "title": "React入門",
    "description": "Reactの基礎を学ぶ",
    "maxSections": 50,
    "createdAt": "2025-12-06T11:00:00Z"
  }
]
```

---

### 題材詳細取得

特定の題材の詳細を取得します。

**エンドポイント**

```http
GET /api/subjects/{subjectId}
```

**パスパラメータ**

| パラメータ | 型   | 説明    |
| ---------- | ---- | ------- |
| subjectId  | long | 題材 ID |

**レスポンス**

**成功時 (200 OK)**

```json
{
  "subjectId": 1,
  "title": "デフォルト題材",
  "description": "マイグレーションで作成されたデフォルト題材",
  "maxSections": 101,
  "createdAt": "2025-12-06T10:00:00Z"
}
```

**エラー**

- **404 Not Found**: 題材が存在しない

---

### 題材作成

新しい題材を作成します。

**エンドポイント**

```http
POST /api/subjects
```

**認証**: `ROLE_ADMIN` が必要

**リクエストヘッダー**

```
Content-Type: application/json
Authorization: Bearer {accessToken}
```

**リクエストボディ**

```json
{
  "subjectId": 100,
  "title": "TypeScript入門",
  "description": "TypeScriptの基礎を学ぶ",
  "maxSections": 50
}
```

| フィールド  | 型     | 必須 | 説明             | バリデーション |
| ----------- | ------ | ---- | ---------------- | -------------- |
| subjectId   | long   | ○    | 題材 ID          | 一意制約       |
| title       | string | ○    | 題材のタイトル   | 1 文字以上     |
| description | string | ×    | 題材の説明       | -              |
| maxSections | int    | ○    | 最大セクション数 | 1~1000         |

**レスポンス**

**成功時 (201 Created)**

```json
{
  "subjectId": 100,
  "title": "TypeScript入門",
  "description": "TypeScriptの基礎を学ぶ",
  "maxSections": 50,
  "createdAt": "2025-12-06T12:00:00Z"
}
```

**エラー**

- **400 Bad Request**: バリデーションエラー
- **403 Forbidden**: 管理者権限がない
- **409 Conflict**: 題材 ID が既に存在

---

### 題材更新

既存の題材を更新します。

**エンドポイント**

```http
PUT /api/subjects/{subjectId}
```

**認証**: `ROLE_ADMIN` が必要

**パスパラメータ**

| パラメータ | 型   | 説明    |
| ---------- | ---- | ------- |
| subjectId  | long | 題材 ID |

**リクエストヘッダー**

```
Content-Type: application/json
Authorization: Bearer {accessToken}
```

**リクエストボディ**

```json
{
  "title": "TypeScript入門（改訂版）",
  "description": "TypeScriptの基礎から応用まで",
  "maxSections": 60
}
```

| フィールド  | 型     | 必須 | 説明             | バリデーション |
| ----------- | ------ | ---- | ---------------- | -------------- |
| title       | string | ○    | 題材のタイトル   | 1 文字以上     |
| description | string | ×    | 題材の説明       | -              |
| maxSections | int    | ○    | 最大セクション数 | 1~1000         |

**レスポンス**

**成功時 (200 OK)**

```json
{
  "subjectId": 100,
  "title": "TypeScript入門（改訂版）",
  "description": "TypeScriptの基礎から応用まで",
  "maxSections": 60,
  "createdAt": "2025-12-06T12:00:00Z"
}
```

**エラー**

- **400 Bad Request**: バリデーションエラー
- **403 Forbidden**: 管理者権限がない
- **404 Not Found**: 題材が存在しない

---

### 題材削除

題材を削除します。

**エンドポイント**

```http
DELETE /api/subjects/{subjectId}
```

**認証**: `ROLE_ADMIN` が必要

**パスパラメータ**

| パラメータ | 型   | 説明    |
| ---------- | ---- | ------- |
| subjectId  | long | 題材 ID |

**レスポンス**

**成功時 (204 No Content)**

レスポンスボディなし

**エラー**

- **403 Forbidden**: 管理者権限がない
- **404 Not Found**: 題材が存在しない

---

## セクション管理 API

各題材に属するセクション（学習ステップ）を管理します。

### セクション一覧取得

特定の題材に属する全セクションを取得します。

**エンドポイント**

```http
GET /api/subjects/{subjectId}/sections
```

**認証**: 不要

**パスパラメータ**

| パラメータ | 型   | 説明    |
| ---------- | ---- | ------- |
| subjectId  | long | 題材 ID |

**レスポンス**

**成功時 (200 OK)**

```json
[
  {
    "subjectId": 1,
    "sectionId": 0,
    "title": "プロジェクト準備",
    "description": "環境構築とプロジェクトのセットアップ",
    "imageUrl": "https://j15-backend-images.s3.ap-northeast-1.amazonaws.com/images/uuid.jpg"
  },
  {
    "subjectId": 1,
    "sectionId": 1,
    "title": "基本機能の実装",
    "description": "CRUDの基本機能を実装する",
    "imageUrl": null
  }
]
```

**エラー**

- **404 Not Found**: 題材が存在しない

---

### セクション詳細取得

特定のセクションの詳細を取得します。

**エンドポイント**

```http
GET /api/subjects/{subjectId}/sections/{sectionId}
```

**認証**: 不要

**パスパラメータ**

| パラメータ | 型   | 説明                   |
| ---------- | ---- | ---------------------- |
| subjectId  | long | 題材 ID                |
| sectionId  | int  | セクション ID（0~100） |

**レスポンス**

**成功時 (200 OK)**

```json
{
  "subjectId": 1,
  "sectionId": 0,
  "title": "プロジェクト準備",
  "description": "環境構築とプロジェクトのセットアップ",
  "imageUrl": "https://j15-backend-images.s3.ap-northeast-1.amazonaws.com/images/uuid.jpg"
}
```

画像が登録されていない場合、`imageUrl`は`null`になります。

**エラー**

- **404 Not Found**: 題材またはセクションが存在しない

---

### セクション作成

新しいセクションを作成します。画像も同時にアップロードできます。

**エンドポイント**

```http
POST /api/subjects/{subjectId}/sections
```

**認証**: `ROLE_ADMIN` が必要

**リクエストヘッダー**

```
Content-Type: multipart/form-data
Authorization: Bearer {accessToken}
```

**パスパラメータ**

| パラメータ | 型   | 説明    |
| ---------- | ---- | ------- |
| subjectId  | long | 題材 ID |

**リクエストボディ（multipart/form-data）**

| フィールド   | 型            | 必須 | 説明                     |
| ------------ | ------------- | ---- | ------------------------ |
| sectionId    | int           | ○    | セクション ID（0~100）   |
| title        | string        | ○    | セクションタイトル       |
| description  | string        | ×    | セクション説明           |
| image        | file          | ×    | アップロードする画像ファイル |

**画像ファイル制約**

- 許可される形式: JPEG, PNG, GIF, WebP
- 最大ファイルサイズ: 5MB
- ファイル名は自動生成（UUIDベース）

**リクエスト例（cURL）**

```bash
curl -X POST \
  http://localhost:8080/api/subjects/1/sections \
  -H "Authorization: Bearer <accessToken>" \
  -F "sectionId=10" \
  -F "title=セクションタイトル" \
  -F "description=説明" \
  -F "image=@/path/to/image.jpg"
```

**レスポンス**

**成功時 (201 Created)**

```json
{
  "subjectId": 1,
  "sectionId": 10,
  "title": "セクションタイトル",
  "description": "説明",
  "imageUrl": "https://j15-backend-images.s3.ap-northeast-1.amazonaws.com/images/uuid.jpg"
}
```

**エラー**

- **400 Bad Request**: バリデーションエラー、ファイル形式が不正、またはファイルサイズが大きすぎる
- **403 Forbidden**: 管理者権限がない
- **404 Not Found**: 題材が存在しない
- **500 Internal Server Error**: S3アップロードに失敗

---

### セクション更新

既存のセクションを更新します。画像も同時にアップロードできます。

**エンドポイント**

```http
PUT /api/subjects/{subjectId}/sections/{sectionId}
```

**認証**: `ROLE_ADMIN` が必要

**リクエストヘッダー**

```
Content-Type: multipart/form-data
Authorization: Bearer {accessToken}
```

**パスパラメータ**

| パラメータ | 型   | 説明                   |
| ---------- | ---- | ---------------------- |
| subjectId  | long | 題材 ID                |
| sectionId  | int  | セクション ID（0~100） |

**リクエストボディ（multipart/form-data）**

| フィールド   | 型            | 必須 | 説明                     |
| ------------ | ------------- | ---- | ------------------------ |
| title        | string        | ×    | セクションタイトル       |
| description  | string        | ×    | セクション説明           |
| image        | file          | ×    | アップロードする画像ファイル |

**画像ファイル制約**

- 許可される形式: JPEG, PNG, GIF, WebP
- 最大ファイルサイズ: 5MB
- ファイル名は自動生成（UUIDベース）

**リクエスト例（cURL）**

```bash
curl -X PUT \
  http://localhost:8080/api/subjects/1/sections/10 \
  -H "Authorization: Bearer <accessToken>" \
  -F "title=更新タイトル" \
  -F "description=更新説明" \
  -F "image=@/path/to/image.jpg"
```

**レスポンス**

**成功時 (200 OK)**

```json
{
  "subjectId": 1,
  "sectionId": 10,
  "title": "更新タイトル",
  "description": "更新説明",
  "imageUrl": "https://j15-backend-images.s3.ap-northeast-1.amazonaws.com/images/uuid.jpg"
}
```

**エラー**

- **400 Bad Request**: ファイル形式が不正、またはファイルサイズが大きすぎる
- **403 Forbidden**: 管理者権限がない
- **404 Not Found**: 題材またはセクションが存在しない
- **500 Internal Server Error**: S3アップロードに失敗

---

### セクション削除

セクションを削除します。

**エンドポイント**

```http
DELETE /api/subjects/{subjectId}/sections/{sectionId}
```

**認証**: `ROLE_ADMIN` が必要

**パスパラメータ**

| パラメータ | 型   | 説明                   |
| ---------- | ---- | ---------------------- |
| subjectId  | long | 題材 ID                |
| sectionId  | int  | セクション ID（0~100） |

**レスポンス**

**成功時 (200 OK)**

```json
{
  "message": "セクション 10 を削除しました"
}
```

**エラー**

- **403 Forbidden**: 管理者権限がない
- **404 Not Found**: 題材またはセクションが存在しない

---

## フロントエンド実装例

### 題材一覧取得と表示

```typescript
const fetchSubjects = async () => {
  const response = await fetch("/api/subjects");
  const subjects = await response.json();
  return subjects;
};

// 表示
subjects.map((subject) => (
  <Card key={subject.subjectId}>
    <Title>{subject.title}</Title>
    <Description>{subject.description}</Description>
    <Text>全 {subject.maxSections} セクション</Text>
    <Button onClick={() => selectSubject(subject.subjectId)}>学習を開始</Button>
  </Card>
));
```

### セクション一覧取得と表示

```typescript
const fetchSections = async (subjectId: number) => {
  const response = await fetch(`/api/subjects/${subjectId}/sections`);
  const sections = await response.json();
  return sections;
};

// 表示
{sections.map(section => (
  <SectionItem key={section.sectionId}>
    <Text>{section.title}</Text>
    {section.imageUrl && <img src={section.imageUrl} alt={section.title} />}
    <Description>{section.description}</Description>
  </SectionItem>
))}
```

### セクション作成（画像アップロード含む）

```typescript
const createSection = async (
  subjectId: number,
  sectionId: number,
  title: string,
  description: string,
  imageFile?: File
) => {
  const token = localStorage.getItem('accessToken');
  const formData = new FormData();
  formData.append('sectionId', sectionId.toString());
  formData.append('title', title);
  formData.append('description', description);
  if (imageFile) {
    formData.append('image', imageFile);
  }

  const response = await fetch(`/api/subjects/${subjectId}/sections`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  return await response.json();
};
```

### セクション更新（画像アップロード含む）

```typescript
const updateSection = async (
  subjectId: number,
  sectionId: number,
  title?: string,
  description?: string,
  imageFile?: File
) => {
  const token = localStorage.getItem('accessToken');
  const formData = new FormData();
  if (title) formData.append('title', title);
  if (description) formData.append('description', description);
  if (imageFile) formData.append('image', imageFile);

  const response = await fetch(
    `/api/subjects/${subjectId}/sections/${sectionId}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    }
  );

  return await response.json();
};
```

---

## セクション画像機能（補助機能）

セクション作成・更新時に画像ファイルを添付できます。画像は任意（`image`フィールドは必須ではありません）。

### 画像ファイル制約

| 項目 | 制約 |
| --- | --- |
| 許可される形式 | JPEG, PNG, GIF, WebP |
| 最大ファイルサイズ | 5MB |
| ファイル名 | 自動生成（UUIDベース） |
| Content-Type | `multipart/form-data` |

### 画像URLの取得

セクション情報を取得すると、画像が登録されている場合は`imageUrl`フィールドにURLが含まれます。画像が登録されていない場合、`imageUrl`は`null`になります。

### S3バケット設定

- **バケット名**: `j15-backend-images`
- **リージョン**: `ap-northeast-1`
- **公開パス**: `images/*`（パブリック読み取り可能）

S3バケットの設定確認や作成方法については、AWS CLIを使用して確認できます：

```bash
# バケットの存在確認
aws s3 ls | grep j15-backend-images

# バケットポリシー確認
aws s3api get-bucket-policy --bucket j15-backend-images
```

### 注意事項

- 画像アップロードには管理者権限（`ROLE_ADMIN`）が必要です
- 画像ファイルは自動的にUUIDベースのファイル名に変換されます
- 同じセクションに対して画像を再アップロードすると、既存の画像URLが上書きされます
- S3の認証情報は環境変数（`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`）で設定してください

