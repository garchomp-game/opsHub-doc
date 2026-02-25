---
title: "R8-1: 経費集計 仕様書作成 ウォークスルー"
description: SCR-D03（経費集計画面）と API-D02（経費集計API）の仕様書作成記録
---

## 概要

REQ-D02（経費集計/レポート）の画面仕様書（SCR-D03）と API 仕様書（API-D02）を新規作成した。

## 作成ファイル

| ファイル | 用途 |
|---|---|
| [SCR-D03.md](../../spec/screens/scr-d03/) | 経費集計画面の仕様 |
| [API-D02.md](../../spec/apis/api-d02/) | 経費集計 API の仕様 |

## SCR-D03 の設計ポイント

- **レイアウト**: フィルタカード → サマリーカード（4指標） → タブ切替（3ビュー）
- **集計ビュー**:
  1. カテゴリ別: 円グラフ + テーブル（カテゴリ, 件数, 合計金額, 割合）
  2. PJ別: 横棒グラフ + テーブル（PJ名, 件数, 合計金額）
  3. 月別推移: 折れ線グラフ + テーブル（月, 件数, 合計金額）
- **フィルタ**: 期間（RangePicker）、カテゴリ、PJ、ステータス（全て/承認済のみ）
- **権限**: Accounting / PM / Tenant Admin のみ
- **パターン参照**: SCR-C03-2（工数集計）と同じ構成

## API-D02 の設計ポイント

- **4つの Server Action**: `getExpenseSummaryByCategory`, `getExpenseSummaryByProject`, `getExpenseSummaryByMonth`, `getExpenseStats`
- **データ取得**: Server Component 内で `Promise.all` による4並列クエリ（API-C03-2 と同パターン）
- **共通フィルタ型**: `ExpenseSummaryFilters` を定義し、全 Action で共有
- **権限チェック**: `requireRole(["accounting", "pm", "tenant_admin"])` を全 Action 冒頭で実行
- **SQL クエリ**: `GROUP BY` + 集約関数による集計、`DATE_TRUNC` による月別切り捨て

## 検証結果

```
npm run build
→ 127 page(s) built in 34.65s
→ Exit code: 0
```

SCR-D03, API-D02 とも正常にビルドされ、ページが生成された。
