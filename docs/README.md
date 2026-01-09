# J15 Backend API ドキュメント

## ドキュメント構成

### クイックリファレンス

**[API_quick_reference.md](API_quick_reference.md)** - フロントエンド開発者が実装に必要な情報を最短で確認できるリファレンス

- エンドポイント一覧
- リクエスト/レスポンス例
- 実装例（TypeScript/JavaScript）

### 詳細リファレンス

詳細な仕様は `detailed/` フォルダ内の各機能別ドキュメントを参照してください。

- **[common.md](detailed/common.md)** - 共通仕様・エラーレスポンス
- **[authentication.md](detailed/authentication.md)** - 認証API詳細
- **[subjects_sections.md](detailed/subjects_sections.md)** - 題材・セクション管理API詳細
- **[progress.md](detailed/progress.md)** - 進捗管理API詳細
- **[admin.md](detailed/admin.md)** - 管理者API詳細

## 使い方

1. **実装開始時**: [API_quick_reference.md](API_quick_reference.md) を参照してエンドポイントとリクエスト/レスポンス形式を確認
2. **詳細仕様が必要な場合**: `detailed/` フォルダ内の該当機能のドキュメントを参照
3. **エラーハンドリング**: [common.md](detailed/common.md) を参照

