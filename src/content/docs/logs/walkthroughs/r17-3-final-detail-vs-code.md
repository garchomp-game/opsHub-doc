---
title: "R17-3: 詳細設計 vs 実装 最終検証"
description: "DB設計・RLS・インデックス・トリガー・RPCと実装マイグレーションの整合性検証結果"
---

## 検証概要

| 項目 | 対象 | 結果 |
|---|---|---|
| 実施日 | 2026-02-25 | — |
| 対象設計書 | `detail/db/index.md`, `detail/rls/index.md` | — |
| 対象マイグレーション | `20260224090000_invoices.sql`, `20260225000001_documents.sql`, `20260225000002_search_indexes.sql` | — |
| ビルド検証 | `npm run build` | ✅ 成功（183 pages） |

---

## 1. DB設計 vs マイグレーション

### DD-DB-013 invoices

| カラム | 設計 | 実装 | 判定 |
|---|---|---|---|
| id | `uuid PK DEFAULT gen_random_uuid()` | 同左 | ✅ |
| tenant_id | `uuid NOT NULL FK→tenants(id)` | `uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE` | ✅ |
| invoice_number | `text NOT NULL, UNIQUE per tenant` | `text NOT NULL` + `UNIQUE(tenant_id, invoice_number)` | ✅ |
| project_id | `uuid FK→projects(id)` | `uuid REFERENCES projects(id) ON DELETE SET NULL` | ✅ |
| client_name | `text NOT NULL` | 同左 | ✅ |
| issued_date | `date NOT NULL` | 同左 | ✅ |
| due_date | `date NOT NULL` | 同左 | ✅ |
| subtotal | `numeric(12,0) NOT NULL DEFAULT 0` | 同左 | ✅ |
| tax_rate | `numeric(5,2) NOT NULL DEFAULT 10.00` | 同左 | ✅ |
| tax_amount | `numeric(12,0) NOT NULL DEFAULT 0` | 同左 | ✅ |
| total_amount | `numeric(12,0) NOT NULL DEFAULT 0` | 同左 | ✅ |
| status | `text NOT NULL CHECK(IN draft,sent,paid,cancelled) DEFAULT 'draft'` | 同左 | ✅ |
| notes | `text` (nullable) | 同左 | ✅ |
| created_by | `uuid NOT NULL FK→auth.users(id)` | 同左 | ✅ |
| created_at | `timestamptz NOT NULL DEFAULT now()` | 同左 | ✅ |
| updated_at | `timestamptz NOT NULL DEFAULT now()` | 同左 | ✅ |

### DD-DB-014 invoice_items

| カラム | 設計 | 実装 | 判定 |
|---|---|---|---|
| id | `uuid PK DEFAULT gen_random_uuid()` | 同左 | ✅ |
| tenant_id | `uuid NOT NULL FK→tenants(id)` | `uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE` | ✅ |
| invoice_id | `uuid NOT NULL FK→invoices(id) ON DELETE CASCADE` | 同左 | ✅ |
| description | `text NOT NULL` | 同左 | ✅ |
| quantity | `numeric(10,2) NOT NULL DEFAULT 1` | 同左 | ✅ |
| unit_price | `numeric(12,0) NOT NULL` | 同左 | ✅ |
| amount | `numeric(12,0) NOT NULL` | 同左 | ✅ |
| sort_order | `integer NOT NULL DEFAULT 0` | 同左 | ✅ |
| created_at | `timestamptz NOT NULL DEFAULT now()` | 同左 | ✅ |

### DD-DB-015 documents

| カラム | 設計 | 実装 | 判定 |
|---|---|---|---|
| id | `uuid PK DEFAULT gen_random_uuid()` | 同左 | ✅ |
| tenant_id | `uuid NOT NULL FK→tenants(id)` | `uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE` | ✅ |
| project_id | `uuid FK→projects(id)` | `uuid REFERENCES projects(id) ON DELETE SET NULL` | ✅ |
| name | `text NOT NULL` | 同左 | ✅ |
| file_path | `text NOT NULL` | 同左 | ✅ |
| file_size | `bigint NOT NULL DEFAULT 0` | 同左 | ✅ |
| mime_type | `text NOT NULL` | 同左 | ✅ |
| uploaded_by | `uuid NOT NULL FK→auth.users(id)` | 同左 | ✅ |
| created_at | `timestamptz NOT NULL DEFAULT now()` | 同左 | ✅ |
| updated_at | `timestamptz NOT NULL DEFAULT now()` | 同左 | ✅ |

---

## 2. RLS設計 vs マイグレーション

### invoices RLS（4ポリシー）

| ポリシー名 | 操作 | 設計条件 | 実装条件 | 判定 |
|---|---|---|---|---|
| `invoices_select` | SELECT | tenant + accounting/tenant_admin/pm(自PJ) | 同左 | ✅ |
| `invoices_insert` | INSERT | tenant + created_by=self + accounting/tenant_admin | 同左 | ✅ |
| `invoices_update` | UPDATE | tenant + accounting/tenant_admin | 同左 | ✅ |
| `invoices_delete` | DELETE | tenant + status='draft' + accounting/tenant_admin | 同左 | ✅ |

### invoice_items RLS（4ポリシー）

