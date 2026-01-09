# J15 Backend API クイックリファレンス

フロントエンド開発者が実装に必要な情報を最短で確認できるリファレンスです。詳細な仕様は `docs/detailed/` フォルダ内の各機能別ドキュメントを参照してください。

## ベース URL

| 環境 | URL |
| --- | --- |
| 本番 | `https://zu9mkxoir4.execute-api.ap-northeast-1.amazonaws.com` |
| ローカル | `http://localhost:8080` |

## 認証

1. `POST /api/auth/signin` で `accessToken` と `refreshToken` を取得
2. 認証が必要な API では `Authorization: Bearer <accessToken>` をヘッダーに付与
3. アクセストークン失効時は `POST /api/auth/refresh` に `refreshToken` を渡し再発行

---

## エンドポイント一覧

### 認証 API

| メソッド | パス | 認証 | リクエスト例 | レスポンス例 |
| --- | --- | --- | --- | --- |
| POST | `/api/auth/signup` | 不要 | `{"username":"alice","email":"alice@example.com","password":"pass1234"}` | `{accessToken, refreshToken, user}` |
| POST | `/api/auth/signin` | 不要 | `{"email":"alice@example.com","password":"pass1234"}` | `{accessToken, refreshToken, user}` |
| POST | `/api/auth/refresh` | 不要 | `{"refreshToken":"<token>"}` | `{accessToken, refreshToken}` |
| POST | `/api/auth/google/token` | 不要 | `{"credential":"<id_token>"}` | `{accessToken, refreshToken, user, isNewUser}` |
| POST | `/api/auth/google` | 不要 | `{"code":"<authorization_code>"}` | `{accessToken, refreshToken, user, isNewUser}` |

詳細: [認証API詳細](detailed/authentication.md)

### 題材 API

| メソッド | パス | 認証 | リクエスト例 | レスポンス例 |
| --- | --- | --- | --- | --- |
| GET | `/api/subjects` | 不要 | - | `[{subjectId, title, description, maxSections, createdAt}]` |
| GET | `/api/subjects/{subjectId}` | 不要 | - | `{subjectId, title, description, maxSections, createdAt}` |
| POST | `/api/subjects` | `ROLE_ADMIN` | `{subjectId, title, description, maxSections}` | `{subjectId, title, ...}` |
| PUT | `/api/subjects/{subjectId}` | `ROLE_ADMIN` | `{title, description, maxSections}` | `{subjectId, title, ...}` |
| DELETE | `/api/subjects/{subjectId}` | `ROLE_ADMIN` | - | 204 No Content |

詳細: [題材・セクションAPI詳細](detailed/subjects_sections.md)

### セクション API

| メソッド | パス | 認証 | リクエスト例 | レスポンス例 |
| --- | --- | --- | --- | --- |
| GET | `/api/subjects/{subjectId}/sections` | 不要 | - | `[{subjectId, sectionId, title, description, imageUrl}]` |
| GET | `/api/subjects/{subjectId}/sections/{sectionId}` | 不要 | - | `{subjectId, sectionId, title, description, imageUrl}` |
| POST | `/api/subjects/{subjectId}/sections` | `ROLE_ADMIN` | `multipart/form-data: sectionId, title, description, image` | `{subjectId, sectionId, title, description, imageUrl}` |
| PUT | `/api/subjects/{subjectId}/sections/{sectionId}` | `ROLE_ADMIN` | `multipart/form-data: title, description, image` | `{subjectId, sectionId, title, description, imageUrl}` |
| DELETE | `/api/subjects/{subjectId}/sections/{sectionId}` | `ROLE_ADMIN` | - | `{message}` |

**画像アップロード（POST/PUT）**
- Content-Type: `multipart/form-data`
- 画像形式: JPEG, PNG, GIF, WebP
- 最大サイズ: 5MB
- 画像が登録されている場合、レスポンスの `imageUrl` にS3のURLが含まれます

