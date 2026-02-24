---
title: "Profiles テーブル導入 — Walkthrough"
---

# Profiles テーブル導入 — Walkthrough

## 概要

`auth.users` に RLS で直接アクセスできない制約を解消するため、`public.profiles` テーブルを導入。アプリ全体で UUID 表示されていた箇所をすべてユーザー名表示に変更した。

## 変更内容

### 1. マイグレーション
- [20260224_000002_profiles_table.sql](file:///home/garchomp-game/workspace/starlight-test/OpsHub/supabase/migrations/20260224_000002_profiles_table.sql): `profiles` テーブル、RLS ポリシー、`auth.users` の INSERT/UPDATE トリガー、既存ユーザーのバックフィル

### 2. 型定義
- [database.ts](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/types/database.ts): `profiles` テーブルの Row/Insert/Update 型を手動追加

### 3. Server Actions / データ取得（7ファイル）

| ファイル | 変更内容 |
|---------|---------|
| [workflows/_actions.ts](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/workflows/_actions.ts) | `getApprovers` に profiles JOIN |
| [workflows/[id]/page.tsx](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/workflows/[id]/page.tsx) | 承認者・申請者の display_name 取得 |
| [projects/_actions.ts](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/projects/_actions.ts) | `getTenantUsers` に profiles JOIN |
| [projects/[id]/page.tsx](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/projects/[id]/page.tsx) | メンバー・テナントユーザー・PM の名前取得 |
| [projects/[id]/tasks/page.tsx](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/projects/[id]/tasks/page.tsx) | メンバーに profiles JOIN |
| [audit-logs/_actions.ts](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/audit-logs/_actions.ts) | `FilterOptions.userIds` を名前付きオブジェクトに変更 |
| [reports/_actions.ts](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/timesheets/reports/_actions.ts) | `MemberSummary` に `display_name` 追加、`getFilterMembers` に profiles JOIN |

### 4. UI コンポーネント（7ファイル）

| ファイル | 変更内容 |
|---------|---------|
| [WorkflowDetailClient.tsx](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/workflows/[id]/_components/WorkflowDetailClient.tsx) | 承認者リスト・承認者/申請者の名前表示 |
| [workflows/new/page.tsx](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/workflows/new/page.tsx) | 承認者セレクト名前表示 |
| [KanbanBoard.tsx](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/projects/[id]/tasks/_components/KanbanBoard.tsx) | 担当者タグ・セレクト名前表示 |
| [ProjectDetailClient.tsx](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/projects/[id]/_components/ProjectDetailClient.tsx) | PM・メンバーテーブル・追加セレクト名前表示 |
| [projects/new/page.tsx](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/projects/new/page.tsx) | PM セレクト名前表示 |
| [AuditLogViewer.tsx](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/audit-logs/_components/AuditLogViewer.tsx) | 操作者列・フィルタに名前表示 |
| [ReportClient.tsx](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/timesheets/reports/_components/ReportClient.tsx) | メンバーテーブル・セレクト名前表示 |

### 5. API
- [route.ts](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/api/timesheets/export/route.ts): CSV エクスポートの「メンバー名」列を profiles から取得

### 6. Reports page
- [reports/page.tsx](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/timesheets/reports/page.tsx): メンバー取得に profiles JOIN

## 検証結果

- `npm run build` ✅ — TypeScript コンパイルエラー 0 件
- 全 17 ページが正常にビルド完了
