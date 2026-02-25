---
title: "R10-1: 請求一覧画面の実装"
description: "SCR-H01 / API-H01 の請求一覧画面とServer Actions実装"
---

あなたは OpsHub の開発者です。請求一覧画面（SCR-H01）とServer Actions（API-H01の一部）を実装してください。

## 参照する仕様書

- SCR-H01: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/screens/SCR-H01.md
- API-H01: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/apis/API-H01.md

## 参照する既存実装（パターン参照）

- 経費一覧（同パターン）: /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/expenses/
- ナレッジ: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/knowledge.md

## 型定義

invoices/invoice_items の型は既に `src/types/database.ts` に生成済み。

## 作成するファイル

### Server Actions
- `/home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/invoices/_actions.ts`
  - `getInvoices(tenantId, userId, isAdmin, filters)` — 一覧取得（フィルタ+ページネーション）
  - `deleteInvoice(id)` — 削除（draft のみ）
  - `updateInvoiceStatus(id, status)` — ステータス変更

### ページ（Server Component）
- `/home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/invoices/page.tsx`
  - `requireAuth()` + ロールチェック
  - `getInvoices()` 呼び出し
  - テーブル表示

### 定数ファイル
- `/home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/invoices/_constants.ts`
  - `INVOICE_STATUS_LABELS`: `{ draft: "下書き", sent: "送付済", paid: "入金済", cancelled: "キャンセル" }`
  - `INVOICE_STATUS_COLORS`: `{ draft: "blue", sent: "orange", paid: "green", cancelled: "default" }`

### Client Component（テーブル操作用）
- `/home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/invoices/_components/InvoiceListClient.tsx`
  - フィルタ（ステータス、PJ、期間）
  - テーブル（Ant Design Table）
  - 削除確認ダイアログ
  - ステータス変更ドロップダウン

### レイアウト修正
- `/home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/layout.tsx`
  - サイドバーに「請求管理」メニュー追加: `FileTextOutlined` アイコン、`/invoices`

## 権限ルール

- Accounting / Tenant Admin: 全件閲覧・操作可能
- PM: 自PJの請求のみ閲覧（`projects.pm_id = user.id` の JOIN でフィルタ）
- その他: アクセス不可

## 検証

```bash
cd /home/garchomp-game/workspace/starlight-test/OpsHub && npm run build
```

## ウォークスルー出力先

/home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/r10-1-invoice-list.md
