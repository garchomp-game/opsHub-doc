---
title: "R9-2: 経費集計画面の実装"
description: "REQ-D02 経費集計/レポート画面とServer Actionsの実装"
---

あなたは OpsHub の開発者です。経費集計/レポート機能（REQ-D02）を実装してください。

## 参照する仕様書

- SCR-D03: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/screens/SCR-D03.md
- API-D02: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/apis/API-D02.md

## 参照する既存実装（パターン参照）

- 工数集計（類似機能）: /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/timesheets/reports/
- 経費一覧（同Epic）: /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/expenses/
- ナレッジ: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/knowledge.md

## 作成するファイル

### Server Actions
- `/home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/expenses/summary/_actions.ts`
  - `getExpenseSummaryByCategory()`
  - `getExpenseSummaryByProject()`
  - `getExpenseSummaryByMonth()`
  - `getExpenseStats()`

### ページ（Server Component）
- `/home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/expenses/summary/page.tsx`

### Client Component
- `/home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/expenses/summary/_components/ExpenseSummaryClient.tsx`
  - フィルタ UI（期間、カテゴリ、PJ、ステータス）
  - タブ切替（カテゴリ別 / PJ別 / 月別推移）
  - Ant Design: Card, Statistic, Table, Tabs, DatePicker, Select
  - グラフは Phase 2 の簡易版として Ant Design の `Progress` やテーブルで代替可（@ant-design/charts は依存が重いため）

### サイドバー更新
- `/home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/layout.tsx`
  - 経費メニューに「経費集計」サブメニュー追加: `/expenses/summary`

## 実装パターン

- `requireRole(tenantId, ["accounting", "pm", "tenant_admin"])` で権限チェック
- Server Component で `Promise.all` 並列データ取得
- Client Component でフィルタ状態管理（`useTransition` + Server Action 再呼出）
- 集計クエリは Supabase の `.select()` + JS 側で集計、または `.rpc()` で SQL 集計

## 検証

```bash
cd /home/garchomp-game/workspace/starlight-test/OpsHub && npm run build
```

## ウォークスルー出力先

/home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/r9-2-expense-summary.md
