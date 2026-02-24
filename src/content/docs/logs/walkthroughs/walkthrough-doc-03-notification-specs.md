---
title: "通知システム仕様書作成ウォークスルー"
---

# 通知システム仕様書作成ウォークスルー

## 概要

実装済みの通知システムを逆引きし、画面仕様書 **SCR-E01** と API仕様書 **API-E01** を作成した。

---

## 参照した実装ファイル

| ファイル | 役割 |
|---|---|
| [notifications.ts](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/lib/notifications.ts) | `createNotification` ヘルパー / `getNotificationLink` リソースURL生成 |
| [notifications.ts (actions)](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/_actions/notifications.ts) | Server Actions: `getNotifications`, `getUnreadCount`, `markAsRead`, `markAllAsRead` |
| [NotificationBell.tsx](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/_components/NotificationBell.tsx) | Client Component: ベルアイコン + Popover UI |
| [layout.tsx](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/layout.tsx) | SSR初期データ取得 + NotificationBell 統合 |

---

## 成果物

### 1. 画面仕様書 SCR-E01

> [SCR-E01.md](file:///home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/screens/SCR-E01.md)

````carousel
### UI構成
- **ベルアイコン**: Ant Design `Badge` + `BellOutlined`（未読バッジ付き）
- **Popover**: 幅360px、`bottomRight` 配置、矢印なし
- **通知リスト**: 最大20件、maxHeight 400px スクロール
- **空状態**: `Empty` コンポーネントで「通知はありません」表示
- **「すべて既読にする」**: 未読 ≥ 1件で表示される `Button type="link"`
<!-- slide -->
### リソース遷移マッピング

| resource_type | 遷移先 |
|---|---|
| `workflow` | `/workflows/{id}` |
| `project` | `/projects/{id}` |
| `task` | `/projects`（PJ一覧） |
| `expense` | `/expenses` |
| null / 未定義 | 遷移なし |
<!-- slide -->
### SSR データ取得パターン

```
layout.tsx (Server Component)
  ├─ requireAuth()
  ├─ Promise.all([getNotifications(), getUnreadCount()])
  └─ <NotificationBell initialCount={...} initialNotifications={...} />
```

- SSR で初期データを取得し props 経由で Client Component へ
- Popover 開閉時に `useTransition` で最新化
- 既読操作は楽観的UI更新
````

---

### 2. API仕様書 API-E01

> [API-E01.md](file:///home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/apis/API-E01.md)

| API ID | 関数 | 種別 | 概要 |
|---|---|---|---|
| E01-LIST | `getNotifications()` | Server Action | 最新20件取得（`created_at DESC`） |
| E01-COUNT | `getUnreadCount()` | Server Action | 未読件数（`head: true` でカウントのみ） |
| E01-READ | `markAsRead(id)` | Server Action | 個別既読（`user_id` 一致チェック） |
| E01-READALL | `markAllAsRead()` | Server Action | 一括既読（`is_read = false` のみ対象） |
| E01-CREATE | `createNotification()` | 共通ヘルパー | 他 Action から呼び出す通知作成関数 |

### 通知タイプ一覧

| type | トリガー | 通知先 |
|---|---|---|
| `workflow_submitted` | 申請送信 | 承認者 |
| `workflow_approved` | 申請承認 | 申請者 |
| `workflow_rejected` | 申請差戻し | 申請者 |
| `task_assigned` | タスクアサイン | 担当者 |
| `project_member_added` | PJメンバー追加 | 追加メンバー |

### エラー設計の特徴

> 通知は補助機能のため、すべて **非致命的（non-fatal）** エラーとして処理。`createNotification` のエラーが本体処理（申請承認等）を阻害しない設計。

---

## フォーマット検証

- 既存ドキュメント（SCR-C02, API-C02, API-B03 等）のフォーマットに準拠
- Frontmatter（YAML）構文を確認済み
- `astro build` はリソース制約で完走せず、静的構文チェックのみ実施

---

## 関連ドキュメント

| ドキュメント | 参照内容 |
|---|---|
| [DD-DB-010](file:///home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/detail/db/index.md#L181-L196) | notifications テーブル定義 |
| [API-B03](file:///home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/apis/API-B03.md) | 申請承認/差戻し（通知の主な発行元） |
| [Public Docs: ダッシュボード](file:///home/garchomp-game/workspace/starlight-test/opsHub-public-docs/src/content/docs/getting-started/dashboard.mdx#L30-L48) | エンドユーザー向け通知説明 |
