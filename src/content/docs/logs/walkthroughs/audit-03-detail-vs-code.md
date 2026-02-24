---
title: "監査03: 詳細設計と実装の整合性"
---

## 監査概要

| 項目 | 内容 |
|---|---|
| 実施日 | 2026-02-24 |
| 対象設計書 | detail/db, detail/rls, detail/modules, detail/sequences |
| 対象実装 | supabase/migrations/ (4ファイル), src/types/, src/lib/ |
| 判定 | ⚠ 軽微な不整合あり（致命的問題なし） |

---

## 1. DB設計 vs マイグレーション

### 1.1 テーブル存在チェック

| ID | テーブル | 設計 | マイグレーション | 判定 |
|---|---|---|---|---|
| DD-DB-001 | tenants | ✅ | ✅ `initial_schema` + `tenant_soft_delete` + `workflow_seq` | ✅ |
| DD-DB-002 | user_roles | ✅ | ✅ `initial_schema` | ✅ |
| DD-DB-003 | projects | ✅ | ✅ `initial_schema` | ✅ |
| DD-DB-004 | project_members | ✅ | ✅ `initial_schema` | ✅ |
| DD-DB-005 | tasks | ✅ | ✅ `initial_schema` | ✅ |
| DD-DB-006 | workflows | ✅ | ✅ `initial_schema` | ✅ |
| DD-DB-007 | timesheets | ✅ | ✅ `initial_schema` | ✅ |
| DD-DB-008 | expenses | ✅ | ✅ `initial_schema` | ✅ |
| DD-DB-009 | audit_logs | ✅ | ✅ `initial_schema` | ✅ |
| DD-DB-010 | notifications | ✅ | ✅ `initial_schema` | ✅ |
| DD-DB-011 | workflow_attachments | ✅ | ✅ `initial_schema` | ✅ |
| DD-DB-012 | profiles | ✅ | ✅ `profiles_table` | ✅ |

**結果**: 全12テーブル完全一致 ✅

### 1.2 カラム・型・制約の不整合

| # | テーブル | 項目 | 設計書 | マイグレーション | 深刻度 | 備考 |
|---|---|---|---|---|---|---|
| D-01 | audit_logs | before カラム名 | `before` | `before_data` | ⚠ 中 | 型定義(database.ts)も `before_data` のためマイグレーション側が正。**設計書を修正すべき** |
| D-02 | audit_logs | after カラム名 | `after` | `after_data` | ⚠ 中 | 同上。`after_data` に統一すべき |
| D-03 | tenants | deleted_at | 設計書あり | マイグレーションあり | ⚠ 低 | `database.ts` 型定義に `deleted_at` が**欠落**している（型再生成が必要） |
| D-04 | timesheets | hours CHECK | `CHECK(0〜24), 0.25刻み` | `CHECK (hours >= 0 AND hours <= 24)` | ℹ 情報 | 0.25刻みチェックは設計書記載だがマイグレーションでは未実装（アプリ層で制御と推測） |

### 1.3 Index チェック

| テーブル | 設計書の Index | マイグレーション | 判定 |
|---|---|---|---|
| user_roles | `(tenant_id, user_id)`, `(user_id)` | `idx_user_roles_tenant_user`, `idx_user_roles_user` | ✅ |
| projects | `(tenant_id, status)`, `(tenant_id, pm_id)` | `idx_projects_tenant_status`, `idx_projects_tenant_pm` | ✅ |
| project_members | `(tenant_id, user_id)` | `idx_project_members_tenant_user` | ✅ |
| tasks | `(tenant_id, project_id)`, `(tenant_id, assignee_id)` | `idx_tasks_tenant_project`, `idx_tasks_tenant_assignee` | ✅ |
| workflows | `(tenant_id, status)`, `(tenant_id, created_by)`, `(tenant_id, approver_id, status)` | 3 indexes 全て存在 | ✅ |
| timesheets | `(tenant_id, user_id, work_date)`, `(tenant_id, project_id, work_date)` | `idx_timesheets_tenant_user_date`, `idx_timesheets_tenant_project_date` | ✅ |
| expenses | `(tenant_id, created_by)`, `(tenant_id, project_id)` | `idx_expenses_tenant_creator`, `idx_expenses_tenant_project` | ✅ |
| audit_logs | `(tenant_id, created_at DESC)`, `(tenant_id, resource_type, resource_id)`, `(tenant_id, user_id)` | 3 indexes 全て存在 | ✅ |
| notifications | `(tenant_id, user_id, is_read, created_at DESC)` | `idx_notifications_user_unread` | ✅ |
| workflow_attachments | `(tenant_id, workflow_id)` | `idx_workflow_attachments_workflow` | ✅ |

