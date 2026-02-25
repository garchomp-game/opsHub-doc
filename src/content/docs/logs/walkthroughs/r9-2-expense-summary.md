---
title: "R9-2: 経費集計画面の実装ウォークスルー"
description: "REQ-D02 経費集計/レポート画面の実装記録"
---

# R9-2: 経費集計画面の実装ウォークスルー

> 実施日: 2026-02-24

## 概要

SCR-D03 / API-D02 仕様に基づき、経費データのカテゴリ別・PJ別・月別集計画面を実装した。

## 変更ファイル一覧

| ファイル | 種別 | 内容 |
|---|---|---|
| `expenses/summary/_actions.ts` | NEW | Server Actions（4集計 + フィルタPJ一覧） |
| `expenses/summary/page.tsx` | NEW | Server Component（権限・データ取得） |
| `expenses/summary/_components/ExpenseSummaryClient.tsx` | NEW | Client Component（フィルタ・タブ・テーブル） |
| `(authenticated)/layout.tsx` | MODIFY | サイドバーに経費集計サブメニュー追加 |

## 実装詳細

### Server Actions (`_actions.ts`)

`withAuth` ラッパーで4つの集計 Action を実装。

| Action | 説明 |
|---|---|
| `getExpenseSummaryByCategory` | カテゴリ別 COUNT/SUM + percentage 計算 |
| `getExpenseSummaryByProject` | PJ JOIN + グルーピング |
| `getExpenseSummaryByMonth` | `expense_date` → YYYY-MM 月単位集計 |
| `getExpenseStats` | SUM/COUNT/AVG(floor)/MAX の4統計量 |

共通パターン:
- `hasRole(user, tenantId, ["accounting", "pm", "tenant_admin"])` 権限チェック
- `date_from > date_to` バリデーション（ERR-VAL-010）
- `approved_only` → `workflows.status = 'approved'` JOIN フィルタ
- Supabase `.select()` + JS側集計

### Server Component (`page.tsx`)

- `requireAuth()` + `hasRole()` → 権限不足時 `redirect("/dashboard")`
- `searchParams` → `ExpenseSummaryFilters` マッピング（デフォルト: 当月）
- `Promise.all` で5クエリ並列（4集計 + PJ一覧）
- 全データを `ExpenseSummaryClient` に props 渡し

### Client Component (`ExpenseSummaryClient.tsx`)

工数レポート (`ReportClient.tsx`) と同パターン。

- **フィルタ Card**: `DatePicker` × 2 + `Select`（カテゴリ/PJ/ステータス）+ 「集計」ボタン
- **サマリーカード**: `Statistic` × 4（合計/件数/平均/最高）
- **タブ切替**: `Tabs`（カテゴリ別/PJ別/月別推移）- クライアントサイド切替
- **テーブル**: 各ビューに `Table` + `Table.Summary` フッター合計行
- **グラフ代替**: `Progress` バーで構成比/金額比較を視覚化（Phase 2 簡易版）
- **再集計**: `useTransition` + Server Action 再呼出

### サイドバー更新 (`layout.tsx`)

経費管理メニューを `children` 付きサブメニューに変更:
- 経費一覧 (`/expenses`)
- 経費集計 (`/expenses/summary`) — `BarChartOutlined` アイコン付き

## 検証結果

```
npm run build → Exit code: 0 ✅
```

ビルド出力にて `/expenses/summary` ルートが `ƒ (Dynamic)` として登録を確認。

`npx tsc --noEmit` でも新規ファイルに型エラーなし（既存の `database.ts` の生成ファイルエラーのみ）。

## カテゴリ色定義

実装の経費カテゴリ（SCR-D01 / `_actions.ts` 準拠）を使用:

| カテゴリ | Tag色 |
|---|---|
| 交通費 | `blue` |
| 宿泊費 | `purple` |
| 会議費 | `cyan` |
| 消耗品費 | `orange` |
| 通信費 | `green` |
| その他 | `default` |

## 関連仕様

- SCR-D03: 経費集計画面仕様
- API-D02: 経費集計 API 仕様
- REQ-D02: 経費集計/レポート要件
