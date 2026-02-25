---
title: "R20-4: ダッシュボード表示・RLS 検証"
---

# R20-4: ダッシュボード表示・RLS 検証

| 項目 | 内容 |
|---|---|
| 実施日 | 2026-02-25 |
| 担当 | QA（AI） |
| 対象 | `(authenticated)/page.tsx`, `layout.tsx`, `auth.ts` |

## 1. 検証中に発見・修正した不具合

### 不具合 1: RSC で antd コンポーネントが undefined

| 項目 | 内容 |
|---|---|
| 症状 | `/` にアクセスすると `Element type is invalid: expected a string ... but got: undefined` |
| 原因 | `layout.tsx` と `page.tsx` が React Server Component のまま antd コンポーネント（`Layout.Sider`, `Typography.Title` 等）を直接使用 |
| 修正 | SC/CC 分離を実施 |

**修正ファイル:**

- `layout.tsx` → SC として `AppShell`（既存 CC）に委譲
- `page.tsx` → SC としてデータ取得のみ行い、新規 `DashboardContent.tsx`（CC）に委譲

```diff
 // layout.tsx (Before)
-import { Layout, Menu, Typography, Avatar, Dropdown, Space } from "antd";
-// ... antd を直接レンダリング
+import AppShell from "./_components/AppShell";
+// ... AppShell にpropsを渡すのみ
```

### 不具合 2: user_roles が全ユーザー分返される（RLS / フィルタ漏れ）

| 項目 | 内容 |
|---|---|
| 症状 | 全ロールの KPI カードが全ユーザーに表示される（PM に「未処理の申請」カードが出る等） |
| 原因 | `auth.ts` の `requireAuth()` / `getCurrentUser()` で `.eq("user_id", user.id)` が欠落 |
| 修正 | 両関数に `user_id` フィルタを追加 |

```diff
 // auth.ts
  const { data: userRoles } = await supabase
      .from("user_roles")
-     .select("tenant_id, role");
+     .select("tenant_id, role")
+     .eq("user_id", user.id);
```

### 追加改善: 管理メニューのロール制御

`AppShell.tsx` に `isTenantAdmin` prop を追加し、`tenant_admin` 以外のロールでは「管理」サイドバーメニューを非表示にした。

## 2. ロール別ダッシュボード検証結果

### Tenant Admin (`admin@test-corp.example.com`)

| 検証項目 | 結果 | 備考 |
|---|---|---|
| サイドバー | ✅ | ダッシュボード〜管理まで全メニュー表示 |
| ヘッダー | ✅ | 検索バー、通知ベル、ユーザーアバター |
| 自分の申請 | ✅ 0件 | admin はワークフロー未作成 |
| 未処理の申請 | ✅ 0件 | approver_id が admin でない |
| 担当タスク | ✅ 0件 | tenant_admin ロールで表示 |
| 今週の工数 | ✅ 0.0h | admin は工数未入力 |
| 未読通知 | ✅ Empty | admin 向け通知なし |
| クイックアクション | ✅ | 新規申請・工数入力・プロジェクト一覧 |

### PM (`pm@test-corp.example.com`)

| 検証項目 | 結果 | 備考 |
|---|---|---|
| サイドバー | ✅ | 「管理」メニュー非表示 |
| 自分の申請 | ✅ 0件 | PM の draft/submitted ワークフローなし |
| 担当タスク | ✅ 0件 | PM に assignee_id が設定されたタスクなし |
| 今週の工数 | ✅ 10.5h | 2/24: 2.0+3.0=5.0, 2/25: 1.5+4.0=5.5 → 合計 10.5h |
| プロジェクト進捗 | ✅ | EC サイト 20%（1/5 done）, 社内ポータル 0%（0/1 done） |
| 未読通知 | ✅ Empty | PM 向け通知は既読（`is_read=true`） |

### Member (`member@test-corp.example.com`)

| 検証項目 | 結果 | 備考 |
|---|---|---|
| サイドバー | ✅ | 「管理」メニュー非表示 |
| 自分の申請 | ✅ 2件 | WF-003(submitted) + WF-005(draft) |
| 担当タスク | ✅ 5件 | 8タスク中 assignee が member で status≠done → 5件 |
| 今週の工数 | ✅ 18.5h | 2/24: 6.0+2.0=8.0, 2/25: 7.5+3.0=10.5 → 合計 18.5h |
| プロジェクト進捗 | ✅ 非表示 | member ロールには表示しない |
| 未読通知 | ✅ 2件 | 「ワークフロー差戻し」「タスク割当」 |
| 通知ベル | ✅ バッジ 2 | ヘッダーの通知ベルにも未読 2 が表示 |

### Approver (`approver@test-corp.example.com`) — 未検証

ブラウザサブエージェントのタイムアウトにより完了できず。
コードレビューベースの期待値:

- KPI カード: 自分の申請 0件 + 未処理の申請 1件（WF-003）
- 未読通知: 1件（「承認依頼」）
- プロジェクト進捗: 非表示

### Accounting (`accounting@test-corp.example.com`) — 未検証

コードレビューベースの期待値:

- KPI カード: 自分の申請 0件のみ
- 未読通知: 1件（「請求書作成」）
- プロジェクト進捗 / 担当タスク / 今週の工数: 非表示

## 3. RLS データ整合性確認

| データ種別 | 確認結果 | 備考 |
|---|---|---|
| ワークフロー数 | ✅ | Member 2件（draft+submitted）、他ロールは 0件 |
| タスク数 | ✅ | Member 5件（in_progress×2, todo×3） |
| 工数合計 | ✅ | Member 18.5h、PM 10.5h（今週分のみ集計） |
| プロジェクト進捗 | ✅ | PM のみ表示、active/planning のみ対象 |
| 通知 | ✅ | `is_read=false` のみ表示、Empty 状態も正常動作 |

## 4. 変更ファイル一覧

| ファイル | 変更内容 |
|---|---|
| `src/lib/auth.ts` | `user_roles` クエリに `.eq("user_id", user.id)` 追加 |
| `src/app/(authenticated)/layout.tsx` | SC として `AppShell` に委譲する形に書き換え、`isTenantAdmin` を算出して渡す |
| `src/app/(authenticated)/page.tsx` | SC として `DashboardContent` に委譲する形に書き換え |
| `src/app/(authenticated)/_components/DashboardContent.tsx` | **[NEW]** ダッシュボード UI の CC |
| `src/app/(authenticated)/_components/AppShell.tsx` | `isTenantAdmin` prop 追加、管理メニューの条件分岐 |

## 5. 今後の改善提案

- **Playwright E2E テスト化**: 本検証の内容は Playwright `test.each` でパラメータ化可能。ロール切り替え → KPI カード表示チェック → スクリーンショット取得を自動化すれば、リグレッション検知に有効。
- **Approver / Accounting の再検証**: ブラウザ操作のタイムアウトで未完了のため、手動または E2E テストで補完が必要。
