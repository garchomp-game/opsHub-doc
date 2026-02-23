---
title: SPEC-API-C03-1 工数入力/更新
description: 工数の記録・更新・削除の仕様
---

## 目的 / In-Out / Related
- **目的**: 工数入力画面のデータ操作仕様を定める
- **対象範囲（In/Out）**: 工数登録、バルク更新、日次/週次取得
- **Related**: REQ-C03 / [SCR-C03-1 工数入力](../../spec/screens/scr-c03-1/) / DD-DB-007 timesheets

---

## 日次取得（Server Component）

### API情報
- **API ID**: SPEC-API-C03-1-DAILY
- **用途**: 特定日の工数を取得（工数入力画面）
- **種別**: Server Component 内の直接クエリ

### Request
- **パラメータ**: `work_date`（ISO8601）、`user_id`（省略時: 自分）

### Response
- 200:
  ```typescript
  type DailyTimesheets = {
    work_date: string;
    total_hours: number;
    entries: TimesheetEntry[];
  };

  type TimesheetEntry = {
    id: string;
    project: { id: string; name: string };
    task: { id: string; title: string } | null;
    hours: number;      // 0.25刻み
    note: string | null;
    created_at: string;
    updated_at: string;
  };
  ```

### RLS制御
- 自分の工数: 常に閲覧可
- 他ユーザーの工数: PM（管轄PJ内のみ） / Tenant Admin

---

## 週次取得（Server Component）

### API情報
- **API ID**: SPEC-API-C03-1-WEEKLY
- **用途**: 週間ビューのグリッドデータ

### Request
- **パラメータ**: `week_start`（ISO8601, 月曜日）、`user_id`

### Response
- 200:
  ```typescript
  type WeeklyTimesheets = {
    week_start: string;
    week_end: string;
    total_hours: number;
    daily_totals: { [date: string]: number };  // { "2026-02-23": 8.0, ... }
    entries: (TimesheetEntry & { work_date: string })[];
  };
  ```

---

## 登録（Server Action）

### API情報
- **API ID**: SPEC-API-C03-1-CREATE
- **種別**: Server Action

### Request
```typescript
type CreateTimesheetInput = {
  project_id: string;       // 必須
  task_id?: string;         // 任意
  work_date: string;        // 必須, ISO8601
  hours: number;            // 必須, 0.25〜24, 0.25刻み
  note?: string;
};
```

### バリデーション
| ルール | エラーメッセージ |
|---|---|
| hours が0.25未満 or 24超過 | 工数は0.25〜24の範囲で入力してください |
| hours が0.25刻みでない | 工数は15分（0.25h）単位で入力してください |
| project_id に所属していない | このプロジェクトのメンバーではありません |
| task_id がproject_idに属していない | 指定したタスクはこのプロジェクトに属していません |
| work_date が未来（翌日以降） | 未来の日付には工数を登録できません |
| 同日合計が24hを超える | 1日の合計工数が24時間を超えています |
| 同一PJ/タスク/日に重複 | この組み合わせの工数は既に登録されています |

### Response
- 201: `{ data: TimesheetEntry }`
- 400: バリデーションエラー

### 権限
- 全ロール（自分の工数のみ）

### 監査ログ
- action: `timesheet.create`
- ⚠️ 量が多いため、日次サマリーでの記録を検討（未決事項）

---

## バルク更新（Server Action）

### API情報
- **API ID**: SPEC-API-C03-1-BULK
- **用途**: 週間ビューでの一括入力・更新
- **種別**: Server Action

### Request
```typescript
type BulkTimesheetInput = {
  entries: {
    id?: string;            // 既存更新時
    project_id: string;
    task_id?: string;
    work_date: string;
    hours: number;
    note?: string;
  }[];
  deleted_ids?: string[];   // 削除対象
};
```

### 処理
1. `id` あり: UPDATE
2. `id` なし: INSERT
3. `deleted_ids`: DELETE
4. すべて1トランザクション内で実行

### 権限
- 全ロール（自分の工数のみ）

---

## 削除（Server Action）

### API情報
- **API ID**: SPEC-API-C03-1-DELETE
- **種別**: Server Action

### Request
```typescript
type DeleteTimesheetInput = {
  timesheet_id: string;
};
```

### バリデーション
| ルール | エラーメッセージ |
|---|---|
| 月次締め済みの期間 | この期間は既に締められています。修正が必要な場合は管理者へ連絡してください |
| 自分以外の工数 | 他のユーザーの工数は削除できません |

### 権限
- 全ロール（自分の工数で、未締め期間のみ）

### 監査ログ
- action: `timesheet.delete`
