---
title: "R8-3: DB設計拡張（invoices, invoice_items）"
description: "invoices/invoice_items テーブルの設計をDB設計書・RLS設計書に追記"
---

あなたは OpsHub の設計ドキュメント担当です。
請求機能（REQ-E01）のデータベース設計を既存の設計書に追記してください。

## 対象ファイル

1. /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/detail/db/index.md
2. /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/detail/rls/index.md
3. /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/detail/sequences/index.md

## 参照

### 既存の DB 設計書（フォーマット参照）
最初に上記の対象ファイル3つを全て読み、既存のフォーマットに合わせて追記すること。

### テーブル設計メモ
/home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/plans/phase-2-4-plan.md
（「新規テーブル設計メモ」セクションに invoices, invoice_items の CREATE TABLE 案あり）

## DD-DB-013 invoices テーブル

### 追記内容
- テーブル定義（カラム名、型、制約、デフォルト値）
- ステータス: `draft`, `sent`, `paid`, `cancelled`
- 採番: `invoice_number` は `INV-{YYYY}-{NNNN}` 形式（tenant_id ごとの連番）
  - `next_workflow_number` と同様のRPC方式を採用
  - テナントに `invoice_seq` カラムを追加
- Index:
  - `idx_invoices_tenant_status (tenant_id, status)`
  - `idx_invoices_tenant_project (tenant_id, project_id)`
  - `idx_invoices_tenant_created (tenant_id, created_at DESC)`
- Foreign Key: `tenant_id → tenants(id)`, `project_id → projects(id)`, `created_by → auth.users(id)`
- `updated_at` トリガー適用

## DD-DB-014 invoice_items テーブル

### 追記内容
- テーブル定義
- `amount` は `quantity * unit_price` の計算結果を保存（非正規化）
- Index:
  - `idx_invoice_items_invoice (tenant_id, invoice_id)`
- Foreign Key: `invoice_id → invoices(id) ON DELETE CASCADE`
- `ON DELETE CASCADE` で請求書削除時に明細も自動削除

## RLS ポリシー追記

### invoices

| ポリシー | 条件 |
|---|---|
| `invoices_select` | Accounting/TenantAdmin → 全件、PM → 自PJの請求のみ |
| `invoices_insert` | Accounting/TenantAdmin のみ、`created_by = auth.uid()` |
| `invoices_update` | Accounting/TenantAdmin のみ |
| `invoices_delete` | Accounting/TenantAdmin のみ、`status = 'draft'` のみ |

### invoice_items

| ポリシー | 条件 |
|---|---|
| `invoice_items_select` | `invoice_id` の invoices テーブルへの参照で制御（SELECT権限と同等） |
| `invoice_items_insert` | invoices の INSERT 権限に準拠 |
| `invoice_items_update` | invoices の UPDATE 権限に準拠 |
| `invoice_items_delete` | invoices の DELETE 権限に準拠 |

## 状態遷移追記

`detail/sequences/index.md` に請求書のステータス遷移を追加:

```
draft → sent (送付)
draft → cancelled (キャンセル)
sent → paid (入金確認)
sent → cancelled (キャンセル)
paid → (終端)
cancelled → (終端)
```

Mermaid `stateDiagram-v2` 形式で図を追加。

## 検証

```
cd /home/garchomp-game/workspace/starlight-test/opsHub-doc && npm run build
```

## ウォークスルー出力先

/home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/r8-3-db-design-extension.md
