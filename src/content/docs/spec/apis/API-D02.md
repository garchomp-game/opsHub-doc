---
title: SPEC-API-D02 経費集計
description: 経費データのカテゴリ別・プロジェクト別・月別集計およびサマリー統計の取得仕様
---

## 目的 / In-Out / Related
- **目的**: 経費集計画面のデータ取得仕様を定める
- **対象範囲（In/Out）**: カテゴリ別/PJ別/月別集計クエリ、サマリー統計。CSV出力は Phase 2 以降
- **Related**: REQ-D02 / [SCR-D03 経費集計](../../spec/screens/scr-d03/) / [API-D01 経費管理](./api-d01/) / DD-DB-008 expenses

---

## API情報
- **API ID**: SPEC-API-D02
- **用途**: 経費集計/レポート
- **認可**: Accounting / PM / Tenant Admin（`requireRole` で制御）
- **種別**: Server Component 内の直接クエリ（Server Actions）

---

## Server Action 一覧

| # | Action 名 | 用途 | 認可 |
|---|---|---|---|
| 1 | `getExpenseSummaryByCategory` | カテゴリ別集計 | Accounting / PM / Tenant Admin |
| 2 | `getExpenseSummaryByProject` | プロジェクト別集計 | Accounting / PM / Tenant Admin |
| 3 | `getExpenseSummaryByMonth` | 月別推移 | Accounting / PM / Tenant Admin |
| 4 | `getExpenseStats` | サマリー統計 | Accounting / PM / Tenant Admin |

---

## 共通フィルタ

全 Server Action で共通のフィルタ条件を受け取る。

```typescript
type ExpenseSummaryFilters = {
  date_from: string;       // 必須、YYYY-MM-DD（期間開始）
  date_to: string;         // 必須、YYYY-MM-DD（期間終了）
  category?: string;       // カテゴリフィルタ（省略時: 全カテゴリ）
  project_id?: string;     // プロジェクトフィルタ（省略時: 全PJ）
  approved_only?: boolean; // true の場合 workflows.status = 'approved' のみ
};
```

### フィルタの SQL マッピング

| フィルタ | SQL 条件 |
|---|---|
| `date_from` / `date_to` | `expenses.expense_date BETWEEN :date_from AND :date_to` |
| `category` | `expenses.category = :category` |
| `project_id` | `expenses.project_id = :project_id` |
| `approved_only` | `INNER JOIN workflows ON expenses.workflow_id = workflows.id WHERE workflows.status = 'approved'` |

---

## 共通権限チェック

```typescript
// 全 Server Action の冒頭で実行
const { tenantId } = await requireRole(["accounting", "pm", "tenant_admin"]);
```

- 権限不足の場合: `redirect("/dashboard")` で即座にリダイレクト
- テナントID はすべてのクエリで `WHERE tenant_id = :tenantId` として絞り込みに使用

---

## 1. getExpenseSummaryByCategory

### API情報
- **API ID**: SPEC-API-D02-BY-CATEGORY
- **用途**: カテゴリ別の経費集計（円グラフ + テーブル）
- **種別**: Server Component 内の直接クエリ

### Request

```typescript
getExpenseSummaryByCategory(tenantId: string, filters: ExpenseSummaryFilters)
```

### クエリ概要

```sql
SELECT
  category,
  COUNT(*) AS count,
  SUM(amount) AS total_amount
FROM expenses
LEFT JOIN workflows ON expenses.workflow_id = workflows.id
WHERE expenses.tenant_id = :tenantId
  AND expenses.expense_date BETWEEN :date_from AND :date_to
  -- 動的フィルタ条件
GROUP BY category
ORDER BY total_amount DESC
```

### Response

```typescript
type CategorySummary = {
  category: string;     // カテゴリ名
  count: number;        // 件数
  total_amount: number; // 合計金額
  percentage: number;   // 割合（%、小数点1桁）
};

// 成功
{ success: true, data: CategorySummary[] }

// 失敗
{ success: false, error: { message: string } }
```

- `percentage` はアプリケーション層で計算: `(total_amount / 全カテゴリ合計) × 100`

---

## 2. getExpenseSummaryByProject

### API情報
- **API ID**: SPEC-API-D02-BY-PROJECT
- **用途**: プロジェクト別の経費集計（棒グラフ + テーブル）
- **種別**: Server Component 内の直接クエリ

### Request

```typescript
getExpenseSummaryByProject(tenantId: string, filters: ExpenseSummaryFilters)
```

### クエリ概要

```sql
SELECT
  projects.id,
  projects.name,
  COUNT(*) AS count,
  SUM(expenses.amount) AS total_amount
FROM expenses
INNER JOIN projects ON expenses.project_id = projects.id
LEFT JOIN workflows ON expenses.workflow_id = workflows.id
WHERE expenses.tenant_id = :tenantId
  AND expenses.expense_date BETWEEN :date_from AND :date_to
  -- 動的フィルタ条件
GROUP BY projects.id, projects.name
ORDER BY total_amount DESC
```

### Response

