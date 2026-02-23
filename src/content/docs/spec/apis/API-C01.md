---
title: SPEC-API-C01 プロジェクトCRUD
description: プロジェクトの作成・取得・更新・削除の仕様
---

## 目的 / In-Out / Related
- **目的**: プロジェクト管理AIのCRUD操作仕様を定める
- **対象範囲（In/Out）**: 一覧取得、詳細取得、作成、更新、メンバー管理
- **Related**: REQ-C01 / [SCR-C01-1 PJ一覧](../../spec/screens/scr-c01-1/) / [SCR-C01-2 PJ詳細](../../spec/screens/scr-c01-2/) / DD-DB-003 projects

---

## 一覧取得（Server Component）

### API情報
- **API ID**: SPEC-API-C01-LIST
- **用途**: PJ一覧画面のデータフェッチ
- **種別**: Server Component 内の直接クエリ
- **認可**: ログイン必須。RLS により所属PJのみ取得

### Request（クエリ条件）
- **フィルタ**: status（`planning`/`active`/`completed`/`cancelled`）
- **ソート**: created_at DESC（デフォルト）、name ASC
- **ページネーション**: page（1始まり）、per_page（デフォルト20、最大100）
- **検索**: name に対する部分一致

### Response
- 200: `{ data: Project[], count: number }`
  ```typescript
  type ProjectSummary = {
    id: string;
    name: string;
    status: "planning" | "active" | "completed" | "cancelled";
    pm: { id: string; name: string };
    start_date: string | null;
    end_date: string | null;
    member_count: number;
    task_stats: { total: number; done: number };
    created_at: string;
  };
  ```

### RLS制御
- PM / Tenant Admin: テナント内全PJ参照可
- Member: `project_members` に自分が含まれるPJのみ
- テナント分離: 常に `tenant_id` で自動フィルタ

---

## 詳細取得（Server Component）

### API情報
- **API ID**: SPEC-API-C01-DETAIL
- **用途**: PJ詳細画面のデータフェッチ
- **種別**: Server Component 内の直接クエリ

### Request
- **パラメータ**: `project_id`（UUID）

### Response
- 200:
  ```typescript
  type ProjectDetail = {
    id: string;
    name: string;
    description: string | null;
    status: "planning" | "active" | "completed" | "cancelled";
    pm: { id: string; name: string; email: string };
    start_date: string | null;
    end_date: string | null;
    members: { id: string; name: string; email: string; joined_at: string }[];
    task_stats: { total: number; todo: number; in_progress: number; done: number };
    timesheet_stats: { total_hours: number; this_month_hours: number };
    created_at: string;
    updated_at: string;
  };
  ```
- 404: PJが存在しない or アクセス権なし

---

## 作成（Server Action）

### API情報
- **API ID**: SPEC-API-C01-CREATE
- **用途**: プロジェクトの新規作成
- **種別**: Server Action

### Request
```typescript
type CreateProjectInput = {
  name: string;           // 必須, 1〜100文字
  description?: string;   // 任意
  status?: string;        // デフォルト 'planning'
  start_date?: string;    // ISO8601
  end_date?: string;      // ISO8601, start_date 以降
  pm_id: string;          // 必須, UUID
};
```

### バリデーション
| ルール | エラーメッセージ |
|---|---|
| name が空 | プロジェクト名は必須です |
| name が100文字超過 | プロジェクト名は100文字以内で入力してください |
| end_date < start_date | 終了日は開始日以降にしてください |
| pm_id がテナント内に存在しない | 指定されたPMが見つかりません |

### Response
- 201: `{ data: ProjectDetail }`
- 400: バリデーションエラー
- 403: 権限なし

### 権限
| ロール | 許可 |
|---|---|
| PM / Tenant Admin | ✅ |
| Member | ❌ |

### 監査ログ
- action: `project.create`
- resource_type: `project`

---

## 更新（Server Action）

### API情報
- **API ID**: SPEC-API-C01-UPDATE
- **種別**: Server Action

### Request
```typescript
type UpdateProjectInput = {
  project_id: string;     // 必須
  name?: string;
  description?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  pm_id?: string;
};
```

### 権限
| ロール | 許可 |
|---|---|
| 対象PJのPM | ✅ |
| Tenant Admin | ✅ |
| その他 | ❌ |

### 監査ログ
- action: `project.update`（ステータス変更時は `project.status_change`）

---

## メンバー追加/削除（Server Action）

### API情報
- **API ID**: SPEC-API-C01-MEMBERS
- **種別**: Server Action

### Request
```typescript
// 追加
type AddMemberInput = {
  project_id: string;
  user_id: string;
};

// 削除
type RemoveMemberInput = {
  project_id: string;
  user_id: string;
};
```

### バリデーション
| ルール | エラーメッセージ |
|---|---|
| user_id がテナント内に存在しない | 指定されたユーザーが見つかりません |
| 既にメンバー（追加時） | このユーザーは既にメンバーです |
| PMを削除しようとした | PMは直接削除できません。先にPM変更をしてください |

### 権限
| ロール | 許可 |
|---|---|
| 対象PJのPM | ✅ |
| Tenant Admin | ✅ |

### 監査ログ
- action: `project.add_member` / `project.remove_member`
