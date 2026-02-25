---
title: "OpsHub プロジェクトナレッジ"
---

# OpsHub プロジェクトナレッジ

> 最終更新: 2026-02-25 10:56 JST

## プロジェクト概要

OpsHub = 業務統合SaaS（申請・プロジェクト・工数・経費・請求・ドキュメントを一元管理）

## 技術スタック

| 項目 | 技術 |
|---|---|
| フロントエンド | Next.js 16（App Router）+ TypeScript + Ant Design 6 |
| バックエンド | Supabase（Auth + PostgreSQL + RLS + Storage） |
| コンポーネント | Server Components + Client Components 分離 |
| 認証 | Supabase Auth（email/password + invite） |
| テスト | Vitest + jsdom（設定済み、テスト未作成） |
| ローカル環境 | Supabase CLI (`npx supabase start`) — Docker コンテナ11個を自動管理 |

## DB テーブル（14 テーブル）

tenants, user_roles, **profiles**, projects, project_members, tasks, workflows, timesheets, expenses, audit_logs, notifications, workflow_attachments, **invoices**, **invoice_items**, **documents**

## 共通パターン

- **Server Action**: `withAuth()` ラッパーで認証 + エラーハンドリング
- **監査ログ**: `writeAuditLog()` で全変更操作を記録
- **認証**: `requireAuth()` / `requireRole()` / `hasRole()` でアクセス制御
- **型**: `ActionResult<T>` で統一レスポンス
- **状態遷移**: `TASK_TRANSITIONS`, `PROJECT_TRANSITIONS`, `WORKFLOW_TRANSITIONS`, `INVOICE_STATUS_TRANSITIONS`
- **ユーザー表示名**: `profiles` テーブル JOIN（UUID → display_name）
- **共通定数**: `ROLE_LABELS`, `USER_STATUS_LABELS`, `USER_STATUS_COLORS`, `INVOICE_STATUS_LABELS`（types/index.ts）
- **WF採番**: `next_workflow_number()` RPC（FOR UPDATE ロック）
- **請求書採番**: `next_invoice_number()` RPC（`SELECT FOR UPDATE` 行ロック、`INV-YYYY-NNNN` 形式）

## Phase 2-3 追加パターン

### FormData Server Action パターン

`uploadDocument` は `FormData` を直接受け取るため `withAuth()` ラッパーに適合しない。手動で `requireAuth()` + `createClient()` + try-catch を実装。DB INSERT 失敗時は Storage ファイルを削除するロールバック処理を含む。

### Supabase Storage 連携

- バケット `project-documents`（`public: false`）
- テナント分離パス: `{tenant_id}/{project_id}/{uuid}_{filename}`
- ダウンロード: `signedURL`（有効期限 60秒）
- Storage RLS ポリシー: SELECT / INSERT / DELETE をテナント ID フォルダで分離
- クライアント側バリデーション: 10MB / 8種 MIME チェック
- 削除時は Storage + DB 両方を削除

### CSV エクスポート Route Handler

- **エンドポイント**: `GET /api/timesheets/export`
- **エンコーディング**: BOM 付き UTF-8（Excel 対応）
- **認証**: `getCurrentUser()` を使用（`requireAuth()` は redirect 問題あり — 後述「重要バグパターン」参照）
- **CSV エスケープ**: `escapeCsvField()` — ダブルクォート囲み + 内部 `"` → `""` エスケープ
- **権限別データ範囲**: Tenant Admin/Accounting=全体、PM=管轄PJ、Member=自分のみ

### 構造化ロガー

- **ファイル**: `lib/logger.ts`（外部ライブラリ不使用）
- **出力形式**: JSON（`LogEntry` 型: timestamp / level / message / context? / error?）
- **フィルタリング**: `LOG_LEVEL` 環境変数（デフォルト: `info`）
- **出力先**: `error` / `warn` → `console.error`、`info` / `debug` → `console.log`
- **移行**: 既存 `console.error` → `logger.error` に一括置換

### pg_trgm + GIN インデックス検索

