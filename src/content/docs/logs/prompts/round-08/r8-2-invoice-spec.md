---
title: "R8-2: 請求機能 仕様書作成"
description: "SCR-H01（請求一覧）、SCR-H02（請求書詳細/編集）、API-H01（請求API）の仕様書を新規作成"
---

あなたは OpsHub の設計ドキュメント担当です。
請求書管理機能（REQ-E01）の画面仕様書と API 仕様書を新規作成してください。

## 採番ルール

通知機能が SCR-E01 / API-E01 を使用しているため、請求機能は Epic H として新番号を割り当て:

| 仕様書 | 内容 |
|---|---|
| SCR-H01 | 請求一覧画面 |
| SCR-H02 | 請求書詳細/編集画面 |
| API-H01 | 請求 API |

## 参照ファイル

### テンプレート
- /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/screens/template.md
- /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/apis/template.md

### 類似仕様
- /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/screens/SCR-D01.md （経費一覧 — 類似フォーマット）
- /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/apis/API-D01.md （経費API — 類似パターン）

### 要件
- /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/requirements/req-catalog/index.md （REQ-E01 請求書管理）

### 設計計画
- /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/plans/phase-2-4-plan.md （invoices/invoice_items テーブル設計メモ）

## SCR-H01 の設計指針（請求一覧）

### 画面構成
- URL: `/invoices`
- アクセス権限: Accounting, PM（閲覧のみ）, Tenant Admin
- レイアウト: フィルタ + テーブル + 新規作成ボタン

### テーブル列
1. 請求番号（INV-YYYY-NNNN）
2. 取引先名
3. プロジェクト
4. 発行日
5. 支払期日
6. 金額（税込）
7. ステータス（draft/sent/paid/cancelled）
8. 作成者
9. 操作（詳細/PDF）

### フィルタ
- ステータス
- プロジェクト
- 期間（発行日）

### ステータス色定義
- `draft`: blue（下書き）
- `sent`: orange（送付済）
- `paid`: green（入金済）
- `cancelled`: default（キャンセル）

## SCR-H02 の設計指針（請求書詳細/編集）

### 画面構成
- URL: `/invoices/[id]`（既存）, `/invoices/new`（新規）
- レイアウト: ヘッダー情報 + 明細テーブル + 合計セクション + アクションボタン

### ヘッダー情報
- 請求番号（自動採番）
- 取引先名（テキスト入力）
- プロジェクト（Select）
- 発行日 / 支払期日（DatePicker）
- 備考（TextArea）

### 明細テーブル（Editable Table）
- 品目（テキスト）
- 数量（数値）
- 単価（数値）
- 金額（自動計算）
- 行追加/削除ボタン

### 合計セクション
- 小計（自動計算）
- 消費税率（デフォルト10%、変更可能）
- 消費税額（自動計算）
- 合計金額（自動計算）

### アクションボタン
- 下書き保存 / 送付済みに変更 / 入金済みに変更 / キャンセル / PDF 出力

### PDF 出力
- ブラウザの印刷ダイアログ（`window.print()`）+ 印刷用 CSS
- または Route Handler で PDF 生成（`@react-pdf/renderer` 等）

## API-H01 の設計指針

### Server Actions
1. `createInvoice(input)` → 請求書作成（ヘッダー + 明細）
2. `updateInvoice(id, input)` → 請求書更新
3. `getInvoices(tenantId, filters)` → 一覧取得
4. `getInvoiceById(id)` → 詳細取得（明細含む）
5. `updateInvoiceStatus(id, status)` → ステータス変更
6. `deleteInvoice(id)` → 削除（draft のみ）

### 権限
- 作成/編集/削除: Accounting, Tenant Admin
- 閲覧: PM（自PJの請求のみ）, Accounting, Tenant Admin
- ステータス変更: Accounting, Tenant Admin

### バリデーション
- 取引先名: 必須、200文字以内
- 発行日: 必須
- 支払期日: 必須、発行日以降
- 明細: 1行以上必須
- 単価: 0以上
- 数量: 0超
- ステータス遷移: draft→sent→paid / draft→cancelled / sent→cancelled

## 出力ファイル

1. /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/screens/SCR-H01.md
2. /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/screens/SCR-H02.md
3. /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/apis/API-H01.md

frontmatter を含めること。

## 検証

```
cd /home/garchomp-game/workspace/starlight-test/opsHub-doc && npm run build
```

## ウォークスルー出力先

/home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/r8-2-invoice-spec.md
