---
title: SPEC-API-C04 工数集計
description: 工数データの集計・レポート取得の仕様
---

## 目的 / In-Out / Related
- **目的**: 工数集計画面のデータ取得・CSV出力仕様を定める
- **対象範囲（In/Out）**: PJ別/メンバー別集計、グラフデータ、CSV生成
- **Related**: REQ-C03 / [SCR-C05 工数集計](../../spec/screens/scr-c05/) / DD-DB-007 timesheets

---

## PJ別集計（Server Component）

### API情報
- **API ID**: SPEC-API-C04-BY-PROJECT
- **用途**: PJ別集計テーブル + グラフ用データ
- **種別**: Server Component 内の直接クエリ

### Request
- **フィルタ**:
  - `date_from` / `date_to`（ISO8601, 必須）
  - `project_ids`（UUID[], 省略時: 全PJ）
  - `unit`（`month` | `week` | `day`, デフォルト: `month`）

### Response
- 200:
  ```typescript
  type ProjectAggregation = {
    summary: {
      total_hours: number;
      project_count: number;
      member_count: number;
    };
    projects: {
      id: string;
      name: string;
      periods: { [period: string]: number };  // { "2026-01": 160, "2026-02": 180 }
      total: number;
      budget_hours: number | null;
    }[];
    period_totals: { [period: string]: number };
  };
  ```

### RLS制御
- PM: 管轄PJのみ
- Accounting / Tenant Admin: テナント全PJ
- Member: 自分が所属するPJのみ

---

## メンバー別集計（Server Component）

### API情報
- **API ID**: SPEC-API-C04-BY-MEMBER
- **用途**: メンバー別集計テーブル
- **種別**: Server Component 内の直接クエリ

### Request
- **フィルタ**: `date_from` / `date_to`、`project_id`（省略時: 全PJ）、`unit`

### Response
- 200:
  ```typescript
  type MemberAggregation = {
    members: {
      id: string;
      name: string;
      periods: { [period: string]: number };
      total: number;
      avg_daily: number;
    }[];
    period_totals: { [period: string]: number };
  };
  ```

### RLS制御
- PM: 管轄PJメンバーのみ
- Member: 自分のみ
- Accounting / Tenant Admin: テナント全メンバー

---

## CSV出力（Server Action）

### API情報
- **API ID**: SPEC-API-C04-EXPORT
- **用途**: 工数データのCSVダウンロード
- **種別**: Route Handler（`GET /api/timesheets/export`）
  - ※ ファイルダウンロードのため例外的にRoute Handlerを使用

### Request（Query Parameters）
```typescript
type ExportParams = {
  date_from: string;    // 必須
  date_to: string;      // 必須
  project_id?: string;  // 省略時: 全PJ
  format?: "csv";       // 将来JSON追加可能性
};
```

### Response
- Content-Type: `text/csv; charset=utf-8`
- Content-Disposition: `attachment; filename="timesheets_2026-02.csv"`
- BOM付きUTF-8（Excel対応）

### CSVカラム
```csv
プロジェクト名,メンバー名,日付,工数(h),タスク名,備考
ECサイトリニューアル,田中太郎,2026-02-22,8.00,API設計,認証API実装
```

### 権限
| ロール | エクスポート範囲 |
|---|---|
| Member | 自分の工数のみ |
| PM | 管轄PJ全メンバー |
| Accounting / Tenant Admin | テナント全体 |

### 監査ログ
- action: `timesheet.export`
- metadata: `{ date_from, date_to, project_id, row_count }`
