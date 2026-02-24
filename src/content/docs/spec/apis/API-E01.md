---
title: SPEC-API-E01 通知API
description: 通知の取得・既読管理・作成ヘルパーの Server Action 仕様
---

## 目的 / In-Out / Related
- **目的**: 通知機能の Server Actions および共通ヘルパーの仕様を定める
- **対象範囲（In/Out）**: 通知一覧取得、未読件数取得、既読更新、通知作成ヘルパー
- **Related**: [SCR-E01 通知](../../spec/screens/scr-e01/) / [DD-DB-010 notifications](../../detail/db/) / [API-B03 申請承認/差戻し](../../spec/apis/api-b03/)

---

## 一覧取得（Server Action）

### API情報
- **API ID**: SPEC-API-E01-LIST
- **用途**: 通知 Popover の通知一覧表示
- **種別**: Server Action
- **認可**: ログイン必須。RLS で `user_id = auth.uid()` 制御

### 関数シグネチャ

```typescript
export async function getNotifications(): Promise<NotificationRow[]>
```

### Request
- パラメータなし（認証ユーザーの通知を自動取得）

### 処理フロー
1. `requireAuth()` で認証チェック
2. `notifications` テーブルから `user_id = auth.uid()` で検索
3. `created_at DESC` でソート
4. `limit(20)` で最新20件に制限
5. エラー時は `console.error` で記録し空配列を返却

### Response

- 成功: `NotificationRow[]`

```typescript
type NotificationRow = {
  id: string;              // UUID
  tenant_id: string;       // UUID
  user_id: string;         // UUID
  type: string;            // 通知種別
  title: string;           // 通知タイトル
  body: string | null;     // 通知本文
  resource_type: string | null;  // リンク先リソース種別
  resource_id: string | null;    // リンク先リソースID
  is_read: boolean;        // 既読フラグ
  created_at: string;      // ISO8601
};
```

- エラー: `[]`（空配列）

---

## 未読件数取得（Server Action）

### API情報
- **API ID**: SPEC-API-E01-COUNT
- **用途**: ベルアイコンの Badge 表示用
- **種別**: Server Action
- **認可**: ログイン必須。RLS で制御

### 関数シグネチャ

```typescript
export async function getUnreadCount(): Promise<number>
```

### Request
- パラメータなし

### 処理フロー
1. `requireAuth()` で認証チェック
2. `notifications` テーブルから `user_id = auth.uid()` かつ `is_read = false` でカウント
3. `select("*", { count: "exact", head: true })` を使用（データ本体は取得しない）
4. エラー時は `0` を返却

### Response
- 成功: `number`（未読件数）
- エラー: `0`

---

## 個別既読（Server Action）

### API情報
- **API ID**: SPEC-API-E01-READ
- **用途**: 通知クリック時に個別の通知を既読にする
- **種別**: Server Action
- **認可**: ログイン必須。`user_id` 一致チェックで自分の通知のみ更新可

### 関数シグネチャ

```typescript
export async function markAsRead(notificationId: string): Promise<void>
```

### Request

| パラメータ | 型 | 必須 | 説明 |
|---|---|---|---|
| `notificationId` | `string` (UUID) | ✅ | 対象通知のID |

### 処理フロー
1. `requireAuth()` で認証チェック
2. `notifications` テーブルの `is_read` を `true` に更新
3. 条件: `id = notificationId` AND `user_id = auth.uid()`（他ユーザーの通知は更新不可）

### Response
- `void`（戻り値なし）

### RLS制御
- `user_id = auth.uid()` のレコードのみ UPDATE 可能

---

## 一括既読（Server Action）

### API情報
- **API ID**: SPEC-API-E01-READALL
- **用途**: 「すべて既読にする」ボタンの処理
- **種別**: Server Action
- **認可**: ログイン必須。自分の未読通知のみ対象

### 関数シグネチャ

```typescript
export async function markAllAsRead(): Promise<void>
```

### Request
- パラメータなし

### 処理フロー
1. `requireAuth()` で認証チェック
2. `notifications` テーブルの `is_read` を `true` に一括更新
3. 条件: `user_id = auth.uid()` AND `is_read = false`

### Response
- `void`（戻り値なし）

---

## 通知作成ヘルパー（共通関数）

### API情報
- **API ID**: SPEC-API-E01-CREATE
- **用途**: 他機能の Server Action から通知を作成するための共通ヘルパー
- **種別**: 共通ヘルパー関数（`src/lib/notifications.ts`）
- **認可**: 呼び出し元の Server Action で認可済みの前提

### 関数シグネチャ

