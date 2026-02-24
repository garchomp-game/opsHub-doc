---
title: "Walkthrough: roleLabels / statusLabels 重複定義の共通化"
---

# Walkthrough: roleLabels / statusLabels 重複定義の共通化

## 概要

レビュー指摘に基づき、`roleLabels`・`statusLabels`・`statusColors` の重複定義を3つのコンポーネントファイルから削除し、`types/index.ts` に共通定数として集約した。

## 変更内容

### 共通定数の追加

#### [MODIFY] [index.ts](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/types/index.ts)

以下の定数・型を追加:

| エクスポート名 | 型 | 用途 |
|---|---|---|
| `ROLE_LABELS` | `Record<Role, string>` | ロール表示名 |
| `USER_STATUSES` | `const tuple` | ステータス列挙 |
| `UserStatus` | union type | ステータス型 |
| `USER_STATUS_LABELS` | `Record<UserStatus, string>` | ステータス表示名 |
| `USER_STATUS_COLORS` | `Record<UserStatus, string>` | ステータス色 |

render_diffs(file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/types/index.ts)

---

### ローカル定義の削除 → 共通インポートへ置換

#### [MODIFY] [InviteModal.tsx](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/users/_components/InviteModal.tsx)

- ローカル `roleLabels` (8行) を削除 → `ROLE_LABELS` をインポート

#### [MODIFY] [UserDetailPanel.tsx](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/users/_components/UserDetailPanel.tsx)

- ローカル `roleLabels` / `statusColors` / `statusLabels` (20行) を削除 → 共通定義をインポート

#### [MODIFY] [UserManagement.tsx](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/users/_components/UserManagement.tsx)

- ローカル `roleLabels` / `statusColors` / `statusLabels` (20行) を削除 → 共通定義をインポート

## 検証結果

```
✓ Compiled successfully in 13.9s
  Running TypeScript ... (型エラーなし)
```

> [!NOTE]
> ビルド末尾の `middleware-manifest.json` エラーは Next.js 16 の middleware 非推奨化に起因する既存問題であり、本変更とは無関係。
