---
title: "TICKET-09: ワークフロー承認・差戻し — 完了報告"
---

# TICKET-09: ワークフロー承認・差戻し — 完了報告

## 変更概要

API-B03 仕様に準拠し、承認者がワークフロー申請を承認/差戻しする機能を実装。

## 変更ファイル

| ファイル | 変更内容 |
|---|---|
| [_actions.ts](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/workflows/_actions.ts) | `approveWorkflow`、`rejectWorkflow`、`getPendingWorkflows` を追加 |
| [pending/page.tsx](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/workflows/pending/page.tsx) | **[NEW]** 承認待ち一覧ページ |
| [WorkflowDetailClient.tsx](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/workflows/[id]/_components/WorkflowDetailClient.tsx) | 承認/差戻しボタン追加（Popconfirm + Modal） |
| [workflows/[id]/page.tsx](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/workflows/[id]/page.tsx) | `isApprover` フラグ追加 |
| [layout.tsx](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/layout.tsx) | サイドバーに「承認待ち」リンク追加 |
| [knowledge.md](file:///home/garchomp-game/workspace/starlight-test/OpsHub/docs/knowledge.md) | TICKET-09 ✅ 完了 に更新 |

## 機能詳細

1. **承認** — `submitted → approved`、`approved_at` 記録、申請者に通知
2. **差戻し** — `submitted → rejected`、理由必須（Modal 入力）、`rejection_reason` 記録、申請者に通知
3. **権限** — `approver_id` 一致 or `tenant_admin` ロール
4. **監査ログ** — `workflow.approve` / `workflow.reject` を記録
5. **承認待ち一覧** — Tenant Admin は全件、それ以外は自分宛のみ表示

## 検証結果

```
npm run build → Exit code: 0（型エラーゼロ）
/workflows/pending ルートが正常にビルド出力に表示
```
