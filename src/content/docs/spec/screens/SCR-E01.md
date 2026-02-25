---
title: SPEC-SCR-E01 通知
description: ヘッダーベルアイコンによる通知表示・既読管理・リソース遷移の画面仕様
---

## 目的 / In-Out / Related
- **目的**: 通知の閲覧・既読管理のUI仕様を定める
- **対象範囲（In/Out）**: NotificationBell コンポーネント、Popover一覧、既読操作、リソース遷移
- **Related**: REQ-G01 / [API-E01 通知API](../../spec/apis/api-e01/) / [DD-DB-010 notifications](../../detail/db/) / [ダッシュボード](../../spec/screens/scr-001/)

---

## 画面情報
- **画面ID**: SPEC-SCR-E01
- **画面名**: 通知（NotificationBell）
- **対象ロール**: 全ロール（認証済みユーザー）
- **配置場所**: 認証済みレイアウトのヘッダー右上（全画面共通）
- **状態**: Approved

---

## 主要ユースケース
1. ユーザーが未読通知の有無をベルアイコンのバッジで確認する
2. ベルアイコンをクリックして通知一覧を Popover で閲覧する
3. 通知をクリックして既読にし、対象リソースへ遷移する
4. 「すべて既読にする」ボタンで一括既読にする

---

## ワイヤーフレーム

```
ヘッダー右上
┌──────────────────────────────────────────────────────┐
│                              🔔(3)  👤              │
│                               ↓                      │
│  ┌────────────────────────────────────────────────┐  │
│  │  通知                    [✓ すべて既読にする]  │  │
│  │──────────────────────────────────────────────── │  │
│  │  ● 申請が承認されました                        │  │
│  │    WF-001 経費精算が承認されました  5分前       │  │
│  │──────────────────────────────────────────────── │  │
│  │    新しい申請が届きました                      │  │
│  │    WF-002 出張申請が送信されました  1時間前     │  │
│  │──────────────────────────────────────────────── │  │
│  │  ● タスクにアサインされました                  │  │
│  │    DB設計タスクに割り当てられました  3時間前    │  │
│  │──────────────────────────────────────────────── │  │
│  │  （最大20件表示 / スクロール可能）              │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
  ● = 未読インジケーター（Badge status="processing"）
```

---

## UI構成（概要）

### ベルアイコン（トリガー）

| 要素 | 種別 | 説明 |
|---|---|---|
| BellOutlined | アイコン (Ant Design) | fontSize: 18, cursor: pointer |
| Badge | Ant Design Badge | 未読件数を表示。`count={0}` の場合は非表示 |
| Tooltip | Ant Design Tooltip | ホバー時に「通知」と表示 |

### Popover（通知パネル）

| 要素 | 種別 | 説明 |
|---|---|---|
| ヘッダー | div | 「通知」タイトル（Text strong）+ 「すべて既読にする」ボタン |
| 「すべて既読にする」 | Button (type="link") | 未読が1件以上ある場合のみ表示。CheckOutlined アイコン付き |
| 通知リスト | List (Ant Design) | 最大20件、maxHeight: 400px でスクロール可能 |
| 空状態 | Empty | 通知が0件の場合「通知はありません」を表示 |

- **Popover 幅**: 360px
- **配置**: `placement="bottomRight"`, 矢印なし (`arrow={false}`)
- **トリガー**: `trigger="click"`

### 通知アイテム

| 要素 | 説明 |
|---|---|
| 未読インジケーター | `Badge status="processing"` — 未読の場合のみ表示 |
| タイトル | `Text` — 未読時は `fontWeight: 600`、既読時は `normal` |
| 本文 (body) | `Text type="secondary"` — 存在する場合のみ表示、1行省略 (ellipsis) |
| 日時 | 相対時刻表示（後述のフォーマット参照） |
| 背景色 | 未読: `rgba(22,119,255,0.04)` / 既読: `transparent` |
| ホバー | `rgba(0,0,0,0.04)` |

---

## 日時フォーマット

| 条件 | 表示 |
|---|---|
| 1分未満 | たった今 |
| 1分〜59分 | `{n}分前` |
| 1時間〜23時間 | `{n}時間前` |
| 1日〜6日 | `{n}日前` |
| 7日以上 | `YYYY/MM/DD`（`ja-JP`ロケール） |

