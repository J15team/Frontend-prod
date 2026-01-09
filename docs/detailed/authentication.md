# 認証 API 詳細

## 概要

J15 Backend はJWTトークンによる認証を実装しています。

**認証が必要なエンドポイント**
- 進捗管理API（`/api/progress/**`）
- 題材の作成・更新・削除（`ROLE_ADMIN`権限が必要）

**認証方法**

リクエストヘッダーに以下を含めます：

```
Authorization: Bearer {accessToken}
```

**トークンの取得**

サインインAPIでアクセストークンとリフレッシュトークンを取得できます。

---

## サインアップ

新規ユーザーを登録します。

**エンドポイント**

```http
POST /api/auth/signup
```

**認証**: 不要

**リクエストヘッダー**

```
Content-Type: application/json
```

**リクエストボディ**

```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
```

| フィールド | 型     | 必須 | 説明           | バリデーション                        |
| ---------- | ------ | ---- | -------------- | ------------------------------------- |
| username   | string | ○    | ユーザー名     | 3~50 文字、英数字とアンダースコアのみ |
| email      | string | ○    | メールアドレス | メール形式、一意制約                  |
| password   | string | ○    | パスワード     | 8 文字以上                            |

**レスポンス**

**成功時 (201 Created)**

```json
{
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "username": "testuser",
  "email": "test@example.com",
  "createdAt": "2025-12-06T10:00:00Z"
}
```

**エラー**

- **400 Bad Request**: バリデーションエラー
- **409 Conflict**: メールアドレスまたはユーザー名が既に存在

---

## サインイン

ユーザー認証を行います。

**エンドポイント**

```http
POST /api/auth/signin
```

**認証**: 不要

**リクエストヘッダー**

```
Content-Type: application/json
```

**リクエストボディ**

```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

| フィールド | 型     | 必須 | 説明           |
| ---------- | ------ | ---- | -------------- |
| email      | string | ○    | メールアドレス |
| password   | string | ○    | パスワード     |

**レスポンス**

**成功時 (200 OK)**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "username": "testuser",
    "email": "test@example.com"
  }
}
```

| フィールド   | 型     | 説明                                     |
| ------------ | ------ | ---------------------------------------- |
| accessToken  | string | アクセストークン（JWT）、APIリクエストに使用 |
| refreshToken | string | リフレッシュトークン（JWT）、トークン更新に使用 |
| user         | object | ユーザー情報                             |
| user.id      | string | ユーザーID（UUID形式）                   |
| user.username | string | ユーザー名                               |
| user.email   | string | メールアドレス                           |

**エラー**

- **400 Bad Request**: メールアドレスまたはパスワードが不正

---

## トークンリフレッシュ

アクセストークンが失効した場合、リフレッシュトークンを使用して新しいアクセストークンを取得します。

**エンドポイント**

```http
POST /api/auth/refresh
```

**認証**: 不要

**リクエストヘッダー**

```
Content-Type: application/json
```

**リクエストボディ**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

| フィールド   | 型     | 必須 | 説明                   |
| ------------ | ------ | ---- | ---------------------- |
| refreshToken | string | ○    | リフレッシュトークン   |

**レスポンス**

**成功時 (200 OK)**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

| フィールド   | 型     | 説明                                     |
| ------------ | ------ | ---------------------------------------- |
| accessToken  | string | 新しいアクセストークン（JWT）             |
| refreshToken | string | リフレッシュトークン（JWT）               |

**エラー**

- **400 Bad Request**: リフレッシュトークンが無効または期限切れ
- **400 Bad Request**: ユーザーが見つからない

---

## フロントエンド実装例

```typescript
// サインアップ
const signup = async (username: string, email: string, password: string) => {
  const response = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });

  if (response.status === 201) {
    const user = await response.json();
    localStorage.setItem("userId", user.userId);
    return user;
  }
};

// サインイン
const signin = async (email: string, password: string) => {
  const response = await fetch("/api/auth/signin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (response.ok) {
    const data = await response.json();
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("userId", data.user.id);
    return data;
  }
};

// トークンリフレッシュ
const refreshToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  const response = await fetch("/api/auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (response.ok) {
    const data = await response.json();
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    return data;
  }
};
```

---

## Google OAuth2.0 ログイン（ID Token方式 - 推奨）🏆

Google Identity Services (GIS) を使用したポップアップログインです。
ページ遷移なしでシームレスな認証体験を提供します。

**エンドポイント**

```http
POST /api/auth/google/token
```

**認証**: 不要

**フロー概要**

1. フロントエンドでGoogle Sign-In SDKを初期化
2. ユーザーが「Googleでログイン」ボタンをクリック
3. ポップアップでGoogleログイン（ページ遷移なし）
4. ID Token（credential）を取得
5. バックエンドAPIにID Tokenを送信
6. バックエンドがID Tokenを検証し、JWTトークンを発行

