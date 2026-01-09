# プロフィール API 詳細

ユーザーのプロフィール情報（ユーザー名、プロフィール画像）を管理します。

## プロフィール取得

認証済みユーザーの自分のプロフィール情報を取得します。

**エンドポイント**

```http
GET /api/profile
```

**認証**: 必須（JWTトークン）

**リクエストヘッダー**

```
Authorization: Bearer {accessToken}
```

**レスポンス**

**成功時 (200 OK)**

```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "username": "testuser",
  "email": "test@example.com",
  "profileImageUrl": "https://bucket.s3.ap-northeast-1.amazonaws.com/profile-images/xxx.jpg",
  "createdAt": "2025-12-06T10:00:00Z"
}
```

| フィールド      | 型          | 説明                                    |
| --------------- | ----------- | --------------------------------------- |
| userId          | string      | ユーザー ID（UUID 形式）                |
| username        | string      | ユーザー名                              |
| email           | string      | メールアドレス                          |
| profileImageUrl | string/null | プロフィール画像URL（未設定時はnull）   |
| createdAt       | string      | 登録日時（ISO 8601形式）                |

**エラー**

- **401 Unauthorized**: 認証トークンがない、または無効
- **404 Not Found**: ユーザーが見つからない

---

## プロフィール画像アップロード

プロフィール画像をアップロードまたは更新します。既存の画像がある場合は上書きされます。

**エンドポイント**

```http
POST /api/profile/image
```

**認証**: 必須（JWTトークン）

**リクエストヘッダー**

```
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data
```

**リクエストボディ**

| フィールド | 型   | 必須 | 説明                           |
| ---------- | ---- | ---- | ------------------------------ |
| image      | file | ○    | プロフィール画像ファイル       |

**画像の制約**

- 対応形式: JPEG, PNG, GIF, WebP
- 最大サイズ: 5MB

**レスポンス**

**成功時 (200 OK)**

```json
{
  "message": "プロフィール画像を更新しました",
  "profile": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "username": "testuser",
    "email": "test@example.com",
    "profileImageUrl": "https://bucket.s3.ap-northeast-1.amazonaws.com/profile-images/xxx.jpg",
    "createdAt": "2025-12-06T10:00:00Z"
  }
}
```

**エラー**

- **400 Bad Request**: ファイル形式が不正、またはサイズ超過
- **401 Unauthorized**: 認証トークンがない、または無効

---

## プロフィール画像削除

プロフィール画像を削除します。

**エンドポイント**

```http
DELETE /api/profile/image
```

**認証**: 必須（JWTトークン）

**リクエストヘッダー**

```
Authorization: Bearer {accessToken}
```

**レスポンス**

**成功時 (200 OK)**

```json
{
  "message": "プロフィール画像を削除しました",
  "profile": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "username": "testuser",
    "email": "test@example.com",
    "profileImageUrl": null,
    "createdAt": "2025-12-06T10:00:00Z"
  }
}
```

**エラー**

- **401 Unauthorized**: 認証トークンがない、または無効
- **404 Not Found**: ユーザーが見つからない

---

## ユーザー名更新

ユーザー名を変更します。

**エンドポイント**

```http
PUT /api/profile/username
```

**認証**: 必須（JWTトークン）

**リクエストヘッダー**

```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**リクエストボディ**

```json
{
  "username": "newusername"
}
```

| フィールド | 型     | 必須 | 説明           | バリデーション       |
| ---------- | ------ | ---- | -------------- | -------------------- |
| username   | string | ○    | 新しいユーザー名 | 1〜20文字、一意制約  |

**レスポンス**

**成功時 (200 OK)**

```json
{
  "message": "ユーザー名を更新しました",
  "profile": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "username": "newusername",
    "email": "test@example.com",
    "profileImageUrl": "https://bucket.s3.ap-northeast-1.amazonaws.com/profile-images/xxx.jpg",
    "createdAt": "2025-12-06T10:00:00Z"
  }
}
```

**エラー**

- **400 Bad Request**: バリデーションエラー
  - ユーザー名が空
  - ユーザー名が20文字を超過
  - ユーザー名が既に使用されている
- **401 Unauthorized**: 認証トークンがない、または無効

---

## フロントエンド実装例

### プロフィール取得

```typescript
const fetchProfile = async () => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch('/api/profile', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return await response.json();
};

// 使用例
const profile = await fetchProfile();
console.log(profile.username);
console.log(profile.profileImageUrl);
```

### プロフィール画像アップロード

```typescript
const uploadProfileImage = async (imageFile: File) => {
  const token = localStorage.getItem('accessToken');
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await fetch('/api/profile/image', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  if (response.ok) {
    const result = await response.json();
    console.log('更新成功:', result.profile.profileImageUrl);
    return result.profile;
  } else {
    const error = await response.json();
    throw new Error(error.message);
  }
};

// React での使用例
const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (file) {
    try {
      const updatedProfile = await uploadProfileImage(file);
      setProfile(updatedProfile);
    } catch (error) {
      alert('画像のアップロードに失敗しました');
    }
  }
};
```

### プロフィール画像削除

```typescript
const deleteProfileImage = async () => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch('/api/profile/image', {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (response.ok) {
    const result = await response.json();
    return result.profile;
  }
};
```

### ユーザー名更新

```typescript
const updateUsername = async (newUsername: string) => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch('/api/profile/username', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username: newUsername })
  });

  if (response.ok) {
    const result = await response.json();
    return result.profile;
  } else {
    const error = await response.json();
    throw new Error(error.message);
  }
};
```

### プロフィール画面の実装例

```tsx
// ProfileScreen.tsx
import { useState, useEffect } from 'react';

const ProfileScreen = () => {
  const [profile, setProfile] = useState(null);
  const [newUsername, setNewUsername] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchProfile().then(setProfile);
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const updated = await uploadProfileImage(file);
      setProfile(updated);
    }
  };

  const handleUsernameUpdate = async () => {
    const updated = await updateUsername(newUsername);
    setProfile(updated);
    setIsEditing(false);
  };

  if (!profile) return <div>読み込み中...</div>;

  return (
    <div className="profile-container">
      {/* プロフィール画像 */}
      <div className="profile-image">
        {profile.profileImageUrl ? (
          <img src={profile.profileImageUrl} alt="プロフィール" />
        ) : (
          <div className="default-avatar">👤</div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
        />
      </div>

      {/* ユーザー名 */}
      <div className="username-section">
        {isEditing ? (
          <>
            <input
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="新しいユーザー名"
            />
            <button onClick={handleUsernameUpdate}>保存</button>
            <button onClick={() => setIsEditing(false)}>キャンセル</button>
          </>
        ) : (
          <>
            <span>{profile.username}</span>
            <button onClick={() => {
              setNewUsername(profile.username);
              setIsEditing(true);
            }}>
              編集
            </button>
          </>
        )}
      </div>

      {/* メールアドレス（読み取り専用） */}
      <div className="email-section">
        <span>{profile.email}</span>
      </div>
    </div>
  );
};
```

---

## 注意事項

### 画像保存先

プロフィール画像はAWS S3の `profile-images/` フォルダに保存されます。
URLは以下の形式になります:

```
https://{bucket}.s3.{region}.amazonaws.com/profile-images/{uuid}.{ext}
```

### 画像更新時の動作

画像を更新すると、以前の画像はS3から自動的に削除されます。

### ユーザー名の制約

- 1〜20文字
- 他のユーザーと重複不可
- 変更は何度でも可能