**結果**: 全 Index 一致 ✅

### 1.4 トリガー / 関数チェック

| 項目 | 設計書 | マイグレーション | 判定 |
|---|---|---|---|
| `update_updated_at()` トリガー関数 | 共通規約に記載 | `initial_schema` で定義 | ✅ |
| `prevent_audit_log_mutation()` | INSERT ONLY 制約として間接記載 | `initial_schema` で定義 | ✅ |
| `handle_new_user()` | DD-DB-012 / トリガー節に記載 | `profiles_table` で定義 | ✅ |
| `handle_user_updated()` | トリガー節に記載 | `profiles_table` で定義 | ✅ |
| `on_auth_user_created` | トリガー名一致 | `profiles_table` で定義 | ✅ |
| `on_auth_user_updated` | トリガー名一致 | `profiles_table` で定義 | ✅ |
| `profiles_updated_at` | トリガー節に記載 | `profiles_table` で定義 | ✅ |
| `next_workflow_number()` RPC | RPC 節に記載 | `workflow_seq` で定義 | ✅ |
| updated_at トリガー群 | 共通規約 | tenants, projects, tasks, workflows, timesheets, expenses, profiles に設定 | ✅ |

**結果**: 全トリガー/関数一致 ✅

### 1.5 型定義 (database.ts) との整合

| # | 項目 | 状態 | 備考 |
|---|---|---|---|
| D-05 | `tenants.deleted_at` | ⚠ 欠落 | マイグレーションでは追加済みだが型定義に反映されていない。`npx supabase gen types` 再実行が必要 |
| — | その他全テーブル | ✅ | Row/Insert/Update 型が正しく生成されている |
| — | Functions | ✅ | `get_user_tenant_ids`, `has_role`, `next_workflow_number` 全て定義済み |

---

## 2. RLS設計 vs マイグレーション

### 2.1 ヘルパー関数

| 関数 | 設計書 | マイグレーション | 判定 |
|---|---|---|---|
| `get_user_tenant_ids()` | RLS設計に定義 | `initial_schema` L63-68 | ✅ 完全一致 |
| `has_role(p_tenant_id, p_role)` | RLS設計に定義 | `initial_schema` L71-81 | ✅ 完全一致 |

### 2.2 テーブル別ポリシー比較

#### tenants

| ポリシー | 設計書 | マイグレーション | 判定 |
|---|---|---|---|
| `tenant_select` | `id IN get_user_tenant_ids() AND deleted_at IS NULL` | `tenant_soft_delete` で再作成。条件一致 | ✅ |
| `tenant_update` | `has_role(id, 'tenant_admin') AND deleted_at IS NULL` | `tenant_soft_delete` で再作成。条件一致 | ✅ |

#### profiles

| ポリシー | 設計書 | マイグレーション | 判定 |
|---|---|---|---|
| `profiles_select` | 同テナント + 本人 | `profiles_table` L22-29 | ✅ 完全一致 |
| `profiles_update` | `id = auth.uid()` | `profiles_table` L32-33 | ✅ 完全一致 |
| `profiles_insert` | `WITH CHECK (true)` | `profiles_table` L36-37 | ✅ 完全一致 |

#### user_roles

| ポリシー | 設計書 | マイグレーション | 判定 |
|---|---|---|---|
| `user_roles_select` | tenant_id IN get_user_tenant_ids() | ✅ 一致 | ✅ |
| `user_roles_insert` | has_role(tenant_id, 'tenant_admin') | ✅ 一致 | ✅ |
| `user_roles_delete` | has_role(tenant_id, 'tenant_admin') | ✅ 一致 | ✅ |

