---
title: "R20-1: AuthenticatedLayout SC/CC 分離"
description: "Ant Design v6 + RSC 互換性修正: Layout の Server/Client Component 分離"
---

あなたは OpsHub のフロントエンド担当です。
`(authenticated)/layout.tsx` が RSC（React Server Component）として antd の Layout コンポーネントを使用しているため、`Sider` が `undefined` になるエラーを修正してください。

## 現状

- `src/app/(authenticated)/layout.tsx` は Server Component（`"use client"` なし）
- antd の `Layout`, `Sider`, `Header`, `Content`, `Menu`, `Dropdown`, `Avatar` を直接使用
- エラー: `Element type is invalid: expected a string... but got: undefined` @ `layout.tsx:115`
- `Sider` が RSC コンテキストで `undefined` になる

## 修正方針

### Step 1: `_components/AppShell.tsx` を `"use client"` 付きで新規作成

antd の Layout コンポーネント（`Layout`, `Sider`, `Header`, `Content`, `Menu`, `Dropdown`, `Avatar`, `Space`, `Typography`）を Client Component に移動。

**Props**:
```ts
type AppShellProps = {
    children: React.ReactNode;
    userEmail: string;
    initialNotificationCount: number;
    initialNotifications: NotificationRow[];
};
```

### Step 2: `layout.tsx` を SC のまま維持

- `requireAuth()` で認証チェック
- `getNotifications()` / `getUnreadCount()` でデータ取得
- `AppShell` にデータを props で渡す

### Step 3: `NotificationBell` と `HeaderSearchBar` は `AppShell` 内で使用

既に `"use client"` なので CC 内からのインポートは問題ない。

## 参照ファイル

- `/home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/layout.tsx`
- `/home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/_components/NotificationBell.tsx`
- `/home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/_components/HeaderSearchBar.tsx`

## 検証

1. `npm run build` が成功する
2. ブラウザで `/` にアクセスし、サイドバー・ヘッダー・ダッシュボードが表示される
3. ログイン → ダッシュボード表示の E2E フローが動作する

## ウォークスルー出力先

/home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/r20-1-layout-sc-cc-split.md