```typescript
export async function createNotification(
  supabase: SupabaseClient,
  input: CreateNotificationInput
): Promise<void>
```

### Request（CreateNotificationInput）

| パラメータ | 型 | 必須 | 説明 |
|---|---|---|---|
| `tenantId` | `string` (UUID) | ✅ | テナントID |
| `userId` | `string` (UUID) | ✅ | 通知先ユーザーID |
| `type` | `string` | ✅ | 通知種別（下記一覧参照） |
| `title` | `string` | ✅ | 通知タイトル |
| `body` | `string` | — | 通知本文（省略時 `null`） |
| `resourceType` | `string` | — | リンク先リソース種別（省略時 `null`） |
| `resourceId` | `string` | — | リンク先リソースID（省略時 `null`） |

### 処理フロー
1. `notifications` テーブルに INSERT
2. エラー時は `console.error` でログ出力（例外はスローしない）

### 使用例

```typescript
await createNotification(supabase, {
  tenantId: user.tenantIds[0],
  userId: approverId,
  type: "workflow_submitted",
  title: "新しい申請が届きました",
  body: `${workflow.title} が送信されました`,
  resourceType: "workflow",
  resourceId: workflow.id,
});
```

### 呼び出し元

| 呼び出し元 Action | type | 用途 |
|---|---|---|
| 申請送信 (API-B02) | `workflow_submitted` | 承認者に申請到着を通知 |
| 申請承認 (API-B03) | `workflow_approved` | 申請者に承認結果を通知 |
| 申請差戻し (API-B03) | `workflow_rejected` | 申請者に差戻し結果を通知 |
| タスクアサイン (API-C02) | `task_assigned` | 担当者にアサインを通知 |
| PJメンバー追加 (API-C01) | `project_member_added` | メンバーに追加を通知 |

---

## 通知タイプ一覧

| type | タイトル例 | body例 | resource_type | 通知先 |
|---|---|---|---|---|
| `workflow_submitted` | 新しい申請が届きました | `{title} が送信されました` | `workflow` | 承認者 |
| `workflow_approved` | 申請が承認されました | `{title} が承認されました` | `workflow` | 申請者 |
| `workflow_rejected` | 申請が差戻しされました | `{title} が差戻しされました` | `workflow` | 申請者 |
| `task_assigned` | タスクにアサインされました | `{title} に割り当てられました` | `task` | 担当者 |
| `project_member_added` | プロジェクトに追加されました | `{name} に追加されました` | `project` | 追加メンバー |

---

## リソースリンク生成（共通関数）

### 関数シグネチャ

```typescript
export function getNotificationLink(
  resourceType: string | null,
  resourceId: string | null
): string | null
```

### マッピングルール

| resource_type | 生成URL | 備考 |
|---|---|---|
| `workflow` | `/workflows/{resourceId}` | 申請詳細 |
| `project` | `/projects/{resourceId}` | PJ詳細 |
| `task` | `/projects` | タスクはPJ配下のためPJ一覧へ |
| `expense` | `/expenses` | 経費一覧 |
| `null` / 未定義 | `null`（遷移なし） | — |

---

## エラー設計

| 関数 | エラー時の挙動 | ユーザー通知 |
|---|---|---|
| `getNotifications` | `console.error` → 空配列返却 | なし（空一覧表示） |
| `getUnreadCount` | `console.error` → `0` 返却 | なし（バッジ非表示） |
| `markAsRead` | RLS で他ユーザー更新を防止 | なし |
| `markAllAsRead` | RLS で他ユーザー更新を防止 | なし |
| `createNotification` | `console.error`（例外スローなし） | なし（呼び出し元処理に影響しない） |

> **設計意図**: 通知は補助機能であるため、通知のエラーが本体処理（申請承認等）を阻害しないよう、すべて非致命的（non-fatal）エラーとして処理する。

---

## 監査ログポイント
- 通知 API 自体は監査ログを記録しない
- 通知を生成するトリガーとなる操作（`workflow.approve`, `workflow.reject` 等）側で記録

---

## RLS ポリシー（DD-DB-010 準拠）

| 操作 | ポリシー |
|---|---|
| SELECT | `user_id = auth.uid()` AND `tenant_id IN (ユーザーのテナント)` |
| INSERT | `tenant_id IN (ユーザーのテナント)` |
| UPDATE | `user_id = auth.uid()`（`is_read` の更新のみ想定） |
| DELETE | 不可 |

---

## Related
- [SPEC-SCR-E01 通知](../../spec/screens/scr-e01/)
- [DD-DB-010 notifications](../../detail/db/)
- [SPEC-API-B03 申請承認/差戻し](../../spec/apis/api-b03/)
