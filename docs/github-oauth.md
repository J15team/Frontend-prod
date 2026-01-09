# GitHub OAuth 認証 仕様書

## 概要

GitHub OAuth2.0 を使用したソーシャルログイン機能。ユーザーは GitHub アカウントを使ってログイン/新規登録が可能。

## エンドポイント

### POST /api/auth/github

GitHub の認証コードを使用してログイン/新規登録を行う。

**リクエスト:**

```json
{
  "code": "GitHubから取得した認証コード"
}
```

**レスポンス (成功時):**

```json
{
  "accessToken": "JWT access token",
  "refreshToken": "JWT refresh token",
  "user": {
    "id": "ユーザーID (UUID)",
    "username": "ユーザー名",
    "email": "メールアドレス",
    "profileImageUrl": "GitHubアバターURL"
  },
  "isNewUser": true,
  "message": "アカウントを作成しました"
}
```

**エラーレスポンス:**

- `400 Bad Request`: 認証コードが無効、または GitHub API エラー
- `409 Conflict`: 同じメールアドレスで既存アカウントが存在

---

## GitHub OAuth App 設定手順

### 1. GitHub OAuth App の作成

1. [GitHub Developer Settings](https://github.com/settings/developers) にアクセス
2. 「OAuth Apps」→「New OAuth App」をクリック
3. 以下を入力:
   - **Application name**: J15 Backend (任意の名前)
   - **Homepage URL**: `https://your-frontend-domain.com`
   - **Authorization callback URL**: `https://your-frontend-domain.com/auth/github/callback`
4. 「Register application」をクリック
5. **Client ID** をコピー
6. 「Generate a new client secret」をクリックして **Client Secret** をコピー

### 2. 環境変数の設定

#### ローカル開発

```bash
export GITHUB_CLIENT_ID="your-client-id"
export GITHUB_CLIENT_SECRET="your-client-secret"
```

#### AWS ECS (本番環境)

ECS タスク定義の環境変数に追加:

```json
{
  "name": "GITHUB_CLIENT_ID",
  "value": "your-client-id"
},
{
  "name": "GITHUB_CLIENT_SECRET",
  "valueFrom": "arn:aws:secretsmanager:ap-northeast-1:xxx:secret:github-oauth-secret"
}
```

---

## フロントエンド実装ガイド

### 1. GitHub ログインボタンの実装

```typescript
const GITHUB_CLIENT_ID = "your-client-id";
const REDIRECT_URI = "https://your-frontend-domain.com/auth/github/callback";

const handleGitHubLogin = () => {
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&scope=user:email`;
  window.location.href = githubAuthUrl;
};
```

### 2. コールバック処理

```typescript
// /auth/github/callback ページ
const GitHubCallback = () => {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
      authenticateWithGitHub(code);
    }
  }, []);

  const authenticateWithGitHub = async (code: string) => {
    try {
      const response = await fetch("/api/auth/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (response.ok) {
        // トークンを保存
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);

        // ホームページにリダイレクト
        window.location.href = "/";
      } else {
        // エラー処理
        console.error("GitHub認証エラー:", data.message);
      }
    } catch (error) {
      console.error("認証リクエストエラー:", error);
    }
  };

  return <div>認証中...</div>;
};
```

### 3. 必要なスコープ

| スコープ     | 説明                                   |
| ------------ | -------------------------------------- |
| `user:email` | ユーザーのメールアドレスを取得（必須） |

---

## 認証フロー

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│ ユーザー │     │フロント │     │バックエンド│     │ GitHub  │
└────┬────┘     └────┬────┘     └────┬────┘     └────┬────┘
     │               │               │               │
     │ ログインクリック│               │               │
     │──────────────>│               │               │
     │               │               │               │
     │               │ GitHubへリダイレクト           │
     │               │──────────────────────────────>│
     │               │               │               │
     │               │               │  認証画面表示  │
     │<──────────────────────────────────────────────│
     │               │               │               │
     │ 認証許可      │               │               │
     │──────────────────────────────────────────────>│
     │               │               │               │
     │               │ code付きでリダイレクト         │
     │               │<──────────────────────────────│
     │               │               │               │
     │               │ POST /api/auth/github         │
     │               │──────────────>│               │
     │               │               │               │
     │               │               │ code→token交換│
     │               │               │──────────────>│
     │               │               │               │
     │               │               │ ユーザー情報取得│
     │               │               │──────────────>│
     │               │               │               │
     │               │               │<──────────────│
     │               │               │               │
     │               │ JWT tokens    │               │
     │               │<──────────────│               │
     │               │               │               │
     │ ログイン完了   │               │               │
     │<──────────────│               │               │
```

---

## 注意事項

1. **Client Secret は絶対にフロントエンドに公開しない**
2. **本番環境では HTTPS を使用する**
3. **同じメールアドレスで既存アカウントがある場合は自動リンクせず、エラーを返す（セキュリティ上の理由）**
4. **GitHub でメールが非公開設定の場合、emails API から取得する**