#### projects

| ポリシー | 設計書 | マイグレーション | 判定 |
|---|---|---|---|
| `projects_select` | tenant_id IN get_user_tenant_ids() | ✅ 一致 | ✅ |
| `projects_insert` | pm OR tenant_admin | ✅ 一致 | ✅ |
| `projects_update` | pm(自PM) OR tenant_admin | ✅ 一致 | ✅ |

#### project_members

| ポリシー | 設計書 | マイグレーション | 判定 |
|---|---|---|---|
| (設計書に記載なし) | — | `project_members_select/insert/delete` 3ポリシー存在 | ⚠ D-06 |

> **D-06**: RLS設計書に `project_members` のポリシーが記載されていない。マイグレーションでは select/insert/delete の3ポリシーが定義済み。**設計書への追記が必要**。

#### tasks

| ポリシー | 設計書 | マイグレーション | 判定 |
|---|---|---|---|
| (設計書に記載なし) | — | `tasks_select/insert/update` 3ポリシー存在 | ⚠ D-07 |

> **D-07**: RLS設計書に `tasks` のポリシーが記載されていない。マイグレーションでは select/insert/update の3ポリシーが定義済み。**設計書への追記が必要**。

#### workflows

| ポリシー | 設計書 | マイグレーション | 判定 |
|---|---|---|---|
| `workflows_select` | created_by OR approver_id OR tenant_admin | ✅ 一致 | ✅ |
| `workflows_insert` | tenant_id + created_by = uid() | ✅ 一致 | ✅ |
| `workflows_update` | draft/rejected→申請者, submitted→承認者, tenant_admin | ✅ 一致 | ✅ |

#### timesheets

| ポリシー | 設計書 | マイグレーション | 判定 |
|---|---|---|---|
| `timesheets_select` | 自分 + PM(担当PJ) | ⚠ D-08 | ⚠ 差異あり |
| `timesheets_insert` | user_id = uid() + tenant | ✅ 一致 | ✅ |
| `timesheets_update` | user_id = uid() + tenant | ✅ 一致 | ✅ |
| `timesheets_delete` | — | マイグレーションに存在 | ⚠ D-09 |

> **D-08**: `timesheets_select` — マイグレーションでは `OR has_role(tenant_id, 'tenant_admin')` が追加されているが、設計書には `tenant_admin` 条件が記載されていない。マイグレーション側が実運用上正しく、**設計書に tenant_admin 条件を追記すべき**。

> **D-09**: `timesheets_delete` ポリシーがマイグレーションに存在するが設計書に記載なし。**設計書への追記が必要**。

#### expenses

| ポリシー | 設計書 | マイグレーション | 判定 |
|---|---|---|---|
| `expenses_select` | 作成者 + accounting + tenant_admin | ✅ 一致 | ✅ |
| `expenses_insert` | tenant + created_by = uid() | ✅ 一致 | ✅ |
| `expenses_update` | 作成者 + accounting + tenant_admin | ✅ 一致 | ✅ |

#### audit_logs

| ポリシー | 設計書 | マイグレーション | 判定 |
|---|---|---|---|
| `audit_logs_select` | it_admin OR tenant_admin | ✅ 一致 | ✅ |
| `audit_logs_insert` | tenant_id IN get_user_tenant_ids() | ✅ 一致 | ✅ |
| UPDATE/DELETE 防止 | ポリシーなし + トリガー | ✅ 一致 | ✅ |

#### notifications

| ポリシー | 設計書 | マイグレーション | 判定 |
|---|---|---|---|
| `notifications_select` | user_id = uid() + tenant | ✅ 一致 | ✅ |
| `notifications_update` | user_id = uid() + tenant | ✅ 一致 | ✅ |
| `notifications_insert` | tenant_id IN get_user_tenant_ids() | ✅ 一致 | ✅ |

#### workflow_attachments

| ポリシー | 設計書 | マイグレーション | 判定 |
|---|---|---|---|
| `workflow_attachments_select` | tenant_id IN get_user_tenant_ids() | ✅ 一致 | ✅ |
| `workflow_attachments_insert` | tenant + uploaded_by = uid() | ✅ 一致 | ✅ |

