---
title: "R10-2 Walkthrough: 請求書詳細/編集画面"
description: "SCR-H02 / API-H01 の請求書作成・編集・PDF出力の実装記録"
---

## 概要

R10-2 では、請求書の詳細表示・編集・ステータス変更・PDF出力を実装した。R10-1 が作成済みの一覧画面・ステータス変更・削除アクションを基盤として拡張。

## 変更ファイル一覧

| ファイル | 種別 | 内容 |
|---|---|---|
| `types/index.ts` | 修正 | `InvoiceStatus`, `INVOICE_TRANSITIONS` 追加 |
| `invoices/_actions.ts` | 追記 | `createInvoice`, `updateInvoice`, `getInvoiceById` の3アクション追加 |
| `invoices/_components/InvoiceForm.tsx` | 新規 | ヘッダー入力 + 動的明細テーブル + 合計自動計算 + ステータス変更ボタン |
| `invoices/[id]/_components/InvoicePrintView.tsx` | 新規 | `@media print` CSS で A4 PDF 出力対応 |
| `invoices/new/page.tsx` | 新規 | 請求書作成ページ（Server Component） |
| `invoices/[id]/page.tsx` | 新規 | 請求書詳細/編集ページ（Server Component） |

## 実装詳細

### Server Actions（API-H01 残り3つ）

- **`createInvoice`**: バリデーション → `next_invoice_number` RPC で採番 → `invoices` INSERT → `invoice_items` 一括 INSERT → 金額計算 → 監査ログ
- **`updateInvoice`**: draft のみ編集可。既存明細を全削除 → 新しい明細で再 INSERT → 金額再計算 → 監査ログ（before/after）
- **`getInvoiceById`**: `invoices` + `invoice_items` + `projects` + `profiles` JOIN。PM は自担当PJスコープのみ

### InvoiceForm コンポーネント

- ヘッダー: 取引先名、PJ選択、発行日/支払期日、備考
- 明細テーブル: 行追加/削除、数量×単価の自動計算
- 合計: 小計、税率（変更可能、デフォルト10%）、税額（端数切捨）、合計
- ステータス遷移ボタン: `INVOICE_STATUS_TRANSITIONS` に基づき条件表示
- ロール制御: admin は編集可、PM は閲覧のみ

### PDF出力

- `window.print()` + `@media print` CSS
- ナビゲーション非表示、A4 レイアウトで請求書フォーマット表示

## ビルド検証

```
✓ Compiled successfully in 26.7s
Route: /invoices, /invoices/[id], /invoices/new — すべて正常にコンパイル
```

## ステータス遷移

```
draft → sent（送付済みに変更）
draft → cancelled（キャンセル）
sent → paid（入金済みに変更）
sent → cancelled（キャンセル）
```
