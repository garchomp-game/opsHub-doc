---
title: SPEC-API-C02 タスクCRUD
description: タスクの作成・取得・更新・削除・ステータス変更の仕様
---

## 目的 / In-Out / Related
- **目的**: カンバンボード上のタスク操作仕様を定める
- **対象範囲（In/Out）**: タスクCRUD、ステータス遷移（D&D対応）
- **Related**: REQ-C02 / [SCR-C02 タスク管理](../../spec/screens/scr-c02/) / DD-DB-005 tasks

---

## 一覧取得（Server Component）

### API情報
- **API ID**: SPEC-API-C02-LIST
- **用途**: カンバンボードのタスクフェッチ
- **種別**: Server Component 内の直接クエリ
- **認可**: ログイン必須。RLS でテナント + PJ所属制御

### Request（クエリ条件）
- **必須**: `project_id`（UUID）
- **フィルタ**: status、assignee_id、priority
- **ソート**: updated_at DESC（デフォルト）

### Response
- 200: `{ data: Task[] }`
  ```typescript
  type Task = {
    id: string;
    title: string;
    description: string | null;
    status: "todo" | "in_progress" | "done";
    assignee: { id: string; name: string } | null;
    priority: "high" | "medium" | "low";
    due_date: string | null;
    estimated_hours: number | null;
    created_at: string;
    updated_at: string;
  };
  ```

### RLS制御
- PJメンバーであれば全タスク参照可
- テナント分離: 常に `tenant_id` で自動フィルタ

---

## 作成（Server Action）

### API情報
- **API ID**: SPEC-API-C02-CREATE
- **種別**: Server Action

### Request
```typescript
type CreateTaskInput = {
  project_id: string;       // 必須
  title: string;            // 必須, 1〜200文字
  description?: string;
  assignee_id?: string;     // PJメンバーのUUID
  priority?: "high" | "medium" | "low";  // デフォルト 'medium'
  due_date?: string;        // ISO8601
  estimated_hours?: number; // 0〜999
};
```

### バリデーション
| ルール | エラーメッセージ |
|---|---|
| title が空 | タスク名は必須です |
| title が200文字超過 | タスク名は200文字以内で入力してください |
| assignee_id がPJメンバーに存在しない | 指定したユーザーはこのプロジェクトのメンバーではありません |
| due_date が過去 | 期限は本日以降を指定してください |

### Response
- 201: `{ data: Task }`
- 400: バリデーションエラー

### 権限
| ロール | 許可 |
|---|---|
| PJメンバー（Member/PM） | ✅ |
| 非メンバー | ❌ |

### 監査ログ
- action: `task.create`

---

## 更新（Server Action）

### API情報
- **API ID**: SPEC-API-C02-UPDATE
- **種別**: Server Action

### Request
```typescript
type UpdateTaskInput = {
  task_id: string;          // 必須
  title?: string;
  description?: string;
  assignee_id?: string | null;
  priority?: "high" | "medium" | "low";
  due_date?: string | null;
  estimated_hours?: number | null;
};
```

### 権限
| ロール | 許可 |
|---|---|
| PM | 全タスク編集可 |
| 担当者 | 自分のタスクのみ |

### 監査ログ
- action: `task.update`

---

## ステータス変更（Server Action）

### API情報
- **API ID**: SPEC-API-C02-STATUS
- **用途**: カンバンのD&D操作、ステータスをアトミックに変更
- **種別**: Server Action

### Request
```typescript
type ChangeTaskStatusInput = {
  task_id: string;
  status: "todo" | "in_progress" | "done";
};
```

### ステータス遷移ルール

| 元 → 先 | 許可 |
|---|---|
| todo → in_progress | ✅ |
| in_progress → todo | ✅（差戻し） |
| in_progress → done | ✅ |
| done → in_progress | ✅（再開） |
| todo → done | ❌（直接完了不可） |
| done → todo | ❌ |

### 権限
| ロール | 許可 |
|---|---|
| PM | 全タスクのステータス変更可 |
| 担当者 | 自分のタスクのみ |

### 監査ログ
- action: `task.status_change`
- before/after: `{ status: "todo" }` → `{ status: "in_progress" }`

---

## 削除（Server Action）

### API情報
- **API ID**: SPEC-API-C02-DELETE
- **種別**: Server Action

### Request
```typescript
type DeleteTaskInput = {
  task_id: string;
};
```

### バリデーション
| ルール | エラーメッセージ |
|---|---|
| 工数記録が紐づいている | このタスクには工数が記録されています。削除できません |

### 権限
| ロール | 許可 |
|---|---|
| PM | ✅ |
| その他 | ❌ |

### 監査ログ
- action: `task.delete`
