# Frontend Production - J15 Backend API Client

本番用のクリーンなReact + TypeScript + Vite実装のフロントエンドアプリケーション。
J15 Backend APIと連携し、認証・題材管理・セクション管理・進捗管理・管理者機能を提供します。

## プロジェクト概要

このプロジェクトは、MVVMアーキテクチャパターンに基づいた、本番用のクリーンな実装です。
検証用の `frontend-react` フォルダを参考に、全機能を継承しています。

### 主な機能

- **認証機能**: サインアップ、サインイン、トークンリフレッシュ
- **題材管理**: 題材の一覧表示と管理（CRUD操作）
- **セクション管理**: セクションの一覧表示と画像付きCRUD操作
- **進捗管理**: 学習進捗の追跡と管理
- **管理者機能**: Admin Portal経由の管理者ユーザー管理

## 技術スタック

- **React**: 19.2.3
- **TypeScript**: 5.7.3
- **Vite**: 6.2.0
- **React Router DOM**: 7.1.1
- **Axios**: 1.6.2
- **Marked**: 11.0.0 (Markdown parser)

## プロジェクト構成

```
frontend-prod/
├── src/
│   ├── models/           # データモデル定義
│   ├── services/         # API通信層
│   ├── viewmodels/       # ビジネスロジック層
│   ├── views/            # UIコンポーネント層
│   │   ├── auth/         # 認証関連ページ
│   │   ├── home/         # ホームページ
│   │   ├── subjects/     # 題材関連ページ
│   │   ├── sections/     # セクション関連ページ
│   │   ├── progress/     # 進捗管理ページ
│   │   ├── admin/        # 管理者ページ
│   │   ├── error/        # エラーページ
│   │   └── components/   # 共通コンポーネント
│   ├── utils/            # ユーティリティ関数
│   └── styles/           # スタイルシート
├── .env.example          # 環境変数の例
└── README.md
```

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.example` を参考に `.env` ファイルを作成してください。

```bash
# ローカル開発用APIエンドポイント（オプション）
VITE_LOCAL_API_BASE_URL=http://localhost:8080/api
```

デフォルトでは本番APIエンドポイントが使用されます：
- **本番**: `https://zu9mkxoir4.execute-api.ap-northeast-1.amazonaws.com/api`

### 3. 開発サーバーの起動

```bash
npm run dev
```

開発サーバーは `http://localhost:3000` で起動します。

### 4. ビルド

```bash
npm run build
```

本番用ビルドファイルは `dist/` ディレクトリに生成されます。

## API環境の切り替え

開発モードでは、画面上部に環境切り替えスイッチが表示されます。
- **本番** (Production): デフォルト設定
- **ローカル** (Local): ローカル開発環境用

本番ビルドでは自動的に本番APIエンドポイントが使用されます。

## アーキテクチャ: MVVM パターン

### Models (モデル)
- データ構造の定義
- API リクエスト/レスポンスの型定義

### Services (サービス)
- API 通信ロジック
- 外部システムとの統合

### ViewModels (ビューモデル)
- ビジネスロジックの実装
- 状態管理
- サービス層との橋渡し

### Views (ビュー)
- UIコンポーネント
- ユーザーインタラクション
- ビューモデルとの連携

## 主要なコンポーネント

### 認証
- **SigninView**: ユーザーサインイン
- **SignupView**: ユーザー登録
- **AdminSigninView**: 管理者サインイン
- **TokenRefreshView**: トークン更新

### 題材とセクション
- **SubjectsView**: 題材一覧
- **SectionsView**: セクション学習画面（プログレスバー、サイドバー付き）
- **SubjectManagementView**: 題材のCRUD操作
- **SectionManagementView**: セクションのCRUD操作（画像アップロード対応）

### 進捗と管理
- **ProgressInspectorView**: 進捗API検証ツール
- **AdminDashboardView**: 管理者ダッシュボード
- **AdminUsersView**: 管理者ユーザー管理

## 保護されたルート

認証が必要なページは `ProtectedRoute` コンポーネントで保護されています。
- `/subjects` - ログイン必須
- `/subjects/:id/sections` - ログイン必須
- `/progress` - ログイン必須
- `/admin/*` - 管理者権限必須

## デプロイ

### Vercel へのデプロイ

```bash
# Vercel CLI のインストール
npm install -g vercel

# デプロイ
vercel

# 本番デプロイ
vercel --prod
```

## ライセンス

このプロジェクトは学習・検証用途で作成されています。

## 注意事項

- 本番環境ではサンプル管理者アカウントやデフォルトの `ADMIN_API_KEY` を絶対に使用しないでください
- JWT トークンは localStorage に保存されます
- 管理者操作には X-Admin-Key ヘッダーが必要です