---

## 3. モジュール設計 vs 実装

### 3.1 ディレクトリ構成

設計書のディレクトリツリーと `find` 結果を比較。

| パス | 設計書 | 実装 | 判定 |
|---|---|---|---|
| `app/layout.tsx` | ✅ | ✅ | ✅ |
| `app/page.tsx` | ✅ | ✅ | ✅ |
| `app/login/page.tsx` | ✅ | ✅ | ✅ |
| `app/auth/callback/route.ts` | ✅ | ✅ | ✅ |
| `app/api/timesheets/export/route.ts` | ✅ | ✅ | ✅ |
| `app/(authenticated)/layout.tsx` | ✅ | ✅ | ✅ |
| `app/(authenticated)/page.tsx` | ✅ | ✅ | ✅ |
| `app/(authenticated)/_actions/dashboard.ts` | ✅ | ✅ | ✅ |
| `app/(authenticated)/_actions/notifications.ts` | ✅ | ✅ | ✅ |
| `app/(authenticated)/_components/NotificationBell.tsx` | ✅ | ✅ | ✅ |
| `workflows/` 配下全ファイル | ✅ | ✅ | ✅ |
| `projects/` 配下全ファイル | ✅ | ✅ | ✅ |
| `timesheets/` 配下全ファイル | ✅ | ✅ | ✅ |
| `expenses/` 配下全ファイル | ✅ | ✅ | ✅ |
| `admin/tenant/` 配下 | ✅ | ✅ | ✅ |
| `admin/users/` 配下 | ✅ | ✅ | ✅ |
| `admin/audit-logs/` 配下 | ✅ | ✅ | ✅ |
| `lib/supabase/client.ts` | ✅ | ✅ | ✅ |
| `lib/supabase/server.ts` | ✅ | ✅ | ✅ |
| `lib/supabase/admin.ts` | ✅ | ✅ | ✅ |
| `lib/supabase/middleware.ts` | ✅ | ✅ | ✅ |
| `lib/actions.ts` | ✅ | ✅ | ✅ |
| `lib/auth.ts` | ✅ | ✅ | ✅ |
| `lib/notifications.ts` | ✅ | ✅ | ✅ |
| `types/database.ts` | ✅ | ✅ | ✅ |
| `types/index.ts` | ✅ | ✅ | ✅ |
| `middleware.ts` (root) | ✅ | ✅ | ✅ |

**結果**: ディレクトリ構成は完全一致 ✅

### 3.2 共通ユーティリティの関数シグネチャ

#### `withAuth()` (`lib/actions.ts`)

| 項目 | 設計書 | 実装 | 判定 |
|---|---|---|---|
| シグネチャ | `withAuth<TInput, TOutput>(handler) => (input) => Promise<ActionResult<TOutput>>` | 一致 | ✅ |
| supabase 型 | `SupabaseClient` | `Awaited<ReturnType<typeof createClient>>` | ℹ 表記差のみ |
| 動作フロー | requireAuth → createClient → handler → ActionResult | 一致 | ✅ |

#### `writeAuditLog()` (`lib/actions.ts`)

| 項目 | 設計書 | 実装 | 判定 |
|---|---|---|---|
| シグネチャ | `writeAuditLog(supabase, userId, input) => Promise<void>` | 一致 | ✅ |
| input 型 | tenantId, action, resourceType, etc. | 一致 | ✅ |
| DB カラムマッピング | before → before, after → after | before → before_data, after → after_data | ⚠ D-10 |

> **D-10**: `writeAuditLog` の実装では `before_data` / `after_data` カラムに INSERT しており、マイグレーションとは一致するが、設計書の audit_logs テーブル定義（`before` / `after`）とは不一致。これは D-01/D-02 と同一の問題。

#### `requireAuth()` / `requireRole()` / `hasRole()` (`lib/auth.ts`)