| ポリシー名 | 操作 | 設計条件 | 実装条件 | 判定 |
|---|---|---|---|---|
| `invoice_items_select` | SELECT | EXISTS(親invoices RLS通過) | 同左 | ✅ |
| `invoice_items_insert` | INSERT | tenant + accounting/tenant_admin | 同左 | ✅ |
| `invoice_items_update` | UPDATE | tenant + accounting/tenant_admin | 同左 | ✅ |
| `invoice_items_delete` | DELETE | tenant + accounting/tenant_admin | 同左 | ✅ |

### documents RLS（3ポリシー）

| ポリシー名 | 操作 | 設計条件 | 実装条件 | 判定 |
|---|---|---|---|---|
| `documents_select` | SELECT | tenant + (project_id IS NULL / project_member / pm / tenant_admin) | 同左 | ✅ |
| `documents_insert` | INSERT | tenant + uploaded_by=self + pm/tenant_admin | 同左 | ✅ |
| `documents_delete` | DELETE | tenant + pm/tenant_admin | 同左 | ✅ |

---

## 3. インデックス設計 vs マイグレーション

### テーブルインデックス

| テーブル | インデックス名 | 設計 | 実装 | 判定 |
|---|---|---|---|---|
| invoices | `idx_invoices_tenant_status` | (tenant_id, status) | 同左 | ✅ |
| invoices | `idx_invoices_tenant_project` | (tenant_id, project_id) | 同左 | ✅ |
| invoices | `idx_invoices_tenant_created` | (tenant_id, created_at DESC) | 同左 | ✅ |
| invoice_items | `idx_invoice_items_invoice` | (tenant_id, invoice_id) | 同左 | ✅ |
| documents | `idx_documents_tenant_project` | (tenant_id, project_id) | 同左 | ✅ |

### 全文検索 GIN インデックス（pg_trgm）

| テーブル | 設計（修正前） | 設計（修正後） | 実装 | 判定 |
|---|---|---|---|---|
| workflows | `idx_workflows_title_trgm` (title) | `idx_workflows_search` (title, description) | 同左 | ⚠️→✅ 修正済 |
| projects | `idx_projects_name_trgm` (name) | `idx_projects_search` (name, description) | 同左 | ⚠️→✅ 修正済 |
| tasks | `idx_tasks_title_trgm` (title) | `idx_tasks_search` (title) | 同左 | ⚠️→✅ 修正済 |
| expenses | `idx_expenses_description_trgm` (description) | `idx_expenses_search` (description) | 同左 | ⚠️→✅ 修正済 |
| documents | `idx_documents_name_trgm` (name) | `idx_documents_search` (name) | **欠落→追加** | ⚠️→✅ 修正済 |

---

## 4. トリガー検証

| テーブル | トリガー名 | 関数 | 設計 | 実装 | 判定 |
|---|---|---|---|---|---|
| invoices | `invoices_updated_at` | `update_updated_at()` | BEFORE UPDATE | 同左 | ✅ |
| documents | `documents_updated_at` | `update_updated_at()` | BEFORE UPDATE | 同左 | ✅ |

---

## 5. RPC関数 `next_invoice_number`

| 項目 | 設計 | 実装 | 判定 |
|---|---|---|---|
| 引数 | `p_tenant_id uuid` | 同左 | ✅ |
| 戻り値 | `text` (INV-YYYY-NNNN) | 同左 | ✅ |
| SECURITY | DEFINER | 同左 | ✅ |
| 並行制御 | `SELECT ... FOR UPDATE` | 同左 | ✅ |
| 採番元 | `tenants.invoice_seq` | 同左 | ✅ |
| エラー処理 | Tenant not found 時 RAISE EXCEPTION | 同左 | ✅ |

---

## 検出された不一致と修正内容

### 不一致 1: 全文検索インデックス名・カラム構成の差異

| # | 差異内容 | 修正方針 |
|---|---|---|
| 1 | 設計は単一カラム + `_trgm` 命名、実装は複合カラム + `_search` 命名 | 設計ドキュメントを実装に合わせて更新 |
| 2 | workflows/projects は実装が `description` カラムも含む複合 GIN | 複合 GIN の方が検索実用性が高いため実装を尊重 |

**修正ファイル**: [detail/db/index.md](file:///home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/detail/db/index.md) — GIN インデックス一覧セクション

### 不一致 2: documents 全文検索インデックスの欠落

マイグレーション `20260225000002_search_indexes.sql` に `idx_documents_search` が未定義。

**修正ファイル**: [20260225000002_search_indexes.sql](file:///home/garchomp-game/workspace/starlight-test/OpsHub/supabase/migrations/20260225000002_search_indexes.sql) — `idx_documents_search` を追加

---

## 最終判定

| カテゴリ | 検証数 | 一致 | 不一致→修正済 |
|---|---|---|---|
| DB カラム・型・制約 | 35 | 35 | 0 |
| RLS ポリシー | 11 | 11 | 0 |
| テーブルインデックス | 5 | 5 | 0 |
| GIN インデックス | 5 | 0 | **5（修正済）** |
| トリガー | 2 | 2 | 0 |
| RPC 関数 | 1 | 1 | 0 |
| **合計** | **59** | **54** | **5（全修正済）** |

> [!IMPORTANT]
> 全不一致を修正完了。DB設計ドキュメントとマイグレーションファイルの整合性は **100%** です。