---

## 通知タイプ一覧

| type | 概要 | 通知先 |
|---|---|---|
| `workflow_submitted` | 申請が送信された | 承認者 |
| `workflow_approved` | 申請が承認された | 申請者 |
| `workflow_rejected` | 申請が差戻しされた | 申請者 |
| `task_assigned` | タスクにアサインされた | 担当者 |
| `project_member_added` | プロジェクトにメンバー追加 | 追加されたメンバー |

---

## 振る舞い・遷移

### 正常系

#### ベルアイコンクリック → Popover表示
1. Popover が開く
2. バックグラウンドで `getNotifications()` + `getUnreadCount()` を並列呼び出し
3. 取得後、通知リストと未読件数を最新化

#### 通知クリック → 既読 & 遷移
1. 未読の場合、`markAsRead(id)` を呼び出して即座にUI上で既読表示に切替
2. `resource_type` + `resource_id` からリンク先URLを算出
3. リンク先が存在する場合、Popover を閉じてページ遷移

#### 「すべて既読にする」クリック
1. `markAllAsRead()` を呼び出し
2. 未読件数を0にリセット
3. 全通知アイテムの未読インジケーターを非表示に

### リソース遷移ルール（resource_type → URL）

| resource_type | 遷移先URL | 備考 |
|---|---|---|
| `workflow` | `/workflows/{resource_id}` | 申請詳細画面 |
| `project` | `/projects/{resource_id}` | プロジェクト詳細画面 |
| `task` | `/projects` | タスクはPJ配下のためPJ一覧へ |
| `expense` | `/expenses` | 経費一覧画面 |
| `null` / 未定義 | 遷移なし | クリックしても画面遷移しない |

### 異常系
- Server Action のエラー時は `console.error` でログ出力。UIにエラー表示は行わない（楽観的更新）
- 通知取得失敗時は空配列を返し、既存表示を維持

### 権限エラー時
- 認証済みレイアウト内に配置されるため、未認証ユーザーは `requireAuth()` によりログイン画面にリダイレクト

---

## SSR データ取得パターン

```
layout.tsx (Server Component)
  ├── requireAuth()                         ── 認証チェック
  ├── Promise.all([
  │     getNotifications(),                 ── 初期通知一覧（最新20件）
  │     getUnreadCount()                    ── 初期未読件数
  │   ])
  └── <NotificationBell                     ── Client Component
        initialCount={initialUnreadCount}
        initialNotifications={initialNotifications}
      />
```

- **初期表示**: Server Component (`layout.tsx`) で SSR 時にデータを取得し、props 経由で Client Component に渡す
- **Popover 開閉時**: Client Component 内で `useTransition` を使用し、Server Actions を呼び出してデータを再取得
- **楽観的UI更新**: `markAsRead` / `markAllAsRead` は呼び出し直後にローカル state を即座に更新

---

## コンポーネント構成

| コンポーネント | 種別 | ファイル |
|---|---|---|
| `NotificationBell` | Client Component (`"use client"`) | `_components/NotificationBell.tsx` |
| レイアウト統合 | Server Component | `(authenticated)/layout.tsx` |

### 使用ライブラリ
- Ant Design: `Badge`, `Popover`, `List`, `Button`, `Typography`, `Empty`, `Tooltip`, `Space`
- Ant Design Icons: `BellOutlined`, `CheckOutlined`
- React: `useState`, `useTransition`
- Next.js: `useRouter`

---

## エラー/例外
- 通知取得失敗時: 空配列を返却。ユーザーへの明示的エラー表示なし
- 既読更新失敗時: ログ出力のみ。UIは楽観的に更新済みのため不整合の可能性あり（次回 Popover 開閉時に再取得で是正）

---

## 監査ログポイント
- 通知機能自体に監査ログは記録しない
- 通知を生成する元の操作（申請承認・差戻し等）側で監査ログを記録

---

## 関連リンク
- [SPEC-API-E01 通知API](../../spec/apis/api-e01/)
- [DD-DB-010 notifications](../../detail/db/)
- [SPEC-API-B03 申請承認/差戻し](../../spec/apis/api-b03/)
- [公開ドキュメント: ダッシュボード 通知セクション](https://docs.example.com/getting-started/dashboard/)
