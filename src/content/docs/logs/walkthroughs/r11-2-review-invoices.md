---
title: "R11-2: 請求機能レビュー"
description: "REQ-E01 請求一覧・詳細/編集・PDF出力の実装レビュー結果"
---

## レビュー概要

| 項目 | 結果 |
|---|---|
| **対象** | REQ-E01 請求一覧・詳細/編集・PDF出力 |
| **ファイル数** | 9 ファイル（+ 仕様書 3 件） |
| **発見事項** | 3 件（修正済） |
| **ビルド** | ✅ `npm run build` — exit code 0 |

---

## レビュー対象ファイル

### 請求一覧（R10-1）
- `_constants.ts` — ステータス定義・色・遷移ルール
- `_actions.ts` — 6 Server Actions（CRUD + ステータス変更 + プロジェクト取得）
- `InvoiceListClient.tsx` — 一覧テーブル・フィルタ・操作 UI
- `page.tsx` — Server Component（認証・データ取得）

### 請求書詳細/編集（R10-2）
- `new/page.tsx` — 新規作成ページ
- `[id]/page.tsx` — 詳細/編集ページ
- `InvoiceForm.tsx` — フォーム Client Component

### 印刷（R10-2）
- `InvoicePrintView.tsx` — 印刷用レイアウト

### マイグレーション（R9-1）
- `20260224090000_invoices.sql` — テーブル・RPC・RLS・Index

---

## 機能チェック結果

| チェック項目 | 結果 | 備考 |
|---|---|---|
| CRUD 操作が仕様通りか | ✅ | API-H01 の 6 アクション全て実装済 |
| ステータス遷移ルール | ✅ | `INVOICE_STATUS_TRANSITIONS` で `draft→sent→paid`, `draft/sent→cancelled` を正しく定義 |
| 請求書番号の採番 | ✅ | `next_invoice_number` RPC で `FOR UPDATE` ロック付き連番。`INV-YYYY-NNNN` 形式 |
| 明細の合計計算 | ✅ | `subtotal = Σ(qty × price)`, `tax = FLOOR(subtotal × rate / 100)`, `total = subtotal + tax` |
| PDF 出力レイアウト | ✅ | 方式A（`window.print()` + 印刷用CSS）で A4 縦向き対応 |
| RLS ポリシー | ✅ | Accounting/TenantAdmin は全操作、PM は自PJ SELECT のみ。`invoices_delete` に `status = 'draft'` 制約あり |
| 権限チェック | ✅ | `hasRole` でロール確認。PM は `pm_id` による自PJスコープ制限 |

---

## 共通基盤チェック結果

| チェック項目 | 結果 | 備考 |
|---|---|---|
| `withAuth` パターン | ✅ | 全 Server Action で使用 |
| `writeAuditLog` 呼び出し | ✅ | `invoice.create`, `invoice.update`, `invoice.status_change`, `invoice.delete` の 4 アクション |
| `revalidatePath` 呼び出し | ✅ | create, update, status_change, delete 後に `/invoices` をrevalidate |
| profiles JOIN | ✅ | `profiles!invoices_created_by_fkey ( display_name )` で作成者名表示 |
| `createNotification` | — | 請求書機能では通知不要（スキップ） |

---

## 発見した問題と修正

### FIX-1: PDF 出力が印刷時に表示されない（Critical）

**問題**: `InvoicePrintView` が `<div className="no-print">` の中に配置されていた。印刷用 CSS で `.no-print { display: none !important; }` を設定しており、親要素が `display: none` になると子要素も全て非表示になるため、PDF 出力が空白になる。

**修正**: `InvoicePrintView` を `no-print` div の外に移動し、React Fragment (`<>...</>`) で囲む構造に変更。

```diff
- <div className="no-print">
-     <InvoiceForm ... />
-     <InvoicePrintView ... />
- </div>
+ <>
+     <div className="no-print">
+         <InvoiceForm ... />
+     </div>
+     <InvoicePrintView ... />
+ </>
```

**対象ファイル**: `[id]/page.tsx`

---

### FIX-2: 未使用の `status` prop（Minor）

**問題**: `InvoicePrintView` の `Props` 型に `status: InvoiceStatus` が定義されていたが、コンポーネント内で一度も使用されていなかった。

**修正**: `Props` 型から `status` フィールドを削除し、呼び出し側からも `status` prop を除去。

**対象ファイル**: `InvoicePrintView.tsx`, `[id]/page.tsx`

---

### FIX-3: 支払期日の期限超過表示が不適切（Minor）

**問題**: 支払期日の赤字表示が `dueDate < new Date() && d` で判定しており、入金済やキャンセル済の請求書でも赤字表示されてしまっていた。

**修正**: ステータスが `draft` または `sent` の場合のみ期限超過表示するよう条件を追加。

```diff
- render: (d: string) => {
+ render: (d: string, record: InvoiceRow) => {
      const dueDate = new Date(d);
-     const isOverdue = dueDate < new Date() && d;
+     const isOverdue = dueDate < new Date()
+         && (record.status === "draft" || record.status === "sent");
```

**対象ファイル**: `InvoiceListClient.tsx`

---

## コード品質

| チェック項目 | 結果 | 備考 |
|---|---|---|
| 型安全性 | ✅ | 全 Server Action に型定義あり。`withAuth` ジェネリクスで入出力型を保証 |
| `ON DELETE CASCADE` | ✅ | `invoice_items` FK に `ON DELETE CASCADE` 設定。削除時は `invoices` のみ DELETE で自動削除 |
| エラーハンドリング | ✅ | エラーコード体系（`ERR-AUTH`, `ERR-VAL-H`, `ERR-INV`, `ERR-SYS`）で分類。`withAuth` ラッパーが catch して `ActionResult` に変換 |

---

## ビルド検証

```
$ npm run build
> app@0.1.0 build
> next build
Exit code: 0
```

✅ 全修正後、型エラー・ビルドエラーなしで完了。
