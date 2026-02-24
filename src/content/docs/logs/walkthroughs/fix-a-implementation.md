---
title: "FIX-A: 実装修正3件"
---

## 概要

監査で検出された実装の不足3件を修正した。

## 修正1: createWorkflow 送信時の通知

**対象**: `workflows/_actions.ts`

`createWorkflow` で `status = "submitted"` の場合に、承認者への通知が未実装だった。
`approveWorkflow` / `rejectWorkflow` のパターンに倣い、`createNotification` を追加。

```diff
     await writeAuditLog(supabase, user.id, { ... });

+    // submitted の場合、承認者に通知
+    if (status === "submitted") {
+        await createNotification(supabase, {
+            tenantId,
+            userId: input.approver_id,
+            type: "workflow_submitted",
+            title: `新しい申請が届きました: ${input.title}`,
+            body: `「${input.title}」が申請されました`,
+            resourceType: "workflow",
+            resourceId: data.id,
+        });
+    }
+
     revalidatePath("/workflows");
```

- `createNotification` は既にインポート済み（L8）
- 通知タイプ `workflow_submitted` は新規だが、`createNotification` のインターフェースは `type: string` のため型エラーなし

## 修正2: AuditLogViewer に expense アクション種別を追加

**対象**: `audit-logs/_components/AuditLogViewer.tsx`, `audit-logs/_actions.ts`

### AuditLogViewer.tsx — ACTION_LABELS

```diff
     "timesheet.delete": { label: "工数削除", color: "red" },
+    "expense.create": { label: "経費作成", color: "blue" },
+    "expense.submit": { label: "経費申請", color: "cyan" },
 };
```

### _actions.ts — actionTypes 配列

```diff
         "timesheet.delete",
+        "expense.create",
+        "expense.submit",
     ];
```

これにより、監査ログビューアのフィルタドロップダウンとテーブルの Tag 表示に経費アクションが反映される。

## 修正3: expenses 一覧ページの profiles JOIN

**対象**: `expenses/page.tsx`

ページの直接クエリに `profiles!expenses_created_by_fkey(display_name)` JOIN が欠落していた。
`_actions.ts` の `getExpenses` Server Action では正しく JOIN 済み。

```diff
     .select(`
         *,
         projects ( id, name ),
-        workflows ( id, status, workflow_number )
+        workflows ( id, status, workflow_number ),
+        profiles!expenses_created_by_fkey ( display_name )
     `, { count: "exact" })
```

案B（直接クエリに JOIN を追加）を採用。これにより「申請者」列が正しく表示名を表示するようになった。

## 検証結果

```
npm run build
✓ Compiled successfully in 19.8s
✓ Finished TypeScript in 10.3s
Exit code: 0
```

型エラー: **0 件**