**リクエストボディ**

```json
{
  "credential": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

| フィールド | 型     | 必須 | 説明 |
| ---------- | ------ | ---- | ---- |
| credential | string | ○    | Google Sign-Inから取得したID Token |

**レスポンス**

**成功時 (200 OK)**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "username": "yamada_taro",
    "email": "yamada@gmail.com",
    "profileImageUrl": "https://lh3.googleusercontent.com/..."
  },
  "isNewUser": true,
  "message": "アカウントを作成しました"
}
```

| フィールド | 型 | 説明 |
| ---------- | --- | ---- |
| accessToken | string | JWT アクセストークン |
| refreshToken | string | JWT リフレッシュトークン |
| user | object | ユーザー情報 |
| user.profileImageUrl | string? | Googleプロフィール画像URL |
| isNewUser | boolean | 新規登録されたユーザーの場合 `true` |
| message | string | 結果メッセージ |

**エラー**

- **400 Bad Request**: ID Tokenが無効、またはGoogle認証に失敗
- **409 Conflict**: 同じメールアドレスで別のアカウントが既に存在

---

### フロントエンド実装例（ID Token方式 - 推奨）

```html
<!-- Google Sign-In SDK を読み込み -->
<script src="https://accounts.google.com/gsi/client" async defer></script>

<!-- ログインボタン -->
<div id="g_id_onload"
     data-client_id="YOUR_GOOGLE_CLIENT_ID"
     data-callback="handleGoogleCredential"
     data-auto_prompt="false">
</div>
<div class="g_id_signin"
     data-type="standard"
     data-size="large"
     data-theme="outline"
     data-text="sign_in_with"
     data-shape="rectangular"
     data-logo_alignment="left">
</div>
```

```typescript
// Google Sign-Inコールバック
async function handleGoogleCredential(response: google.accounts.id.CredentialResponse) {
  // response.credential = ID Token
  const res = await fetch("/api/auth/google/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credential: response.credential }),
  });

  if (res.ok) {
    const data = await res.json();
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("userId", data.user.id);
    
    if (data.isNewUser) {
      window.location.href = "/onboarding";
    } else {
      window.location.href = "/home";
    }
  } else if (res.status === 409) {
    alert("このメールアドレスは既に登録されています");
  }
}

// プログラムからログインを開始する場合
function startGoogleLogin() {
  google.accounts.id.initialize({
    client_id: "YOUR_GOOGLE_CLIENT_ID",
    callback: handleGoogleCredential,
  });
  google.accounts.id.prompt(); // One Tapを表示
}
```

---

## Google OAuth2.0 ログイン（Authorization Code方式 - レガシー）

リダイレクトフローを使用した認証方式です。
ID Token方式が使用できない場合の代替手段として利用できます。

**エンドポイント**

```http
POST /api/auth/google
```

**認証**: 不要

**フロー概要**

1. フロントエンドでGoogle OAuth認証画面にリダイレクト
2. ユーザーがGoogleでログイン
3. コールバックURLに認証コードが付与されてリダイレクト
4. バックエンドAPIに認証コードを送信
5. バックエンドがGoogleからユーザー情報を取得し、JWTトークンを発行

**リクエストボディ**

```json
{
  "code": "4/0AY0e-g..."
}
```

| フィールド | 型     | 必須 | 説明 |
| ---------- | ------ | ---- | ---- |
| code       | string | ○    | Google OAuth認証後に取得した認証コード |

**レスポンス**

ID Token方式と同じレスポンス形式です。

**エラー**

- **400 Bad Request**: 認証コードが無効、またはGoogle認証に失敗
- **409 Conflict**: 同じメールアドレスで別のアカウントが既に存在

---

### フロントエンド実装例（Authorization Code方式 - レガシー）

```typescript
// Google OAuth設定（Google Cloud Consoleで取得）
const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID";
const REDIRECT_URI = "http://localhost:3000/auth/google/callback";

// Googleログイン画面を開く（リダイレクト）
const startGoogleLogin = () => {
  const scope = encodeURIComponent("openid email profile");
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${scope}&access_type=offline`;
  window.location.href = url;
};

// コールバックページで認証コードを処理
const handleGoogleCallback = async () => {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");

  if (!code) {
    throw new Error("認証コードが見つかりません");
  }

  const response = await fetch("/api/auth/google", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });

  if (response.ok) {
    const data = await response.json();
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("userId", data.user.id);
    
    if (data.isNewUser) {
      window.location.href = "/onboarding";
    } else {
      window.location.href = "/home";
    }
    return data;
  } else if (response.status === 409) {
    throw new Error("このメールアドレスは既に登録されています");
  }
};
```

