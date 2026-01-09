# 管理者 API 詳細

## 管理者ユーザー作成

管理者権限を持つユーザーを作成します。

**エンドポイント**

```http
POST /api/admin/users
```

**認証**: `X-Admin-Key` ヘッダー（APIキー認証）

**リクエストヘッダー**

```
Content-Type: application/json
X-Admin-Key: {ADMIN_API_KEY}
```

**リクエストボディ**

```json
{
  "email": "admin@example.com",
  "username": "adminuser",
  "password": "adminpass123"
}
```

| フィールド | 型     | 必須 | 説明           | バリデーション                        |
| ---------- | ------ | ---- | -------------- | ------------------------------------- |
| email      | string | ○    | メールアドレス | メール形式、一意制約                  |
| username   | string | ○    | ユーザー名     | 3~50 文字、英数字とアンダースコアのみ |
| password   | string | ○    | パスワード     | 8 文字以上                            |

**レスポンス**

**成功時 (201 Created)**

```json
{
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "email": "admin@example.com",
  "username": "adminuser",
  "role": "ROLE_ADMIN"
}
```

**エラー**

- **400 Bad Request**: バリデーションエラー
- **401 Unauthorized**: `X-Admin-Key` ヘッダーが無効または欠如
- **409 Conflict**: メールアドレスまたはユーザー名が既に存在

---

## 管理者ユーザー一覧取得

管理者権限を持つユーザーの一覧を取得します。

**エンドポイント**

```http
GET /api/admin/users
```

**認証**: `ROLE_ADMIN` が必要（JWTトークン）

**リクエストヘッダー**

```
Authorization: Bearer {accessToken}
```

**レスポンス**

**成功時 (200 OK)**

```json
{
  "admins": [
    {
      "userId": "123e4567-e89b-12d3-a456-426614174000",
      "email": "admin@example.com",
      "username": "adminuser",
      "role": "ROLE_ADMIN"
    }
  ]
}
```

**エラー**

- **401 Unauthorized**: 認証トークンが無効または期限切れ
- **403 Forbidden**: 管理者権限がない

---

## 管理者ユーザー詳細取得

特定の管理者ユーザーの詳細を取得します。

**エンドポイント**

```http
GET /api/admin/users/{userId}
```

**認証**: `ROLE_ADMIN` が必要（JWTトークン）

**リクエストヘッダー**

```
Authorization: Bearer {accessToken}
```

**パスパラメータ**

| パラメータ | 型     | 説明        |
| ---------- | ------ | ----------- |
| userId     | string | ユーザー ID |

**レスポンス**

**成功時 (200 OK)**

```json
{
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "email": "admin@example.com",
  "username": "adminuser",
  "role": "ROLE_ADMIN"
}
```

**エラー**

- **401 Unauthorized**: 認証トークンが無効または期限切れ
- **403 Forbidden**: 管理者権限がない
- **404 Not Found**: ユーザーが存在しない

---

## 管理者ユーザー更新

管理者ユーザーの情報を更新します。

**エンドポイント**

```http
PUT /api/admin/users/{userId}
```

**認証**: `ROLE_ADMIN` が必要（JWTトークン）

**リクエストヘッダー**

```
Content-Type: application/json
Authorization: Bearer {accessToken}
```

**パスパラメータ**

| パラメータ | 型     | 説明        |
| ---------- | ------ | ----------- |
| userId     | string | ユーザー ID |

**リクエストボディ**

```json
{
  "username": "updatedadmin",
  "email": "updated@example.com"
}
```

| フィールド | 型     | 必須 | 説明           | バリデーション                        |
| ---------- | ------ | ---- | -------------- | ------------------------------------- |
| username   | string | ×    | ユーザー名     | 3~50 文字、英数字とアンダースコアのみ |
| email      | string | ×    | メールアドレス | メール形式、一意制約                  |

**レスポンス**

**成功時 (200 OK)**

```json
{
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "email": "updated@example.com",
  "username": "updatedadmin",
  "role": "ROLE_ADMIN"
}
```

**エラー**

- **400 Bad Request**: バリデーションエラー
- **401 Unauthorized**: 認証トークンが無効または期限切れ
- **403 Forbidden**: 管理者権限がない
- **404 Not Found**: ユーザーが存在しない
- **409 Conflict**: メールアドレスが既に存在

---

## 管理者ユーザー削除

管理者ユーザーを削除します。

**エンドポイント**

```http
DELETE /api/admin/users/{userId}
```

**認証**: `ROLE_ADMIN` が必要（JWTトークン）

**リクエストヘッダー**

```
Authorization: Bearer {accessToken}
```

**パスパラメータ**

| パラメータ | 型     | 説明        |
| ---------- | ------ | ----------- |
| userId     | string | ユーザー ID |

**レスポンス**

**成功時 (204 No Content)**

レスポンスボディなし

**エラー**

- **401 Unauthorized**: 認証トークンが無効または期限切れ
- **403 Forbidden**: 管理者権限がない
- **404 Not Found**: ユーザーが存在しない

---

## フロントエンド実装例

### 管理者ユーザー作成（APIキー認証）

```typescript
const createAdminUser = async (
  email: string,
  username: string,
  password: string,
  adminKey: string
) => {
  const response = await fetch('/api/admin/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-Key': adminKey
    },
    body: JSON.stringify({ email, username, password })
  });

  if (response.status === 201) {
    return await response.json();
  } else if (response.status === 401) {
    throw new Error('管理者キーが無効です');
  }
};
```

### 管理者ユーザー一覧取得

```typescript
const fetchAdminUsers = async () => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch('/api/admin/users', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (response.ok) {
    const data = await response.json();
    return data.admins;
  }
};
```

