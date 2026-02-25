---
title: "R8-2: 請求機能 仕様書作成 — ウォークスルー"
description: SCR-H01・SCR-H02・API-H01 の新規作成結果
---

## 概要

請求書管理機能（REQ-E01）の仕様書3本を新規作成した。Epic H として新番号体系（SCR-H01 / SCR-H02 / API-H01）を採番し、既存の通知機能（SCR-E01 / API-E01）との衝突を回避。

---

## 作成ファイル

| ファイル | 内容 | 行数 |
|---|---|---|
| `spec/screens/SCR-H01.md` | 請求一覧画面 | ~120行 |
| `spec/screens/SCR-H02.md` | 請求書詳細/編集画面 | ~190行 |
| `spec/apis/API-H01.md` | 請求 API（Server Action 6本） | ~290行 |

---

## SCR-H01 — 請求一覧

- **URL**: `/invoices`
- **ロール別表示**: Accounting/Tenant Admin は全件、PM は自PJのみ閲覧
- **テーブル列**: 請求番号・取引先名・プロジェクト・発行日・支払期日・金額（税込）・ステータス・作成者・操作
- **フィルタ**: ステータス / プロジェクト / 期間（発行日）
- **ステータス色**: draft=blue, sent=orange, paid=green, cancelled=default

## SCR-H02 — 請求書詳細/編集

- **URL**: `/invoices/new`（新規） / `/invoices/[id]`（既存）
- **ヘッダー**: 請求番号（自動採番）・取引先名・プロジェクト・発行日・支払期日・備考
- **明細テーブル**: Editable Table（品目・数量・単価・金額自動計算・行追加削除）
- **合計セクション**: 小計・消費税率（デフォルト10%）・消費税額・合計金額（すべて自動計算）
- **ステータス遷移**: draft→sent→paid / draft→cancelled / sent→cancelled（Mermaid図あり）
- **PDF出力**: window.print() + 印刷用CSS or Route Handler

## API-H01 — 請求 API

6つの Server Action を定義:

| # | Action | 用途 |
|---|---|---|
| 1 | `createInvoice` | 請求書作成（ヘッダー+明細一括） |
| 2 | `updateInvoice` | 請求書更新（draft のみ） |
| 3 | `getInvoices` | 一覧取得（フィルタ対応） |
| 4 | `getInvoiceById` | 詳細取得（明細含む） |
| 5 | `updateInvoiceStatus` | ステータス変更（遷移ルール制御） |
| 6 | `deleteInvoice` | 削除（draft のみ） |

- **エラーコード体系**: `ERR-AUTH-003/004`, `ERR-VAL-H01〜H08`, `ERR-INV-001〜004`, `ERR-SYS-001`
- **監査ログ**: create / update / status_change / delete の4種

---

## 検証結果

```
npm run build → ✓ Completed in 2.80s (exit code 0)
```

- `spec/screens/scr-h01/index.html` ✅
- `spec/screens/scr-h02/index.html` ✅
- `spec/apis/api-h01/index.html` ✅

---

## 参照元

| ドキュメント | 用途 |
|---|---|
| SCR-D01 | 経費一覧の画面仕様フォーマット参照 |
| API-D01 | 経費 API の Server Action パターン参照 |
| REQ-E01 | 請求書管理の要件定義 |
| phase-2-4-plan.md | invoices / invoice_items テーブル設計メモ |
