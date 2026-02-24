---
title: "テナント削除: 即時物理削除 → 30日間論理削除"
---

# テナント削除: 即時物理削除 → 30日間論理削除

API-A01 仕様（L171-173）に準拠するため、テナント削除を即時物理削除から30日間論理削除に変更した。

## 変更ファイル

### [NEW] [20260224_000001_tenant_soft_delete.sql](file:///home/garchomp-game/workspace/starlight-test/OpsHub/supabase/migrations/20260224_000001_tenant_soft_delete.sql)
- `tenants` テーブルに `deleted_at timestamptz` カラムを追加
- `tenant_select` / `tenant_update` RLS ポリシーに `deleted_at IS NULL` 条件を追加

### [MODIFY] [_actions.ts](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/tenant/_actions.ts)

```diff
-  .delete()
+  .update({ deleted_at: new Date().toISOString() })
```

- 監査ログ action: `tenant.delete` → `tenant.soft_delete`

### [MODIFY] [TenantManagement.tsx](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/tenant/_components/TenantManagement.tsx)
- 危険ゾーンの説明文: 「30日間は復元可能」に変更
- 確認ダイアログ: 「30日後に完全に削除されます」に変更
- 成功メッセージ: 「30日間は復元可能です」を追加

## ビルド検証

`npm run build` を実施。本変更に起因する型エラーは **0件**。

> [!NOTE]
> `audit-logs/page.tsx` に既存の型エラー（`initialData` prop 不一致）あり。本変更とは無関係の既知の問題です。
