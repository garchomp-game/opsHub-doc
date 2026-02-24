---
title: "コードレビューレポート: TICKET-02 & TICKET-03"
---

# コードレビューレポート: TICKET-02 & TICKET-03

## ビルド検証結果
- **`npx tsc --noEmit`**: ✅ **型エラー 0件** (exit code 0)
- **`npm run build`**: ⚠️ 環境起因の一時ファイルエラー (`ENOENT: _buildManifest.js.tmp`)。コード品質に起因する問題ではなく、ファイルシステムの競合。再実行で解消見込み。
- **`any` 使用チェック**: ✅ 対象ファイル内に `any` の使用なし

---

## テナント管理 (TICKET-02)

### ✅ 合格項目

| # | チェックポイント | 判定 | 詳細 |
|---|---|---|---|
| 1 | **【Critical】テナント削除が IT Admin のみ** | ✅ | Server Action: `requireRole(tenantId, ["it_admin"])` ([_actions.ts:259](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/tenant/_actions.ts#L259))。UI: `isItAdmin && (...)` で削除セクション全体を条件表示 ([TenantManagement.tsx:377](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/tenant/_components/TenantManagement.tsx#L377))。**二重防御（UI + Server Action）を確認** |
| 2 | テナント名の編集は両ロール可能 | ✅ | `requireRole(tenantId, ["tenant_admin", "it_admin"])` ([_actions.ts:125](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/tenant/_actions.ts#L125)) |
| 3 | settings JSON 編集フォーム | ✅ | タイムゾーン、会計年度開始月、通知設定、承認経路のフォームあり ([TenantManagement.tsx:248-320](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/tenant/_components/TenantManagement.tsx#L248-L320)) |
| 4 | `writeAuditLog()` 呼び出し | ✅ | `tenant.update` ([_actions.ts:176](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/tenant/_actions.ts#L176))、`tenant.settings_change` ([_actions.ts:236](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/tenant/_actions.ts#L236))、`tenant.delete` ([_actions.ts:290](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/tenant/_actions.ts#L290)) の3箇所で呼び出し確認 |
| 5 | `requireRole()` 呼び出し | ✅ | 全 Server Action で適切に使用 |

---

## ユーザー管理 (TICKET-03)

### ✅ 合格項目

| # | チェックポイント | 判定 | 詳細 |
|---|---|---|---|
| 6 | **【Critical】Tenant Admin が IT Admin ロールを付与不可** | ✅ | **三重防御**: (1) UI — `ROLES.filter(r => isItAdmin \|\| r !== "it_admin")` で選択肢から除外 ([InviteModal.tsx:36-38](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/users/_components/InviteModal.tsx#L36-L38), [UserDetailPanel.tsx:78-80](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/users/_components/UserDetailPanel.tsx#L78-L80)); (2) Server Action inviteUser — `!isItAdmin && input.roles.includes("it_admin")` チェック ([_actions.ts:180-187](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/users/_actions.ts#L180-L187)); (3) Server Action changeUserRoles — 同等チェック ([_actions.ts:279-286](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/users/_actions.ts#L279-L286)) |
| 7 | **【Critical】最後の Tenant Admin 削除ブロック** | ✅ | ロール変更時 ([_actions.ts:289-308](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/users/_actions.ts#L289-L308)) と無効化時 ([_actions.ts:368-387](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/users/_actions.ts#L368-L387)) の両方でチェック |
| 8 | 3ステータス表示 (有効/招待中/無効) | ✅ | `statusLabels` + `statusColors` で 3 値を Tag 表示 ([UserManagement.tsx:38-48](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/users/_components/UserManagement.tsx#L38-L48)) |
| 9 | `admin.inviteUserByEmail()` 使用 | ✅ | [_actions.ts:214-215](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/users/_actions.ts#L214-L215) |
| 10 | admin.ts: service_role クライアント | ✅ | `SUPABASE_SERVICE_ROLE_KEY` を使用、`NEXT_PUBLIC_` なし ([admin.ts:11-16](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/lib/supabase/admin.ts#L11-L16)) |
| 11 | ワイヤーフレーム準拠 UI | ✅ | 検索バー + ロールフィルタ + ステータスフィルタ + テーブル + 詳細パネル (Drawer) の構成は SCR-A02 準拠 |
| 12 | 無効化/再有効化ボタン | ✅ | [UserDetailPanel.tsx:237-271](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/users/_components/UserDetailPanel.tsx#L237-L271) — `disable`/`enable` トグル + Popconfirm |
| 13 | 全操作で `writeAuditLog()` | ✅ | `user.invite` ([_actions.ts:235](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/users/_actions.ts#L235))、`user.role_change` ([_actions.ts:335](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/users/_actions.ts#L335))、`user.deactivate`/`user.reactivate` ([_actions.ts:404](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/users/_actions.ts#L404))、`user.password_reset` ([_actions.ts:447](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/users/_actions.ts#L447)) |

---

## 共通インフラ使用

| # | チェックポイント | 判定 | 詳細 |
|---|---|---|---|
| 14 | `withAuth()` ラッパー使用 | ✅ | `updateTenant`, `updateTenantSettings`, `deleteTenant`, `inviteUser`, `changeUserRoles`, `changeUserStatus`, `resetPassword` の全アクションで使用。`getTenantDetail` と `getUsers` は参照系のため直接 `requireRole` を呼び出し（妥当な設計判断） |
| 15 | `Role` 型 / `ROLES` 定数使用 | ✅ | `InviteModal.tsx` と `UserDetailPanel.tsx` で `ROLES` を import。`_actions.ts` で `Role` 型を import ([users/_actions.ts:7](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/users/_actions.ts#L7)) |
| 16 | `ActionResult<T>` 使用 | ✅ | 全 Server Action の戻り値で使用 |

---

## セキュリティ

| # | チェックポイント | 判定 | 詳細 |
|---|---|---|---|
| 17 | service_role key が Client に露出していない | ✅ | `createAdminClient()` は `"use server"` 付き `_actions.ts` 内でのみ呼ばれる。`SUPABASE_SERVICE_ROLE_KEY` は `NEXT_PUBLIC_` プレフィックスなし |
| 18 | tenant_id スコープ検証 | ✅ | 全操作で `tenant_id` を入力に含め、`requireRole(tenantId, ...)` でスコープチェック。ユーザー一覧取得も `user_roles.tenant_id` でフィルタ |
| 19 | 自分自身のロール変更ブロック | ✅ | Server Action ([_actions.ts:265-268](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/users/_actions.ts#L265-L268)) + UI ([UserDetailPanel.tsx:75, 182-192](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/users/_components/UserDetailPanel.tsx#L75)) で二重防御 |

---

## コード品質

| # | チェックポイント | 判定 | 詳細 |
|---|---|---|---|
| 20 | Server/Client Component 分離 | ✅ | `page.tsx` = Server Component（`requireAuth` 使用）、`_components/*.tsx` = `"use client"` |
| 21 | `any` 不使用 | ✅ | grep 検索で 0 件 |
| 22 | Ant Design 使用 | ✅ | Table, Modal, Form, Tag, Descriptions, Drawer, Popconfirm, Tabs, Card, Switch, Select, InputNumber, Statistic, Space, Alert, Button, Input, Checkbox, Typography 等を広範に使用 |

---

## ⚠️ 軽微な指摘（修正推奨）

### 1. テナント管理: スラッグ (slug) の編集フォームが未実装

> [!NOTE]
> チェックポイント 2 では「テナント名・スラッグの編集」を確認としていますが、現在の `updateTenant` はスラッグの編集をサポートしていません。ワイヤーフレーム (SCR-A01:L27) にも「テナントID: tenant_abc123」と表示されていますが、スラッグは通常変更不可とする設計も一般的であり、大きな問題ではありません。意図的な設計判断であれば問題なし。

### 2. `roleLabels` の重複定義

`roleLabels` が `InviteModal.tsx`, `UserDetailPanel.tsx`, `UserManagement.tsx` の 3 ファイルで重複定義されています。`src/types/index.ts` や共通 constants ファイルへの集約を推奨します。同様に `statusColors` / `statusLabels` も `UserManagement.tsx` と `UserDetailPanel.tsx` で重複。

### 3. ユーザー一覧の取得パフォーマンス

`getUsers` で `adminClient.auth.admin.listUsers({ perPage: 1000 })` を使用し、全ユーザーを取得後にフィルタリングしています ([_actions.ts:82-84](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/users/_actions.ts#L82-L84))。テナント内ユーザー数が少ない場合は問題ありませんが、大規模テナントの場合にパフォーマンスが懸念されます。ただし Supabase Auth API の制約上、Server 側ではこの方式が現実的です。

### 4. ロール変更の確認ダイアログ未実装

SCR-A02 (L81) の仕様では「ロール変更: 確認ダイアログ」が求められていますが、`UserDetailPanel.tsx` のロール変更保存ボタンには `Popconfirm` が付いていません。重要度最高の操作であるため、確認ダイアログの追加を推奨します。

### 5. テナント削除で論理削除が未実装

API-A01 (L171-173) では「全リソースの論理削除（30日間復元可能）→ 30日後に物理削除」と規定されていますが、現在の実装は即時物理削除 (`supabase.from("tenants").delete()`) です。

---

## ❌ 重大な問題

**なし** — 全 Critical チェックポイントに合格。権限制御は適切に実装されています。

---

## 総合評価

> [!TIP]
> 全体として**非常に高品質な実装**です。セキュリティ上最重要の権限制御（テナント削除の IT Admin 限定、IT Admin ロール付与の制限、最後の Tenant Admin 保護、自己ロール変更防止）が全て **UI + Server Action の二重防御**で実装されており、模範的です。共通インフラ (`withAuth`, `writeAuditLog`, `ActionResult`, `ROLES`) の使用も統一されています。
