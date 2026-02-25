---
title: "R9-1: マイグレーション（invoices, invoice_items）"
description: "請求機能のDBマイグレーション作成と型再生成のウォークスルー"
---

## 概要

請求機能（REQ-E01）の DB マイグレーションを作成し、TypeScript 型を再生成した。

## 作成ファイル

### マイグレーション

**ファイル**: `OpsHub/supabase/migrations/20260224090000_invoices.sql`

| 項目 | 内容 |
|---|---|
| invoices テーブル | DD-DB-013 準拠。ステータス `draft/sent/paid/cancelled`、`(tenant_id, invoice_number)` UNIQUE |
| invoice_items テーブル | DD-DB-014 準拠。`ON DELETE CASCADE` で親請求書に連動削除 |
| tenants.invoice_seq | `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` で追加 |
| next_invoice_number RPC | `SELECT FOR UPDATE` 行ロック。`INV-{YYYY}-{NNNN}` 形式で返却 |
| RLS ポリシー | invoices 4本 + invoice_items 4本 = 計 8本 |
| Index | `idx_invoices_tenant_status`、`idx_invoices_tenant_project`、`idx_invoices_tenant_created`、`idx_invoice_items_invoice` |
| トリガー | `invoices_updated_at` — `update_updated_at()` 適用 |

### マイグレーションファイル名修正

既存マイグレーションのファイル名が Supabase のバージョンキー衝突を起こしていたため、全ファイルを `YYYYMMDDHHMMSS` 形式に統一した。

| 旧ファイル名 | 新ファイル名 |
|---|---|
| `20260223_000001_initial_schema.sql` | `20260223000001_initial_schema.sql` |
| `20260224_000001_tenant_soft_delete.sql` | `20260224060000_tenant_soft_delete.sql` |
| `20260224_000002_profiles_table.sql` | `20260224070000_profiles_table.sql` |
| `20260224_000002_workflow_seq.sql` | `20260224080000_workflow_seq.sql` |
| — | `20260224090000_invoices.sql`（新規） |

### 型再生成

`src/types/database.ts` に `invoices` と `invoice_items` の型定義が追加された。

## 検証結果

| 検証項目 | 結果 |
|---|---|
| `npx supabase db reset` | ✅ 全 5 マイグレーション正常適用 |
| `npx supabase gen types typescript --local` | ✅ `invoices`/`invoice_items` 型を含む `database.ts` 生成 |
| `npm run build` | ✅ 型エラー 0 件でビルド成功 |
