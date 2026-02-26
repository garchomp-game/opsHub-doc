---
title: "R22-3: Server Action DBスキーマ整合性監査"
description: "全 _actions.ts の Supabase クエリが実在するカラム・リレーションのみ参照していることを確認"
---

あなたは OpsHub のバックエンドエンジニア兼 DBA です。
スモークテストにより、Server Action 内の Supabase クエリが存在しないカラムやリレーションを参照しているバグが2件発見されました（既に修正済み）。
同様のバグが他にも潜んでいないか、全 `_actions.ts` を網羅的に監査してください。

## プロジェクトパス

- OpsHub: `/home/garchomp-game/workspace/starlight-test/OpsHub`

## DBスキーマ定義

- マイグレーション: `supabase/migrations/20260223000001_initial_schema.sql`
- Phase 2-3 追加: `supabase/migrations/20260224000001_phase2_3_schema.sql`

## 既に修正済みの問題（参考）

| 問題 | ファイル | 原因 |
|---|---|---|
| `expenses.status` カラムが存在しない | `search/_actions.ts` | expenses テーブルに status カラムがない（workflow経由で取得すべき） |
| `profiles` テーブルが存在しない | `invoices/_actions.ts` | `profiles!invoices_created_by_fkey` JOIN が不正 |

## 監査対象

以下のコマンドで全 `_actions.ts` を一覧してください:
```bash
find src/app -name "_actions.ts" -type f
```

各ファイルの全 `.select()`, `.from()`, `.eq()`, `.in()`, `.ilike()` 等のクエリを確認し、以下をチェック:

### チェック項目

1. **カラム存在確認**: `.select("col1, col2, ...")` で指定されたカラムが対象テーブルに存在するか
2. **リレーション確認**: `table(col)` や `table!fkey(col)` のリレーションが実際の FK 制約に対応するか
3. **テーブル存在確認**: `.from("table")` のテーブルが存在するか
4. **型の整合性**: `.eq("col", value)` の value 型がカラムの型と互換性があるか
5. **RPC 関数確認**: `.rpc("func_name", ...)` の関数がマイグレーションで定義されているか

### 全テーブルと主要カラム一覧（参考）

```
tenants: id, name, slug, settings, created_at, updated_at
user_roles: id, user_id, tenant_id, role, created_at
projects: id, tenant_id, name, description, status, start_date, end_date, pm_id, created_by, updated_by, created_at, updated_at
project_members: id, project_id, user_id, tenant_id, created_at
tasks: id, tenant_id, project_id, title, description, status, assignee_id, due_date, created_by, created_at, updated_at
workflows: id, tenant_id, workflow_number, type, title, description, status, amount, date_from, date_to, approver_id, rejection_reason, created_by, approved_at, created_at, updated_at
timesheets: id, tenant_id, user_id, project_id, task_id, work_date, hours, note, created_at, updated_at
expenses: id, tenant_id, workflow_id, project_id, category, amount, expense_date, description, receipt_url, created_by, created_at, updated_at
audit_logs: id, tenant_id, user_id, action, resource_type, resource_id, before_data, after_data, metadata, created_at
notifications: id, tenant_id, user_id, type, title, body, resource_type, resource_id, is_read, created_at
workflow_attachments: id, tenant_id, workflow_id, file_name, file_size, content_type, storage_path, uploaded_by, created_at
invoices: (Phase 2-3 マイグレーション参照)
invoice_items: (Phase 2-3 マイグレーション参照)
documents: (Phase 2-3 マイグレーション参照)
```

## 出力形式

発見した問題を以下の形式でリスト化し、修正してください:

| # | ファイル | 行 | 問題 | 修正内容 |
|---|---|---|---|---|
| 1 | `xxx/_actions.ts` | 42 | `col` がテーブルに存在しない | `col` を削除 or 正しいカラム名に変更 |

## 検証手順

1. `npm run build` — 成功
2. `npm run test:e2e` — 全テスト PASSED（特に smoke.spec.ts の全13ルート）
3. 修正が必要だった画面をブラウザで開き、正常に動作を確認

## ウォークスルー出力先

/home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/r22-3-schema-audit.md