| 関数 | 設計書シグネチャ | 実装シグネチャ | 判定 |
|---|---|---|---|
| `requireAuth()` | `() => Promise<CurrentUser>` | 一致 | ✅ |
| `requireRole(tenantId, roles)` | `(tenantId, roles) => throws ERR-AUTH-003` | 一致 | ✅ |
| `hasRole(user, tenantId, roles)` | `(user, tenantId, roles) => boolean` | 一致 | ✅ |

#### `CurrentUser` 型

| フィールド | 設計書 | 実装 | 判定 |
|---|---|---|---|
| `id: string` | ✅ | ✅ | ✅ |
| `email: string` | ✅ | ✅ | ✅ |
| `tenantIds: string[]` | ✅ | ✅ | ✅ |
| `roles: { tenantId, role }[]` | ✅ | ✅ | ✅ |

#### `createNotification()` (`lib/notifications.ts`)

| 項目 | 設計書 | 実装 | 判定 |
|---|---|---|---|
| シグネチャ | `(supabase, input) => Promise<void>` | 一致 | ✅ |
| input 型 | tenantId, userId, type, title, body?, resourceType?, resourceId? | 一致 | ✅ |
| 追加関数 | — | `getNotificationLink()` が追加実装あり | ℹ 設計書に未記載 |

#### `getCurrentUser()` (`lib/auth.ts`)

| 項目 | 設計書 | 実装 | 判定 |
|---|---|---|---|
| — | 設計書に未記載 | `getCurrentUser(): Promise<CurrentUser | null>` | ℹ D-11 |

> **D-11**: `getCurrentUser()` 関数が実装に存在するが、モジュール設計書の認証ヘルパー一覧に記載なし。未認証でも null を返す派生関数。設計書への追記推奨。

### 3.3 Server / Client Component 分類

| ファイル | 設計書分類 | 実装 | 判定 |
|---|---|---|---|
| page.tsx 系（全て） | SC | `"use client"` なし = SC | ✅ |
| NotificationBell.tsx | CC | `"use client"` あり | ✅ |
| WorkflowDetailClient.tsx | CC | CC（命名規約一致） | ✅ |
| ProjectDetailClient.tsx | CC | CC | ✅ |
| KanbanBoard.tsx | CC | CC | ✅ |
| WeeklyTimesheetClient.tsx | CC | CC | ✅ |
| ReportClient.tsx | CC | CC | ✅ |
| TenantManagement.tsx | CC | CC | ✅ |
| UserManagement.tsx | CC | CC | ✅ |
| UserDetailPanel.tsx | CC | CC | ✅ |
| InviteModal.tsx | CC | CC | ✅ |
| AuditLogViewer.tsx | CC | CC | ✅ |

**結果**: SC/CC 分類完全一致 ✅

### 3.4 共通定数 (`types/index.ts`)

| 定数 | 設計書 | 実装 | 判定 |
|---|---|---|---|
| `ROLE_LABELS` | `Record<Role, string>` | ✅ 一致 | ✅ |
| `USER_STATUS_LABELS` | `Record<UserStatus, string>` | ✅ 一致 | ✅ |
| `USER_STATUS_COLORS` | `Record<UserStatus, string>` | ✅ 一致 | ✅ |
| `ActionResult<T>` | 型定義記載 | ✅ 一致 | ✅ |
| `TASK_TRANSITIONS` | 記載 | ✅ 一致 | ✅ |
| `PROJECT_TRANSITIONS` | 記載 | ✅ 一致 | ✅ |
| `WORKFLOW_TRANSITIONS` | 記載 | ✅ 一致 | ✅ |

---

## 4. 状態遷移 vs 実装

### 4.1 ワークフロー状態遷移

設計書 (sequences/index.md) の遷移ルール vs `WORKFLOW_TRANSITIONS` 定数:

| 現状態 | 設計書の次状態 | 実装 (`WORKFLOW_TRANSITIONS`) | 判定 |
|---|---|---|---|
| `draft` | `submitted` | `["submitted"]` | ✅ |
| `submitted` | `approved`, `rejected`, `withdrawn` | `["approved", "rejected", "withdrawn"]` | ✅ |
| `approved` | (終端) | `[]` | ✅ |
| `rejected` | `submitted`, `withdrawn` | `["submitted", "withdrawn"]` | ✅ |
| `withdrawn` | (終端) | `[]` | ✅ |

