---
title: "R8-1: 経費集計 仕様書作成"
description: "SCR-D03（経費集計画面）と API-D02（経費集計API）の仕様書を新規作成"
---

あなたは OpsHub の設計ドキュメント担当です。
経費集計/レポート機能（REQ-D02）の画面仕様書（SCR-D03）と API 仕様書（API-D02）を新規作成してください。

## 背景

- 経費申請機能（REQ-D01）は実装済み
  - 仕様: SCR-D01, API-D01
  - 実装: `/expenses`, `/expenses/new`
- 経費集計機能（REQ-D02）は未着手
  - 画面: `/expenses/summary`
  - 対象ロール: Accounting, PM, Tenant Admin

## 参照ファイル

### テンプレート（フォーマット参照）
- /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/screens/template.md
- /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/apis/template.md

### 既存の類似仕様（パターン参照）
- /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/screens/SCR-D01.md （経費一覧）
- /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/apis/API-D01.md （経費API）
- /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/screens/SCR-C03-2.md （工数集計 — 類似パターン）
- /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/apis/API-C03-2.md （工数集計API — 類似パターン）

### 要件
- /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/requirements/req-catalog/index.md （REQ-D02）

### DB 設計
- /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/detail/db/index.md （DD-DB-008 expenses）

## SCR-D03 の設計指針

### 画面構成
- URL: `/expenses/summary`
- アクセス権限: Accounting, PM, Tenant Admin
- レイアウト: フィルタカード + サマリーカード + 集計テーブル + グラフ

### フィルタ
- 期間（RangePicker: from - to）
- カテゴリ（Select: 交通費/宿泊費/飲食費/備品/通信費/その他）
- プロジェクト（Select: プロジェクト一覧）
- ステータス（Select: 全て/承認済のみ）

### 集計ビュー
1. **カテゴリ別集計**: 円グラフ + テーブル（カテゴリ, 件数, 合計金額, 割合）
2. **プロジェクト別集計**: 棒グラフ + テーブル（プロジェクト, 件数, 合計金額）
3. **月別推移**: 折れ線グラフ + テーブル（月, 件数, 合計金額）
4. **サマリーカード**: 合計金額, 件数, 平均金額, 最高金額

### データ取得パターン
- Server Component で直接クエリ（工数集計と同パターン）

## API-D02 の設計指針

### Server Actions
1. `getExpenseSummaryByCategory(tenantId, filters)` → カテゴリ別集計
2. `getExpenseSummaryByProject(tenantId, filters)` → PJ別集計
3. `getExpenseSummaryByMonth(tenantId, filters)` → 月別推移
4. `getExpenseStats(tenantId, filters)` → サマリー統計

### 権限チェック
- `requireRole(tenantId, ["accounting", "pm", "tenant_admin"])`

## 出力ファイル

1. /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/screens/SCR-D03.md
2. /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/apis/API-D02.md

frontmatter を含めること。

## 検証

```
cd /home/garchomp-game/workspace/starlight-test/opsHub-doc && npm run build
```

## ウォークスルー出力先

/home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/r8-1-expense-summary-spec.md
