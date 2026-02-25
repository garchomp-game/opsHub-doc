---
title: "R9-1: マイグレーション（invoices, invoice_items）"
description: "請求機能のDBマイグレーション作成と型再生成"
---

あなたは OpsHub の開発者です。請求機能（REQ-E01）のDBマイグレーションを作成してください。

## 作業内容

### 1. マイグレーションファイル作成

**出力先**: `/home/garchomp-game/workspace/starlight-test/OpsHub/supabase/migrations/20260224_000001_invoices.sql`

DB設計書に基づいて以下を作成:

#### invoices テーブル (DD-DB-013)
参照: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/detail/db/index.md

#### invoice_items テーブル (DD-DB-014)
参照: 同上

#### tenants テーブルに invoice_seq カラム追加
```sql
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS invoice_seq INTEGER NOT NULL DEFAULT 0;
```

#### next_invoice_number RPC 関数
`next_workflow_number` と同方式の並行安全な採番関数。

参照パターン: /home/garchomp-game/workspace/starlight-test/OpsHub/supabase/migrations/20260223_000004_workflow_seq.sql

#### RLS ポリシー (8ポリシー)
参照: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/detail/rls/index.md

#### Index (4本)
- `idx_invoices_tenant_status`
- `idx_invoices_tenant_project`
- `idx_invoices_tenant_created`
- `idx_invoice_items_invoice`

#### トリガー
- `invoices_updated_at` — `update_updated_at()` トリガー適用

### 2. 型再生成

マイグレーション作成後、以下を実行:
```bash
cd /home/garchomp-game/workspace/starlight-test/OpsHub
npx supabase db reset
npx supabase gen types typescript --local > src/types/database.ts
```

※ Supabase が起動していない場合は `npx supabase start` を先に実行

### 3. ビルド検証

```bash
npm run build
```

型エラー 0 件を確認。

## ウォークスルー出力先

/home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/r9-1-migration.md
