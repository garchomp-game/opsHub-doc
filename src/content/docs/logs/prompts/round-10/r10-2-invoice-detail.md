---
title: "R10-2: 請求書詳細/編集画面の実装"
description: "SCR-H02 / API-H01 の請求書作成・編集・PDF出力の実装"
---

あなたは OpsHub の開発者です。請求書詳細/編集画面（SCR-H02）とServer Actions（API-H01 の残り）を実装してください。

## 参照する仕様書

- SCR-H02: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/screens/SCR-H02.md
- API-H01: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/apis/API-H01.md

## 参照する既存実装（パターン参照）

- 経費申請（フォーム系パターン）: /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/expenses/new/
- ワークフロー作成: /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/workflows/new/
- ナレッジ: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/knowledge.md

## 前提

- R10-1 で `invoices/_actions.ts` と `invoices/_constants.ts` が作成済みの可能性あり
- もし既に存在すれば追記、なければ新規作成

## 作成するファイル

### Server Actions（追加分）
- `invoices/_actions.ts` に追記:
  - `createInvoice(input)` — 請求書作成（ヘッダー+明細一括 INSERT）
  - `updateInvoice(id, input)` — 請求書更新（draft のみ）
  - `getInvoiceById(id)` — 詳細取得（明細込み）

### 新規作成ページ
- `/home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/invoices/new/page.tsx`

### 詳細/編集ページ
- `/home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/invoices/[id]/page.tsx`

### Client Component（フォーム）
- `/home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/invoices/_components/InvoiceForm.tsx`
  - **ヘッダー情報**: 取引先名（Input）、PJ（Select）、発行日/支払期日（DatePicker）、備考（TextArea）
  - **明細テーブル（Editable）**: 品目、数量、単価、金額（自動計算）、行追加/削除
  - **合計セクション**: 小計、税率（InputNumber, デフォルト10%）、税額、合計（自動計算）
  - **ボタン**: 下書き保存 / 送信
  - 編集時は既存データをプリセット

### 印刷用 CSS（PDF出力代替）
- `/home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/invoices/[id]/_components/InvoicePrintView.tsx`
  - `window.print()` で PDF 出力
  - `@media print` で請求書レイアウトに整形
  - ヘッダー（請求番号、発行日、取引先）
  - 明細テーブル
  - 合計セクション

## バリデーション

- 取引先名: 必須、200文字以内
- 発行日: 必須
- 支払期日: 必須、発行日以降
- 明細: 1行以上必須
- 単価: 0以上
- 数量: 0超

## ステータス遷移ルール

```
draft → sent（明細1行以上）
draft → cancelled
sent → paid
sent → cancelled
```

## 検証

```bash
cd /home/garchomp-game/workspace/starlight-test/OpsHub && npm run build
```

## ウォークスルー出力先

/home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/r10-2-invoice-detail.md