**結果**: 完全一致 ✅

### 4.2 プロジェクト状態遷移

| 現状態 | 設計書の次状態 | 実装 (`PROJECT_TRANSITIONS`) | 判定 |
|---|---|---|---|
| `planning` | `active`, `cancelled` | `["active", "cancelled"]` | ✅ |
| `active` | `completed`, `cancelled` | `["completed", "cancelled"]` | ✅ |
| `completed` | (終端) | `[]` | ✅ |
| `cancelled` | (終端) | `[]` | ✅ |

**結果**: 完全一致 ✅

### 4.3 タスク状態遷移

設計書には明示的なタスク遷移図がないが、`TASK_TRANSITIONS` 定数が存在:

| 現状態 | 実装 | 備考 |
|---|---|---|
| `todo` | `["in_progress"]` | ✅ |
| `in_progress` | `["todo", "done"]` | ✅ `todo` への戻りも許可 |
| `done` | `["in_progress"]` | ✅ 完了→再開も許可 |

> **D-12**: タスク状態遷移は実装にのみ定義されており、sequences 設計書には記載なし。設計書への追記推奨。

---

## 不整合サマリー

| ID | 深刻度 | カテゴリ | 内容 | 推奨対応 |
|---|---|---|---|---|
| D-01 | ⚠ 中 | DB設計 | `audit_logs.before` → 実装は `before_data` | 設計書を `before_data` に修正 |
| D-02 | ⚠ 中 | DB設計 | `audit_logs.after` → 実装は `after_data` | 設計書を `after_data` に修正 |
| D-03 | ⚠ 低 | 型定義 | `tenants.deleted_at` が database.ts に欠落 | `npx supabase gen types` 再実行 |
| D-04 | ℹ 情報 | DB設計 | timesheets.hours の 0.25 刻みチェックが未実装 | アプリ層制御なら設計書に注記追加 |
| D-05 | ⚠ 低 | 型定義 | D-03 と同一（deleted_at 欠落） | — |
| D-06 | ⚠ 中 | RLS設計 | `project_members` のポリシーが設計書に未記載 | 設計書に select/insert/delete ポリシー追記 |
| D-07 | ⚠ 中 | RLS設計 | `tasks` のポリシーが設計書に未記載 | 設計書に select/insert/update ポリシー追記 |
| D-08 | ⚠ 低 | RLS設計 | `timesheets_select` に tenant_admin 条件が未記載 | 設計書に追記 |
| D-09 | ⚠ 低 | RLS設計 | `timesheets_delete` ポリシーが設計書に未記載 | 設計書に追記 |
| D-10 | ⚠ 中 | モジュール | `writeAuditLog` のカラム名が設計書と不一致 | D-01/D-02 修正で解消 |
| D-11 | ℹ 情報 | モジュール | `getCurrentUser()` が設計書に未記載 | 設計書に追記推奨 |
| D-12 | ℹ 情報 | 状態遷移 | タスク状態遷移図が設計書に未記載 | sequences 設計書に追記推奨 |

---

## 総合評価

| 観点 | 評価 | コメント |
|---|---|---|
| DB テーブル定義 | ◎ | 全12テーブル存在、カラム・型は概ね一致 |
| Index / 制約 | ◎ | 全 Index がマイグレーションに存在 |
| トリガー / RPC | ◎ | 完全一致 |
| RLS ポリシー | ○ | 2テーブル（project_members, tasks）のポリシーが設計書に未記載 |
| モジュール構成 | ◎ | ディレクトリ・ファイル完全一致 |
| 関数シグネチャ | ◎ | 実質的に完全一致（型表記の差異のみ） |
| 状態遷移 | ○ | WF/PJ 完全一致、タスク遷移は設計書に未記載 |
| 型定義 | ○ | deleted_at の再生成が必要 |

> **結論**: 致命的な不整合はなし。設計書の記載漏れ（RLS: project_members/tasks, カラム名: before_data/after_data）と型定義の再生成が主な対応事項。実装に影響する問題はない。
