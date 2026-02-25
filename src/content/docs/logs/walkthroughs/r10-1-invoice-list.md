---
title: "R10-1: 請求一覧画面の実装ウォークスルー"
description: "SCR-H01 請求一覧画面と API-H01 Server Actions の実装記録"
---

## 概要

請求一覧画面（SCR-H01）とServer Actions（API-H01 の一部）を実装した。経費一覧（`/expenses`）パターンを踏襲し、Server Component + Client Component 分離構成で構築。

## 作成・変更ファイル

### 新規ファイル（5件）

| ファイル | 内容 |
|---|---|
| `invoices/_constants.ts` | `INVOICE_STATUSES`, `INVOICE_STATUS_LABELS`, `INVOICE_STATUS_COLORS`, `INVOICE_STATUS_TRANSITIONS` |
| `invoices/_actions.ts` | `getInvoices`, `deleteInvoice`, `updateInvoiceStatus`, `getProjects` |
| `invoices/_components/InvoiceListClient.tsx` | フィルタ・テーブル・削除ダイアログ・ステータス変更UIのClient Component |
| `invoices/page.tsx` | 認証・ロールチェック・データ取得の Server Component |

### 変更ファイル（1件）

| ファイル | 変更内容 |
|---|---|
| `layout.tsx` | サイドバーに「請求管理」メニュー追加（`ContainerOutlined` アイコン） |

## 実装詳細

### Server Actions (`_actions.ts`)

| Action | 概要 |
|---|---|
| `getInvoices` | テナント内請求一覧取得。フィルタ（status, project_id, from, to）対応。PMは`pm_id`で自PJスコープ制限 |
| `deleteInvoice` | `draft`ステータスのみ削除可。Accounting/TenantAdmin権限。監査ログ記録 |
| `updateInvoiceStatus` | `INVOICE_STATUS_TRANSITIONS`に基づく遷移バリデーション。監査ログ記録 |
| `getProjects` | フィルタ用プロジェクト一覧（planning/active）取得 |

### ステータス遷移ルール

```
draft → sent, cancelled
sent  → paid, cancelled
paid  → (遷移なし)
cancelled → (遷移なし)
```

### Client Component (`InvoiceListClient.tsx`)

- **フィルタ**: Ant Design `Select`（ステータス/プロジェクト）+ `DatePicker`（期間）
- **テーブル列**: 請求番号(リンク), 取引先, プロジェクト(リンク), 発行日, 支払期日(期限超過赤字), 金額(税込), ステータス(Tag色分け), 作成者, 操作
- **操作列**: 詳細ボタン, ステータス変更ドロップダウン(Admin), 削除ボタン(Admin・draft)
- **ページネーション**: 20件/ページ, `全 XX 件` 表示

### 権限ルール

| ロール | 表示範囲 | 操作 |
|---|---|---|
| Accounting / Tenant Admin | 全件 | 作成・編集・削除・ステータス変更 |
| PM | 自PJの請求のみ | 閲覧のみ |
| その他 | ダッシュボードへリダイレクト | — |

## 検証結果

```
npm run build → ✓ Compiled successfully
Route: ƒ /invoices (Dynamic, server-rendered on demand)
Exit code: 0
```

TypeScript 型チェック・Next.js コンパイルともにエラーなし。
