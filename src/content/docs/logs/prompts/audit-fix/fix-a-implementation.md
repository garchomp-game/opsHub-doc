---
title: "FIX-A: 実装修正3件"
description: "createWorkflow通知、expense action labels、expenses profiles JOIN の修正"
---

あなたは OpsHub の開発者です。監査で検出された実装の不足3件を修正してください。

## 修正1: createWorkflow 送信時の通知

**問題**: `createWorkflow` で `status = "submitted"` の場合に承認者への通知が未実装。`approveWorkflow` / `rejectWorkflow` では通知作成済み。

**対象ファイル**: /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/workflows/_actions.ts

**修正内容**:
- `createWorkflow` 関数内で、`status === "submitted"` の場合に `createNotification` を呼び出す
- 通知タイプ: `workflow_submitted`
- 通知先: `approver_id` で指定された承認者
- タイトル例: `新しい申請が届きました: {workflow.title}`

**参照**: 同ファイル内の `approveWorkflow` での `createNotification` の呼び出しパターンを参考にすること。
- `import { createNotification } from "@/lib/notifications"` が既にある可能性があるが、なければ追加。

## 修正2: AuditLogViewer に expense アクション種別を追加

**問題**: 監査ログビューアのフィルタとラベル表示に `expense.create` / `expense.submit` が未登録。

**対象ファイル**: /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/audit-logs/_components/AuditLogViewer.tsx

**修正内容**:
- `ACTION_LABELS` 定数に以下を追加:
  - `"expense.create": "経費作成"`
  - `"expense.submit": "経費申請"`
- `actionTypes` 配列（Select のフィルタオプション）にも上記2つを追加

**対象ファイル**: /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/audit-logs/_actions.ts

**修正内容**:
- `actionTypes` 配列に `"expense.create"`, `"expense.submit"` を追加（もし Server Action 側にもフィルタ用の定数があれば）

## 修正3: expenses 一覧ページの profiles JOIN

**問題**: `expenses/page.tsx` の直接クエリに profiles JOIN が欠落。Server Action (`getExpenses`) では JOIN 済みだが、ページは直接クエリしている。

**対象ファイル**: /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/expenses/page.tsx

**修正方法（2択）**:
- **案A（推奨）**: 直接クエリを削除し、`_actions.ts` の `getExpenses` Server Action を使うように変更
- **案B**: 直接クエリの `.select()` に `profiles!expenses_created_by_fkey(display_name)` を追加

## 検証

修正後、以下を実行:
```
cd /home/garchomp-game/workspace/starlight-test/OpsHub && npm run build
```
型エラーが 0 件であること。

## 出力

成果物を以下のファイルに保存:
/home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/fix-a-implementation.md

frontmatter を含めること:
---
title: "FIX-A: 実装修正3件"
---
