---
title: "TICKET-09 ワークフロー承認・差戻し — コードレビューレポート"
---

# TICKET-09 ワークフロー承認・差戻し — コードレビューレポート

## レビュー対象ファイル

| ファイル | 役割 |
|---|---|
| [_actions.ts](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/workflows/_actions.ts) | `approveWorkflow` / `rejectWorkflow` / `getPendingWorkflows` Server Action |
| [pending/page.tsx](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/workflows/pending/page.tsx) | 承認待ち一覧ページ (Server Component) |
| [WorkflowDetailClient.tsx](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/workflows/[id]/_components/WorkflowDetailClient.tsx) | 詳細画面の承認/差戻しUI (Client Component) |
| [[id]/page.tsx](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/workflows/[id]/page.tsx) | 詳細画面 Server Component |

---

## ✅ 合格項目

| # | チェックポイント | 結果 |
|---|---|---|
| 1 | 承認待ち一覧: `approver_id = 自分 AND status = submitted` | ✅ Tenant Admin は全件、それ以外は `approver_id = user.id` でフィルタ |
| 2 | 承認: `submitted → approved` + `approved_at` 記録 | ✅ `approveWorkflow` L306-308 |
| 3 | 差戻し: `submitted → rejected` + `rejection_reason` 必須バリデーション | ✅ `rejectWorkflow` L349-351 + L380-381 |
| 4 | 状態遷移が `WORKFLOW_TRANSITIONS` に準拠 | ✅ 全アクションで `WORKFLOW_TRANSITIONS[currentStatus]` をチェック |
| 5 | 通知: `createNotification()` 使用 | ✅ approve → `workflow_approved`、reject → `workflow_rejected` |
| 7 | Server Action が `withAuth()` ラッパー使用 | ✅ 4アクション全て `withAuth()` |
| 8 | `writeAuditLog()` で監査ログ記録 | ✅ `workflow.approve` / `workflow.reject` |
| 9 | `createNotification()` ヘルパー使用 | ✅ `@/lib/notifications` からインポート |
| 11 | `profiles` テーブル JOIN でユーザー名表示 | ✅ pending一覧/詳細画面の両方で `profileMap` 使用 |
| 12 | Server/Client Component 分離 | ✅ page.tsx = Server、WorkflowDetailClient = Client |
| 13 | `any` の使用なし | ✅ 未使用 |
| 14 | Ant Design コンポーネント使用 | ✅ Table, Card, Tag, Empty, Modal, Input.TextArea, Popconfirm, Descriptions 等 |
| 15 | `ActionResult<T>` でレスポンス | ✅ `withAuth()` が自動ラップ |
| 16 | 承認操作: `approver_id` = 自分のみ | ✅ サーバーサイドで検証 + Tenant Admin 例外 |
| 17 | `tenant_id` の検証あり | ✅ 全クエリに `.eq("tenant_id", tenantId)` |

---

## ❌ 重大な問題（修正済み）

### 1. `pending/page.tsx` にアクセス制御なし

**問題**: 承認待ち一覧ページにロールチェックがなく、`member` ロールでもアクセス可能だった。AP I-B03 仕様では承認/差戻しは **Approver / Tenant Admin** のみ。

**修正**: `hasRole(user, tenantId, ["approver", "tenant_admin"])` ガードを追加。不正アクセス時は `/workflows` へリダイレクト。

render_diffs(file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/workflows/pending/page.tsx)

---

## ⚠️ 軽微な指摘（修正済み）

### 2. インライン `user.roles.some()` が FIX-05 統一に未準拠

**問題**: `approveWorkflow` / `rejectWorkflow` / `getPendingWorkflows` / `pending/page.tsx` でインラインの `user.roles.some(...)` を使用。FIX-05 で全体を `hasRole()` / `requireRole()` に統一済みだが、TICKET-09 の実装が追随していなかった。

**修正**: 4箇所すべてを `hasRole(user, tenantId, ["tenant_admin"])` に置換。

render_diffs(file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/workflows/_actions.ts)

---

## ビルド検証

```
✓ Compiled successfully in 14.2s
✓ TypeScript — 型エラー 0 件
✓ Exit code: 0
```