- `CREATE EXTENSION IF NOT EXISTS pg_trgm;` で拡張有効化
- GIN インデックス: `workflows(title, description)`, `projects(name, description)`, `tasks(title)`, `expenses(description)`
- ILIKE パターン検索 + SQL メタ文字エスケープ（`%`, `_`, `\`）
- クエリ最大長: 100文字

### 横断検索パターン

- 4テーブル（workflows, projects, tasks, expenses）を `Promise.all` で並列検索
- `category = "all"` → 各10件、`category = 個別` → 20件/ページ（オフセットベース）
- 統一 `SearchResult` 型への正規化（API-G01 準拠）
- 経費はロール別フィルタ（Member/PM=自分のみ、Accounting/Admin=全件）

### 請求書明細パターン

- ヘッダー/明細 2テーブル構成（`invoices` + `invoice_items`）
- `invoice_items` FK に `ON DELETE CASCADE` — 請求書削除時に明細自動削除
- Editable Table: 行追加/削除、数量×単価の自動計算
- 合計計算: `subtotal = Σ(qty × price)`, `tax = FLOOR(subtotal × rate / 100)`, `total = subtotal + tax`
- 更新時は既存明細を全削除 → 新明細で再 INSERT

### ヘルスチェックエンドポイント

- `GET /api/health`（`force-dynamic` でキャッシュ無効化）
- DB 接続チェック: `createAdminClient()` で `tenants` テーブルに `select('id').limit(1)`
- 正常: `{ status: 'healthy', database: 'healthy' }`（200）
- 異常: `{ status: 'unhealthy' }`（**503** — HTTP ステータスも返す）

## レビューで発見された重要バグパターン

### 1. `!inner` JOIN によるデータ欠落

Supabase の `!inner` 修飾子は **INNER JOIN** を意味する。nullable FK（例: `expenses.workflow_id` は `ON DELETE SET NULL`）で `!inner` を使うと、FK が NULL のレコードが結果から除外される。

```diff
-.select("category, amount, workflows!inner(status)")
+.select("category, amount, workflow_id, workflows(status)")
```

### 2. `regex.test()` + グローバルフラグの連続呼出しバグ

`RegExp` に `gi`（global）フラグを付けて `.test()` で判定すると、`lastIndex` が更新され、連続呼び出しで**奇数番目のマッチがスキップ**される。

```diff
-regex.test(part) ? (
+part.toLowerCase() === query.toLowerCase() ? (
```

### 3. Route Handler での `requireAuth()` redirect 問題

`requireAuth()` は未認証時に `redirect("/login")` を呼ぶ。Route Handler の try-catch 内で使うと、`redirect()` が投げる `NEXT_REDIRECT` 例外がキャッチされ **500 エラー**として返される。Route Handler では `getCurrentUser()` を使い、`null` の場合は明示的に `401` を返す。

### 4. ヘルスチェック HTTP ステータス

DB エラー時にレスポンスボディだけ `unhealthy` にしても、HTTP ステータスが `200` のままだとロードバランサーが正常と判定する。必ず **HTTP 503** も返す。

## チケット進捗

| チケット | 状態 | レビュー |
|---|---|---|
| TICKET-02 テナント管理 | ✅ 完了 | ✅ レビュー済 |
| TICKET-03 ユーザー管理 | ✅ 完了 | ✅ レビュー済 |
| TICKET-04 プロジェクト | ✅ 完了 | ✅ レビュー済 |
| TICKET-05 タスク管理 | ✅ 完了 | ✅ レビュー済 |
| TICKET-06 工数入力 | ✅ 完了 | ✅ レビュー済 |
| TICKET-07 工数レポート | ✅ 完了 | ✅ レビュー済 |
| TICKET-08 WF申請作成 | ✅ 完了 | ✅ レビュー済 |
| TICKET-09 WF承認・差戻し | ✅ 完了 | — |
| TICKET-10 経費管理 | ✅ 完了 | — |
| TICKET-11 通知システム | ✅ 完了 | ✅ レビュー済 |
| TICKET-12 監査ログビューア | ✅ 完了 | ✅ レビュー済 |
| REQ-D02 経費集計/レポート | ✅ 完了 | ✅ レビュー済（R11-1） |
| REQ-C03 CSV エクスポート | ✅ 完了 | ✅ レビュー済（R11-1） |
| NFR-04a 構造化ログ | ✅ 完了 | ✅ レビュー済（R11-1） |
| NFR-04b ヘルスチェック | ✅ 完了 | ✅ レビュー済（R11-1） |
| NFR-01f CSP 設定 | ✅ 完了 | ✅ レビュー済（R11-1） |
| REQ-E01 請求一覧 | ✅ 完了 | ✅ レビュー済（R11-2） |
| REQ-E01 請求詳細/編集 | ✅ 完了 | ✅ レビュー済（R11-2） |
| REQ-F01 ドキュメント管理 | ✅ 完了 | ✅ レビュー済（R15-1） |
| REQ-G02 全文検索 | ✅ 完了 | ✅ レビュー済（R15-1） |
| TICKET-01 ダッシュボード | 🔲 未着手 | — |

## 修正チケット進捗

| FIX | 状態 | 内容 |
|---|---|---|
| FIX-01 | ✅ 完了 | テナント論理削除（deleted_at + RLS更新） |
| FIX-02 | ✅ 完了 | ロール変更確認ダイアログ（Popconfirm + RoleDiff） |
| FIX-03 | ✅ 完了 | 監査ログサーバーサイドフィルタ（_actions.ts + useTransition） |
| FIX-04 | ✅ 完了 | WF番号並行安全性（FOR UPDATE + next_workflow_number RPC） |
| FIX-05 | ✅ 完了 | requireRole() 統一（hasRole() 新設 + 14ファイル修正） |
| FIX-06 | ✅ 完了 | roleLabels 重複定義解消（types/index.ts に集約） |
| FIX-07 | ✅ 完了 | profiles テーブル導入（16箇所 UUID→name 修正） |
| RESEARCH-01 | ✅ 完了 | profiles 設計調査（opsHub-doc に保存） |

## マイグレーション一覧

1. `20260223_000001_initial_schema.sql` — 11テーブル + RLS + トリガー
2. `20260224_000001_tenant_soft_delete.sql` — tenants.deleted_at 追加
3. `20260224_000002_workflow_seq.sql` — tenants.workflow_seq + next_workflow_number()
4. `20260224_000002_profiles_table.sql` — profiles テーブル + トリガー + バックフィル
5. `20260224090000_invoices.sql` — invoices + invoice_items テーブル + RLS + 採番RPC
6. `20260225000001_documents.sql` — documents テーブル + RLS + Storage バケット
7. `20260225000002_search_indexes.sql` — pg_trgm 拡張 + GIN インデックス 4件
