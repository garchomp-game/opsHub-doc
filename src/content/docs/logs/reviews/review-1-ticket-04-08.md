---
title: "コードレビューレポート: TICKET-04 / TICKET-08"
---

# コードレビューレポート: TICKET-04 / TICKET-08

## ビルド検証

```
npm run build → ✅ 成功（TypeScript エラー 0 件）
```

---

## 設計準拠

### ✅ 1. プロジェクト作成時、ステータスが `planning` に固定されているか

[_actions.ts](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/projects/_actions.ts#L79) で `status: "planning"` をハードコード済み。
[新規作成フォーム](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/projects/new/page.tsx) にもステータス選択UIなし。**合格。**

### ✅ 2. プロジェクトの状態遷移が `PROJECT_TRANSITIONS` に従っているか

[_actions.ts L136-141](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/projects/_actions.ts#L133-L141) で `PROJECT_TRANSITIONS` を参照し、許可されていない遷移をブロック。
[ProjectDetailClient.tsx L97](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/projects/[id]/_components/ProjectDetailClient.tsx#L97) のUI側でもボタン表示を遷移先に限定。**合格。**

### ✅ 3. ワークフローの状態遷移が `WORKFLOW_TRANSITIONS` に従っているか

[_actions.ts L200-227](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/workflows/_actions.ts#L200-L227) の `transitionWorkflow` で `WORKFLOW_TRANSITIONS` を参照し、不正遷移をブロック。**合格。**

### ✅ 4. ワークフロー番号（WF-001形式）の自動採番

[_actions.ts L38-49](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/workflows/_actions.ts#L38-L49) の `generateWorkflowNumber` 関数で `WF-XXX` 形式を自動生成。テナントごとの `count + 1` で採番。**合格。**

> [!WARNING]
> **採番の並行安全性に注意**: `count + 1` 方式は、同時に複数申請が作成された場合に番号が重複する可能性あり。本番運用では DB シーケンスまたは `FOR UPDATE` ロックの検討を推奨。現時点では機能要件を満たしているため「合格」とする。

### ⚠️ 5. ワークフローの RLS: 自分の申請 + 承認対象 + Tenant Admin のみ閲覧可能

**DB レベル RLS** は [RLS設計ドキュメント](file:///home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/detail/rls/index.md#L94-L123) で正しく定義。

**アプリ側**: [workflows/page.tsx L38](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/workflows/page.tsx#L38) で `.eq("created_by", user.id)` としており、**自分の申請のみ表示**。承認待ち一覧（`mode=pending`）のタブが未実装。

> [!IMPORTANT]
> API 仕様（API-B01）では `mode=mine` / `mode=pending` の 2 モード切替が定義されていますが、現在の一覧画面は `mode=mine` のみ実装。**承認者が承認待ち一覧を見る手段がない**。TICKET-08 のスコープが「申請側のみ」であれば問題なし。承認機能は別チケットで補完予定か確認が必要。

---

## 共通インフラの使用

### ✅ 6. Server Action は `withAuth()` ラッパーを使用しているか

| Action | `withAuth` 使用 |
|---|---|
| `createProject` | ✅ |
| `updateProject` | ✅ |
| `addMember` | ✅ |
| `removeMember` | ✅ |
| `getTenantUsers` | ✅ |
| `createWorkflow` | ✅ |
| `updateWorkflow` | ✅ |
| `transitionWorkflow` | ✅ |
| `getApprovers` | ✅ |

**全 Server Action が `withAuth()` ラッパーを使用。合格。**

### ✅ 7. データ変更操作で `writeAuditLog()` を呼んでいるか

| Action | 監査ログ |
|---|---|
| `createProject` | ✅ `project.create` |
| `updateProject` | ✅ `project.update` / `project.status_change` |
| `addMember` | ✅ `project.add_member` |
| `removeMember` | ✅ `project.remove_member` |
| `createWorkflow` | ✅ `workflow.create` / `workflow.submit` |
| `updateWorkflow` | ✅ `workflow.update` |
| `transitionWorkflow` | ✅ `workflow.submit` / `workflow.withdraw` |

**全変更操作で `writeAuditLog` を呼出。合格。**

### ✅ 8. 認証チェックに `requireAuth()` を使用しているか

- Server Component（一覧・詳細ページ）: `requireAuth()` を直接呼出
- Server Action: `withAuth()` 内部で `requireAuth()` を呼出
- 権限チェックはアクション内でインラインで実装（`requireRole()` は未使用だが、同等のロジックを手動実装）

> [!NOTE]
> `requireRole()` ヘルパー関数が存在するが、Server Action 内では使用せず同等のインラインチェックを実装。統一性の観点から `requireRole()` の使用を推奨するが、機能的には問題なし。

### ✅ 9. 型定義は `src/types/index.ts` と `src/types/database.ts` を使用しているか

- `ProjectStatus`, `WorkflowStatus`, `PROJECT_TRANSITIONS`, `WORKFLOW_TRANSITIONS` を `@/types` からインポート
- `database.ts` の直接利用はないが、Supabase クライアントが内部で型安全性を提供
- **合格。**

---

## コード品質

### ✅ 10. Server Component と Client Component が適切に分離されているか

| ファイル | 種別 | `"use client"` |
|---|---|---|
| `projects/page.tsx` | Server | なし ✅ |
| `projects/new/page.tsx` | Client | あり ✅ |
| `projects/[id]/page.tsx` | Server | なし ✅ |
| `ProjectDetailClient.tsx` | Client | あり ✅ |
| `projects/_actions.ts` | Server | `"use server"` ✅ |
| `workflows/page.tsx` | Server | なし ✅ |
| `workflows/new/page.tsx` | Client | あり ✅ |
| `workflows/[id]/page.tsx` | Server | なし ✅ |
| `WorkflowDetailClient.tsx` | Client | あり ✅ |
| `workflows/_actions.ts` | Server | `"use server"` ✅ |

**適切に分離。合格。**

### ✅ 11. Ant Design コンポーネントを使用しているか

`Table`, `Form`, `Card`, `Button`, `Tag`, `Space`, `Select`, `Input`, `DatePicker`, `InputNumber`, `Descriptions`, `Tabs`, `Statistic`, `Row`, `Col`, `Popconfirm`, `Modal`, `Alert`, `Divider`, `Typography` を使用。**合格。**

### ✅ 12. エラーハンドリング: `ActionResult<T>` 型でレスポンスを返しているか

`withAuth()` ラッパーが自動的に `ActionResult<T>` でラップ。成功時 `{ success: true, data }`, 失敗時 `{ success: false, error: { code, message } }`。クライアント側でも `result.success` / `result.error.message` で適切にハンドリング。**合格。**

### ⚠️ 13. TypeScript の型安全性: `any` の使用がないか

`any` の直接使用はなし。ただし以下の点を指摘:

- `as unknown as Record<string, unknown>` キャストが4箇所存在（監査ログ記録時）— インフラ側の型制約に起因するため許容範囲
- `as unknown as void` が [projects/new/page.tsx L34](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/projects/new/page.tsx#L34) と [workflows/new/page.tsx L37](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/workflows/new/page.tsx#L37) にあり、`void` 引数の Server Action 呼出しのワークアラウンド
- `Record<string, unknown>` を `onFinish` の引数型として使用 — Ant Design Form の制約により仕方ない面あり

> [!TIP]
> `undefined as unknown as void` の代わりに、`withAuth` の `void` 入力ケースに対応するオーバーロードを定義すると、より型安全になる。

---

## セキュリティ

### ✅ 14. ユーザー入力のバリデーション（Server Action 側）

| Action | バリデーション |
|---|---|
| `createProject` | ✅ name 必須・長さ制限、日付整合性、PM 存在確認 |
| `updateProject` | ✅ name 長さ制限、日付整合性、状態遷移チェック |
| `addMember` | ✅ ユーザー存在確認、重複チェック |
| `removeMember` | ✅ PM 削除禁止 |
| `createWorkflow` | ✅ title 必須・長さ制限、日付整合性、承認者存在確認 |
| `updateWorkflow` | ✅ ステータスチェック（draft/rejected のみ編集可） |
| `transitionWorkflow` | ✅ 遷移先バリデーション、必須項目チェック |

**合格。**

### ✅ 15. tenant_id の検証: 操作対象が自テナントのデータであることを確認

全ての Server Action で `tenant_id = user.tenantIds[0]` を取得し、クエリに `.eq("tenant_id", tenantId)` を付与。Server Component の一覧・詳細クエリでも同様。**合格。**

---

## 総合評価

| カテゴリ | 合格 | 警告 | 不合格 |
|---|---|---|---|
| 設計準拠 (1-5) | 4 | 1 | 0 |
| 共通インフラ (6-9) | 4 | 0 | 0 |
| コード品質 (10-13) | 3 | 1 | 0 |
| セキュリティ (14-15) | 2 | 0 | 0 |
| **合計** | **13** | **2** | **0** |

---

## ⚠️ 軽微な指摘（修正推奨）

### 1. 承認待ち一覧タブの欠如（チェック #5）

API-B01 仕様の `mode=pending` が未実装。承認者が自分宛の申請を確認する手段がない。TICKET-08 のスコープ確認が必要。別チケットで対応すべき。

### 2. WF番号の並行安全性（チェック #4 注記）

`count + 1` 方式は同時実行時に番号重複リスクあり。将来的に DB シーケンス or `ADVISORY LOCK` の採用を推奨。

### 3. `requireRole()` ヘルパーの未使用（チェック #8 注記）

Server Action 内で権限チェックをインラインで実装しているが、`lib/auth.ts` に `requireRole()` ヘルパーが存在する。統一性のため利用を検討。

### 4. `undefined as unknown as void` パターン（チェック #13 注記）

`getTenantUsers` や `getApprovers` のような `void` 入力 Action の呼出しで無理なキャストが発生。`withAuth` のシグネチャ改善を検討。

---

## ❌ 重大な問題

**なし** — 全チェックポイントで機能要件を満たしています。

---

## 修正箇所

ビルドは初回から成功（型エラー 0 件）。**修正なし。**
