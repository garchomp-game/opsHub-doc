---
title: "TICKET-01: ダッシュボード画面 — Walkthrough"
---

# TICKET-01: ダッシュボード画面 — Walkthrough

## 変更ファイル

| File | Action |
|---|---|
| [dashboard.ts](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/_actions/dashboard.ts) | **NEW** — 6つのデータ取得関数 |
| [page.tsx](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/page.tsx) | **MODIFY** — プレースホルダー → 完全実装 |

## 実装内容

### Server Actions (`dashboard.ts`)

| 関数 | 用途 |
|---|---|
| `getPendingApprovalsCount` | 承認待ち申請数 (`workflows` status=submitted) |
| `getMyWorkflowsCount` | 自分の未完了申請数 |
| `getMyTasksCount` | 自分の未完了タスク数 |
| `getWeeklyHours` | 今週（月〜日）の合計工数 |
| `getProjectProgress` | PM担当PJ毎の進捗率 (done tasks / total tasks) |
| `getUnreadNotifications` | 未読通知5件 |

### Page Component (`page.tsx`)

- **Server Component** — `requireAuth()` + `hasRole()` でロール判定
- **`Promise.all()`** で必要データを並行取得（不要なクエリはスキップ）
- Ant Design `Card`, `Statistic`, `List`, `Progress`, `Button` を使用

**KPIカードのロール別出し分け:**

| カード | 表示ロール |
|---|---|
| 自分の申請 | 全ロール |
| 未処理の申請 | approver / tenant_admin |
| 担当タスク | member / pm |
| 今週の工数 | member / pm |
| プロジェクト進捗 | pm |

## 検証結果

```
$ npm run build
✓ Build completed — Exit code: 0（型エラーなし）
```