詳細: [題材・セクションAPI詳細](detailed/subjects_sections.md)

### 進捗 API（認証必須）

| メソッド | パス | リクエスト例 | レスポンス例 |
| --- | --- | --- | --- |
| GET | `/api/progress/subjects/{subjectId}` | - | `{userId, subjectId, progressPercentage, clearedCount, totalSections, clearedSections}` |
| GET | `/api/progress/subjects/{subjectId}/sections/{sectionId}` | - | `{isCleared}` |
| POST | `/api/progress/subjects/{subjectId}/sections` | `{sectionId}` | `{message, sectionId, completedAt}` |
| DELETE | `/api/progress/subjects/{subjectId}/sections/{sectionId}` | - | `{message}` |

詳細: [進捗管理API詳細](detailed/progress.md)

### プロフィール API（認証必須）

| メソッド | パス | リクエスト例 | レスポンス例 |
| --- | --- | --- | --- |
| GET | `/api/profile` | - | `{userId, username, email, profileImageUrl, createdAt}` |
| POST | `/api/profile/image` | `multipart/form-data: image` | `{message, profile}` |
| DELETE | `/api/profile/image` | - | `{message, profile}` |
| PUT | `/api/profile/username` | `{username}` | `{message, profile}` |

**画像アップロード（POST）**
- Content-Type: `multipart/form-data`
- 画像形式: JPEG, PNG, GIF, WebP
- 最大サイズ: 5MB

詳細: [プロフィールAPI詳細](detailed/profile.md)

### 管理者 API

| メソッド | パス | 認証 | リクエスト例 | レスポンス例 |
| --- | --- | --- | --- | --- |
| POST | `/api/admin/users` | `X-Admin-Key` ヘッダー | `{email, username, password}` | `{userId, email, username, role}` |

詳細: [管理者API詳細](detailed/admin.md)

---

## 実装例

### TypeScript/JavaScript での実装

```typescript
// 認証
const signin = async (email: string, password: string) => {
  const res = await fetch('/api/auth/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  localStorage.setItem('accessToken', data.accessToken);
  return data;
};

// 認証付きリクエスト
const fetchProgress = async (subjectId: number) => {
  const token = localStorage.getItem('accessToken');
  const res = await fetch(`/api/progress/subjects/${subjectId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await res.json();
};

// 画像アップロード（セクション更新）
const updateSectionWithImage = async (
  subjectId: number, 
  sectionId: number, 
  imageFile: File
) => {
  const token = localStorage.getItem('accessToken');
  const formData = new FormData();
  formData.append('image', imageFile);
  
  const res = await fetch(
    `/api/subjects/${subjectId}/sections/${sectionId}`,
    {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    }
  );
  return await res.json();
};

// プロフィール取得
const fetchProfile = async () => {
  const token = localStorage.getItem('accessToken');
  const res = await fetch('/api/profile', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await res.json();
};

// プロフィール画像アップロード
const uploadProfileImage = async (imageFile: File) => {
  const token = localStorage.getItem('accessToken');
  const formData = new FormData();
  formData.append('image', imageFile);
  
  const res = await fetch('/api/profile/image', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
  return await res.json();
};
```

---

## 共通レスポンス

- すべて JSON 形式
- 成功時: 200 / 201 / 204
- エラー時: `{error: "エラーメッセージ"}`

### HTTP ステータスコード

| コード | 説明 |
| --- | --- |
| 200 | 成功（取得・更新・削除） |
| 201 | 成功（作成） |
| 204 | 成功（レスポンスボディなし） |
| 400 | バリデーションエラー、ドメインルール違反 |
| 401 | JWT 不正または欠如 |
| 403 | 権限不足 |
| 404 | リソースなし |
| 409 | 重複 |
| 500 | サーバーエラー |

詳細: [共通仕様・エラーレスポンス](detailed/common.md)
