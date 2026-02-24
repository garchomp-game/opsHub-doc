---
title: "ロール変更確認ダイアログの追加 — Walkthrough"
---

# ロール変更確認ダイアログの追加 — Walkthrough

## 変更内容

SCR-A02 仕様 L81 に適合するため、[UserDetailPanel.tsx](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/users/_components/UserDetailPanel.tsx) に以下の変更を加えた。

### 1. `RoleDiffDescription` ヘルパーコンポーネント追加

変更前後のロールを比較し、追加ロールを緑タグ、削除ロールを赤タグで表示する。

### 2. 保存ボタンを `Popconfirm` でラップ

- **title**: `{ユーザー名} のロールを変更しますか？この操作は監査ログに記録されます。`
- **description**: `RoleDiffDescription`（ロール差分表示）
- **okText**: `変更する` / **cancelText**: `キャンセル`
- ボタンの `onClick` → `Popconfirm` の `onConfirm` に移行

render_diffs(file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/users/_components/UserDetailPanel.tsx)

## 検証

`npm run build` — 型エラーなし、exit code 0 ✅
