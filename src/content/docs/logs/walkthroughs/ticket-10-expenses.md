---
title: "TICKET-10: 経費管理 — Walkthrough"
---

# TICKET-10: 経費管理 — Walkthrough

## 変更内容

3つの新規ファイルを作成:

| ファイル | 種別 | 概要 |
|---|---|---|
| [_actions.ts](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/expenses/_actions.ts) | Server Actions | `createExpense`, `getExpenses`, `getExpenseById`, `getProjects`, `getApprovers` |
| [page.tsx](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/expenses/page.tsx) | 一覧ページ | Server Component, カテゴリフィルタ, ロール別表示 |
| [new/page.tsx](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/expenses/new/page.tsx) | 申請フォーム | Client Component, 下書き/送信, WF自動作成 |

### 主要な設計判断

- **ワークフロー連動**: `createExpense` で `expenses` INSERT 後、`workflows` に `type=expense` レコードを自動作成し `workflow_id` で紐付け
- **ロール別アクセス**: Accounting / Tenant Admin は全件閲覧、一般ユーザーは自分の経費のみ
- **承認者候補**: `approver`, `accounting`, `tenant_admin` ロールを持つユーザーを候補として表示

## ビルド検証

```
✓ Compiled successfully in 12.5s
```

TICKET-10 コードは型エラーなし。唯一の残存エラーは `workflows/[id]/page.tsx` の `isApprover` prop（TICKET-09 関連の既存エラー）。
