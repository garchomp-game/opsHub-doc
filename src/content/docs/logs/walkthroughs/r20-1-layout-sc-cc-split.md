---
title: "R20-1: AuthenticatedLayout SC/CC 分離"
---

## 概要

antd v6 + RSC 環境で `Layout.Sider` 等が `undefined` になるエラーを、Server/Client Component 分離で修正。

## 変更内容

| ファイル | 変更 | 内容 |
|---------|------|------|
| `_components/AppShell.tsx` | **NEW** | `"use client"` 付き。antd Layout UI（Sider, Header, Content, Menu, Dropdown, Avatar, Space, Typography）と全アイコン、サイドバー定義、ユーザーメニューを集約 |
| `layout.tsx` | **MODIFY** | 183行 → 31行に縮小。`requireAuth()` + データ取得のみ残し、UIを `<AppShell>` に委譲 |

### AppShell Props

```ts
type AppShellProps = {
    children: React.ReactNode;
    userEmail: string;
    initialNotificationCount: number;
    initialNotifications: NotificationRow[];
};
```

### layout.tsx（修正後）

```tsx
// Server Component — "use client" なし
const user = await requireAuth();
const [initialNotifications, initialUnreadCount] = await Promise.all([
    getNotifications(), getUnreadCount(),
]);
return (
    <AppShell
        userEmail={user.email ?? ""}
        initialNotificationCount={initialUnreadCount}
        initialNotifications={initialNotifications}
    >
        {children}
    </AppShell>
);
```

## 検証結果

### ビルド

```
✓ npm run build — exit code 0
  Next.js 16.1.6 (Turbopack)
  全28ルート正常コンパイル
```

### ブラウザ確認

ログイン → ダッシュボード表示の E2E フロー動作確認済み:
- ✅ サイドバー（ナビゲーション項目すべて表示）
- ✅ ヘッダー（検索バー、通知ベル、ユーザーアバター）
- ✅ メインコンテンツエリア（ダッシュボードカード表示）
- ✅ `Element type is invalid` エラー解消

![ダッシュボード表示確認](/home/garchomp-game/.gemini/antigravity/brain/817bd624-651d-47d4-825f-d7bc3a8a4a97/dashboard_after.png)
