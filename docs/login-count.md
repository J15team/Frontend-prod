# ログインカウント機能

## 概要

ユーザーのログイン回数と最終ログイン日時を記録する機能。
初回ログイン検知によるチュートリアル表示や、ログイン統計の分析に使用する。

## ユースケース

1. **初回ログイン検知**: フロントエンドでチュートリアルを表示
2. **ログイン統計**: ユーザーのアクティビティ分析
3. **セキュリティ対策**: 将来的なブルートフォース防止の基盤

## データモデル

### users テーブル追加カラム

| カラム名      | 型                         | 説明             |
| ------------- | -------------------------- | ---------------- |
| login_count   | INTEGER NOT NULL DEFAULT 0 | ログイン回数     |
| last_login_at | TIMESTAMP WITH TIME ZONE   | 最終ログイン日時 |

### マイグレーション

`V11__add_login_count_to_users.sql`

```sql
ALTER TABLE users ADD COLUMN login_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN last_login_at TIMESTAMP WITH TIME ZONE;
```

## API 仕様

### ログインレスポンス

すべてのログイン方式（メール/パスワード、Google OAuth、GitHub OAuth）で以下のレスポンスを返す。

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "8d7f2f36-340d-44d0-b811-dbafe27fad76",
    "username": "testuser",
    "email": "test@example.com",
    "loginCount": 5
  },
  "isFirstLogin": false,
  "message": "ログインに成功しました"
}
```

### フィールド説明

| フィールド      | 型      | 説明                                             |
| --------------- | ------- | ------------------------------------------------ |
| isFirstLogin    | boolean | 初回ログインかどうか（チュートリアル表示判定用） |
| user.loginCount | integer | 現在のログイン回数（今回のログイン含む）         |

## 動作仕様

### ログイン時の処理フロー

1. 認証成功
2. `isFirstLogin`を判定（`loginCount == 0`）
3. `loginCount`をインクリメント
4. `lastLoginAt`を現在時刻に更新
5. レスポンスに`isFirstLogin`と更新後の`loginCount`を含める

### 初回ログインの定義

- `loginCount == 0`の状態でログインした場合
- 新規ユーザー登録時は`loginCount = 1`で作成されるため、登録直後は`isFirstLogin = true`

### 対応認証方式

| 認証方式          | 対応状況 |
| ----------------- | -------- |
| メール/パスワード | ✅       |
| Google OAuth      | ✅       |
| GitHub OAuth      | ✅       |

## フロントエンド実装ガイド

### チュートリアル表示の実装例

```typescript
const handleLogin = async (credentials) => {
  const response = await api.login(credentials);

  if (response.isFirstLogin) {
    // チュートリアルを表示
    showTutorial();
  }

  // 通常のログイン後処理
  setUser(response.user);
  setTokens(response.accessToken, response.refreshToken);
};
```

### 注意事項

- `isFirstLogin`はログイン成功時のみ`true`になる
- 新規登録（OAuth 含む）の場合も初回ログインとして扱われる
- `loginCount`は累積値であり、リセットされない

## 将来の拡張

### セキュリティ対策（未実装）

- 連続ログイン失敗回数のカウント
- アカウントロックアウト機能
- 不審なログインパターンの検知

### 統計機能（未実装）

- 日別/週別/月別のログイン統計
- アクティブユーザー数の集計
- ログイン頻度に基づくユーザーセグメント
