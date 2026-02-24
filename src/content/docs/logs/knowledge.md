---
title: "OpsHub プロジェクトナレッジ"
---

# OpsHub プロジェクトナレッジ

> 最終更新: 2026-02-24 10:51 JST

## プロジェクト概要

OpsHub = 業務統合SaaS（申請・プロジェクト・工数・経費を一元管理）

## 技術スタック

| 項目 | 技術 |
|---|---|
| フロントエンド | Next.js 16（App Router）+ TypeScript + Ant Design 6 |
| バックエンド | Supabase（Auth + PostgreSQL + RLS + Storage） |
| コンポーネント | Server Components + Client Components 分離 |
| 認証 | Supabase Auth（email/password + invite） |
| テスト | Vitest + jsdom（設定済み、テスト未作成） |
| ローカル環境 | Supabase CLI (`npx supabase start`) — Docker コンテナ11個を自動管理 |

## DB テーブル（12 テーブル）

tenants, user_roles, **profiles**, projects, project_members, tasks, workflows, timesheets, expenses, audit_logs, notifications, workflow_attachments

## 共通パターン

- **Server Action**: `withAuth()` ラッパーで認証 + エラーハンドリング
- **監査ログ**: `writeAuditLog()` で全変更操作を記録
- **認証**: `requireAuth()` / `requireRole()` / `hasRole()` でアクセス制御
- **型**: `ActionResult<T>` で統一レスポンス
- **状態遷移**: `TASK_TRANSITIONS`, `PROJECT_TRANSITIONS`, `WORKFLOW_TRANSITIONS`
- **ユーザー表示名**: `profiles` テーブル JOIN（UUID → display_name）
- **共通定数**: `ROLE_LABELS`, `USER_STATUS_LABELS`, `USER_STATUS_COLORS`（types/index.ts）
- **WF採番**: `next_workflow_number()` RPC（FOR UPDATE ロック）

## チケット進捗

| チケット | 状態 | レビュー |
|---|---|---|
| TICKET-02 テナント管理 | ✅ 完了 | ✅ レビュー済 |
| TICKET-03 ユーザー管理 | ✅ 完了 | ✅ レビュー済 |
| TICKET-04 プロジェクト | ✅ 完了 | ✅ レビュー済 |
| TICKET-05 タスク管理 | ✅ 完了 | ✅ レビュー済 |
| TICKET-06 工数入力 | ✅ 完了 | ✅ レビュー済 |
| TICKET-07 工数レポート | ✅ 完了 | ✅ レビュー済 |
| TICKET-08 WF申請作成 | ✅ 完了 | ✅ レビュー済 |
| TICKET-09 WF承認・差戻し | ✅ 完了 | — |
| TICKET-10 経費管理 | ✅ 完了 | — |
| TICKET-11 通知システム | ✅ 完了 | ✅ レビュー済 |
| TICKET-12 監査ログビューア | ✅ 完了 | ✅ レビュー済 |
| TICKET-01 ダッシュボード | 🔲 未着手 | — |

## 修正チケット進捗

| FIX | 状態 | 内容 |
|---|---|---|
| FIX-01 | ✅ 完了 | テナント論理削除（deleted_at + RLS更新） |
| FIX-02 | ✅ 完了 | ロール変更確認ダイアログ（Popconfirm + RoleDiff） |
| FIX-03 | ✅ 完了 | 監査ログサーバーサイドフィルタ（_actions.ts + useTransition） |
| FIX-04 | ✅ 完了 | WF番号並行安全性（FOR UPDATE + next_workflow_number RPC） |
| FIX-05 | ✅ 完了 | requireRole() 統一（hasRole() 新設 + 14ファイル修正） |
| FIX-06 | ✅ 完了 | roleLabels 重複定義解消（types/index.ts に集約） |
| FIX-07 | ✅ 完了 | profiles テーブル導入（16箇所 UUID→name 修正） |
| RESEARCH-01 | ✅ 完了 | profiles 設計調査（opsHub-doc に保存） |

## マイグレーション一覧

1. `20260223_000001_initial_schema.sql` — 11テーブル + RLS + トリガー
2. `20260224_000001_tenant_soft_delete.sql` — tenants.deleted_at 追加
3. `20260224_000002_workflow_seq.sql` — tenants.workflow_seq + next_workflow_number()
4. `20260224_000002_profiles_table.sql` — profiles テーブル + トリガー + バックフィル
