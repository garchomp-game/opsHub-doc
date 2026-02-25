---
title: "R8-3: DB設計拡張ウォークスルー"
description: "invoices / invoice_items テーブルの設計追記結果"
---

## 概要

請求機能（REQ-E01）に必要な `invoices` / `invoice_items` テーブルの設計を、DB設計書・RLS設計書・状態遷移の3ドキュメントに追記した。

---

## 変更ファイル

### 1. [DB設計書](../../detail/db/)

- **DD-DB-001 tenants**: `invoice_seq`（請求書採番カウンター）カラムを追加
- **DD-DB-013 invoices**: 請求書テーブル定義（16カラム、Index 3本、FK 3本）
- **DD-DB-014 invoice_items**: 請求明細テーブル定義（9カラム、ON DELETE CASCADE）
- **RPC関数**: `next_invoice_number(p_tenant_id)` — `next_workflow_number` と同方式の並行安全採番
- **ER図**: invoices / invoice_items のリレーション追加
- **未決事項**: invoices の TODO を削除（定義完了のため）

### 2. [RLS設計書](../../detail/rls/)

**invoices ポリシー（4種）**:

| ポリシー | 条件要約 |
|---|---|
| `invoices_select` | Accounting/TenantAdmin → 全件、PM → 自PJ請求のみ |
| `invoices_insert` | Accounting/TenantAdmin のみ、`created_by = auth.uid()` |
| `invoices_update` | Accounting/TenantAdmin のみ |
| `invoices_delete` | Accounting/TenantAdmin のみ、`status = 'draft'` のみ |

**invoice_items ポリシー（4種）**:

| ポリシー | 条件要約 |
|---|---|
| `invoice_items_select` | 親 invoices への `EXISTS` サブクエリで制御 |
| `invoice_items_insert` | Accounting/TenantAdmin のみ |
| `invoice_items_update` | Accounting/TenantAdmin のみ |
| `invoice_items_delete` | Accounting/TenantAdmin のみ |

**RLSテスト方針**: 請求書閲覧制限、作成制限、削除制限の3ケースを追加。

### 3. [状態遷移/シーケンス](../../detail/sequences/)

請求書ステータス遷移を Mermaid `stateDiagram-v2` で追加:

```
draft → sent（送付）
draft → cancelled（キャンセル）
sent → paid（入金確認）
sent → cancelled（キャンセル）
paid → 終端
cancelled → 終端
```

操作者は Accounting / TenantAdmin のみ。`draft → sent` は明細が1件以上存在する場合のみ遷移可能。

---

## 検証

```
npm run build → exit code 0 ✅
```

Mermaid 構文・Markdown 構造に問題なく、Astro ビルドが正常完了。

---

## 設計判断メモ

| 判断 | 理由 |
|---|---|
| `amount` の非正規化（invoice_items） | 集計パフォーマンスのため。整合性はアプリ層で保証 |
| `invoice_items_select` を `EXISTS` で制御 | 親 invoices の RLS を経由させることで PM の自PJ閲覧も自動カバー |
| `invoices_delete` を `draft` 限定 | 送付済み・入金済みの請求書は会計証跡として保護 |
| `next_invoice_number` の年リセット | `INV-{YYYY}-{NNNN}` 形式で年を含むため、リセット判断はアプリ層で実施 |