```typescript
type ProjectSummary = {
  id: string;           // プロジェクトID
  name: string;         // プロジェクト名
  count: number;        // 件数
  total_amount: number; // 合計金額
};

// 成功
{ success: true, data: ProjectSummary[] }

// 失敗
{ success: false, error: { message: string } }
```

---

## 3. getExpenseSummaryByMonth

### API情報
- **API ID**: SPEC-API-D02-BY-MONTH
- **用途**: 月別の経費推移（折れ線グラフ + テーブル）
- **種別**: Server Component 内の直接クエリ

### Request

```typescript
getExpenseSummaryByMonth(tenantId: string, filters: ExpenseSummaryFilters)
```

### クエリ概要

```sql
SELECT
  DATE_TRUNC('month', expense_date) AS month,
  COUNT(*) AS count,
  SUM(amount) AS total_amount
FROM expenses
LEFT JOIN workflows ON expenses.workflow_id = workflows.id
WHERE expenses.tenant_id = :tenantId
  AND expenses.expense_date BETWEEN :date_from AND :date_to
  -- 動的フィルタ条件
GROUP BY DATE_TRUNC('month', expense_date)
ORDER BY month ASC
```

### Response

```typescript
type MonthlySummary = {
  month: string;        // "YYYY-MM" 形式
  count: number;        // 件数
  total_amount: number; // 合計金額
};

// 成功
{ success: true, data: MonthlySummary[] }

// 失敗
{ success: false, error: { message: string } }
```

---

## 4. getExpenseStats

### API情報
- **API ID**: SPEC-API-D02-STATS
- **用途**: サマリーカード用の集計統計
- **種別**: Server Component 内の直接クエリ

### Request

```typescript
getExpenseStats(tenantId: string, filters: ExpenseSummaryFilters)
```

### クエリ概要

```sql
SELECT
  SUM(amount) AS total_amount,
  COUNT(*) AS total_count,
  AVG(amount) AS avg_amount,
  MAX(amount) AS max_amount
FROM expenses
LEFT JOIN workflows ON expenses.workflow_id = workflows.id
WHERE expenses.tenant_id = :tenantId
  AND expenses.expense_date BETWEEN :date_from AND :date_to
  -- 動的フィルタ条件
```

### Response

```typescript
type ExpenseStats = {
  total_amount: number;  // 合計金額
  total_count: number;   // 件数
  avg_amount: number;    // 平均金額（小数点以下切り捨て）
  max_amount: number;    // 最高金額
};

// 成功
{ success: true, data: ExpenseStats }

// 失敗
{ success: false, error: { message: string } }
```

---

## データ取得パターン

SCR-C03-2 / API-C03-2（工数集計）と同じ Server Component 直接クエリパターンを採用する。

```typescript
// Server Component (expenses/summary/page.tsx)
export default async function ExpenseSummaryPage({ searchParams }: Props) {
  const { tenantId } = await requireRole(["accounting", "pm", "tenant_admin"]);

  const filters: ExpenseSummaryFilters = {
    date_from: searchParams.from ?? getFirstDayOfMonth(),
    date_to: searchParams.to ?? getLastDayOfMonth(),
    category: searchParams.category,
    project_id: searchParams.project_id,
    approved_only: searchParams.status === "approved",
  };

  const [byCategory, byProject, byMonth, stats] = await Promise.all([
    getExpenseSummaryByCategory(tenantId, filters),
    getExpenseSummaryByProject(tenantId, filters),
    getExpenseSummaryByMonth(tenantId, filters),
    getExpenseStats(tenantId, filters),
  ]);

  return (
    <>
      <FilterCard filters={filters} />
      <SummaryCards stats={stats} />
      <AggregationTabs
        byCategory={byCategory}
        byProject={byProject}
        byMonth={byMonth}
      />
    </>
  );
}
```

### Server / Client Component 分離

| コンポーネント | 種別 | 理由 |
|---|---|---|
| `ExpenseSummaryPage` | Server Component | データ取得を SSR で実行 |
| `FilterCard` | Client Component | ユーザーの入力操作を処理 |
| `SummaryCards` | Server Component | 読み取り専用の表示 |
| `AggregationTabs` | Client Component | タブ切替のインタラクション |
| `PieChart` / `BarChart` / `LineChart` | Client Component | チャートライブラリの使用 |

---

## エラー設計

| コード | 分類 | 内容 |
|---|---|---|
| `ERR-AUTH-003` | 認証/認可 | 権限不足（Accounting/PM/Tenant Admin 以外） |
| `ERR-VAL-010` | バリデーション | 期間不正（date_from > date_to） |
| `ERR-VAL-011` | バリデーション | カテゴリフィルタ値不正 |
| `ERR-SYS-001` | システム | DBクエリ失敗 |

---

## 監査ログポイント
- 集計データの **参照のみ** のため、監査ログは記録しない
- 将来の CSV エクスポート実装時に `expense.export` アクションを追加予定

---

## Related
- REQ-D02 / [SCR-D03 経費集計](../../spec/screens/scr-d03/) / [API-D01 経費管理](./api-d01/) / [API-C03-2 工数集計](./api-c03-2/) / DD-DB-008 expenses
