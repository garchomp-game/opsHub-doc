---
title: 環境構築ガイド
description: ローカル開発環境のセットアップ手順
---

## 目的 / In-Out / Related
- **目的**: 開発者が最短でローカル開発環境を立ち上げる手順を提供する
- **対象範囲（In）**: Docker Compose, Next.js, Supabase, DB初期化
- **対象範囲（Out）**: 本番デプロイ手順（将来作成）
- **Related**: [アーキテクチャ概要](../../spec/architecture/) / [Supabase規約](../../spec/supabase-client/) / [DB設計](../db/)

---

## 前提条件

| ツール | バージョン | 用途 |
|---|---|---|
| Node.js | 20 LTS 以上 | Next.js ランタイム |
| Docker / Docker Compose | 最新安定版 | Supabase self-host |
| Git | 最新安定版 | ソース管理 |
| pnpm（推奨）/ npm | — | パッケージ管理 |

---

## 1. リポジトリのクローン

```bash
git clone <repository-url>
cd opshub
```

## 2. Supabase のセットアップ

### 2.1 Docker Compose 起動

```bash
# Supabase self-host 環境を起動
cp .env.example .env
docker compose up -d
```

### 2.2 環境変数の確認

`.env.example` をコピーして `.env` を作成。以下の変数を設定：

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<supabase-service-role-key>

# Supabase Auth
SUPABASE_AUTH_EXTERNAL_URL=http://localhost:8000
SUPABASE_AUTH_JWT_SECRET=<jwt-secret>

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> `.env.example` にキーのデフォルト値（docker compose 用）を記載しておく。
> **本番のキーをコミットしないこと。**

### 2.3 Supabase Studio で確認

ブラウザで `http://localhost:3100` を開き、Supabase Studio が起動していることを確認。

---

## 3. DBマイグレーション

### 3.1 初回マイグレーション実行

```bash
# Supabase CLI でマイグレーション適用
npx supabase db push --local
```

または、Docker 起動時に自動実行される `supabase/migrations/` 内のSQLファイルで初期化。

### 3.2 マイグレーションファイル命名規約

```
supabase/migrations/
├── 20260101_000000_create_tenants.sql
├── 20260101_000001_create_user_roles.sql
├── 20260101_000002_create_projects.sql
├── 20260101_000003_create_tasks.sql
├── 20260101_000004_create_workflows.sql
├── 20260101_000005_create_timesheets.sql
├── 20260101_000006_create_expenses.sql
├── 20260101_000007_create_audit_logs.sql
├── 20260101_000008_create_notifications.sql
├── 20260101_000009_create_rls_policies.sql
├── 20260101_000010_create_rls_helpers.sql
└── 20260101_000011_create_triggers.sql
```

---

## 4. シードデータ

### 4.1 テスト用データの投入

```bash
npx supabase db seed --local
```

`supabase/seed.sql` に以下のテストデータを用意：

| データ | 内容 |
|---|---|
| テナント | `テスト株式会社`（tenant_id 固定値） |
| ユーザー | admin@test.com (Tenant Admin), pm@test.com (PM), member@test.com (Member) |
| パスワード | 全ユーザー共通: `password123`（開発用） |
| プロジェクト | 「サンプルプロジェクト」（status: active） |
| タスク | 3件（todo, in_progress, done 各1件） |

### 4.2 テスト用ログイン情報

| ロール | メール | パスワード |
|---|---|---|
| Tenant Admin | admin@test.com | password123 |
| PM | pm@test.com | password123 |
| Member | member@test.com | password123 |
| Approver | approver@test.com | password123 |
| Accounting | accounting@test.com | password123 |

---

## 5. Next.js アプリの起動

```bash
# 依存パッケージのインストール
pnpm install

# 型生成（Supabase スキーマから）
npx supabase gen types typescript --local > src/types/database.ts

# 開発サーバー起動
pnpm dev
```

ブラウザで `http://localhost:3000` を開き、ログイン画面が表示されることを確認。

---

## 6. 型生成の自動化

DB スキーマ変更時は型を再生成する：

```bash
# スキーマ変更後
npx supabase gen types typescript --local > src/types/database.ts
```

> 将来的に CI/CD で自動化予定（未決事項参照）

---

## 7. ディレクトリ構成

```
opshub/
├── docker-compose.yml           # Supabase self-host
├── supabase/
│   ├── migrations/              # DDL マイグレーション
│   ├── seed.sql                 # テスト用シードデータ
│   └── config.toml              # Supabase CLI 設定
├── src/
│   ├── app/                     # Next.js App Router
│   ├── actions/                 # Server Actions
│   ├── components/              # UI コンポーネント
│   ├── lib/                     # ユーティリティ
│   └── types/                   # 型定義（自動生成含む）
├── .env.example                 # 環境変数テンプレート
├── package.json
└── tsconfig.json
```

---

## トラブルシューティング

| 症状 | 解決方法 |
|---|---|
| Supabase が起動しない | `docker compose logs` でエラー確認。ポート競合の場合はdocker compose.ymlで変更 |
| DB接続エラー | `.env` の `SUPABASE_URL` を確認。Docker が起動済みか確認 |
| 型生成でエラー | Supabase CLI がインストール済みか確認: `npx supabase --version` |
| RLS でデータが取れない | `seed.sql` でユーザーロールが正しく設定されているか確認 |
