---
title: "コードレビューレポート — TICKET-11 / TICKET-12"
---

# コードレビューレポート — TICKET-11 / TICKET-12

## ビルド検証結果

| 検証 | 結果 |
|---|---|
| `npx tsc --noEmit` | ✅ 型エラー 0 件 |
| `npm run build` | ✅ 成功（全16ルート生成） |
| `layout.tsx` ビルド | ✅ NotificationBell のインポート整合 |

---

## TICKET-11: 通知システム

### ✅ 合格項目

| # | チェックポイント | 判定 | 備考 |
|---|---|---|---|
| 1 | `createNotification()` が `src/lib/notifications.ts` に存在し共通ヘルパーとして呼び出せる | ✅ | Supabase クライアント + `CreateNotificationInput` を受け取る汎用設計。JSDoc に使用例あり |
| 2 | 引数: tenantId, userId, type, title, body, resourceType, resourceId を受け取る | ✅ | `body`, `resourceType`, `resourceId` は Optional で DB 設計と一致 |
| 3 | NotificationBell: 未読件数バッジが表示される | ✅ | Ant Design の `Badge` + `count` で実装。`initialCount` を SSR で取得 |
| 4 | 「すべて既読にする」機能 | ✅ | `handleMarkAllAsRead()` → `markAllAsRead()` Server Action。未読 > 0 の時のみボタン表示 |
| 5 | 通知クリック時に `resource_type` / `resource_id` に基づくリンク生成 | ✅ | `getNotificationLink()` で `workflow`, `project`, `task`, `expense` に対応 |
| 6 | `layout.tsx` への統合 | ✅ | SSR で `getNotifications()` / `getUnreadCount()` を取得し `NotificationBell` に props 渡し |
| 13-a | 型定義: `Tables<"notifications">` 使用 | ✅ | [notifications.ts (actions)](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/_actions/notifications.ts#L9) で `NotificationRow = Tables<"notifications">` |
| 14-a | Server/Client 分離 | ✅ | Server Action: `_actions/notifications.ts`（`"use server"`）、Client: `NotificationBell.tsx`（`"use client"`） |
| 15-a | `any` の使用なし | ✅ | 全ファイルで `any` 不使用 |
| 16-a | Ant Design コンポーネント使用 | ✅ | `Badge`, `Popover`, `List`, `Button`, `Typography`, `Empty`, `Tooltip`, `Space` |

### ⚠️ 軽微な指摘

| # | 指摘 | 詳細 | 影響度 |
|---|---|---|---|
| W-1 | Server Action に `withAuth()` ラッパー未使用 | [notifications.ts (actions)](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/_actions/notifications.ts) は `requireAuth()` を直接呼び出している。他の Server Action（projects, workflows, timesheets 等）は `withAuth()` ラッパーで統一されている。ただし通知の読み取り・既読更新は「自分のデータに対する操作」であり、RLS（`user_id = auth.uid()`）でも保護されるため**セキュリティ上の問題はない**。統一性の観点での指摘。 | 低 |
| W-2 | `createNotification()` のエラーハンドリングが `console.error` のみ | [notifications.ts (lib) L46-48](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/lib/notifications.ts#L46-L48): エラーを握りつぶしている。呼び出し元での通知作成失敗はメイン処理に影響させない設計意図と思われるが、将来的にはエラー監視（Sentry 等）への連携が望ましい。 | 低 |
| W-3 | `getNotificationLink()` が `lib/notifications.ts` にあるが Client Component からも呼ばれている | この関数自体は純粋関数（DB/サーバーAPI 依存なし）なので問題ないが、`lib/notifications.ts` 内の `createNotification()` は Server 専用。同一ファイルにサーバー/共通ロジックが混在している。バンドルサイズには Tree-shaking で影響しないため実害はないが、留意事項。 | 低 |

---

## TICKET-12: 監査ログビューア

### ✅ 合格項目

| # | チェックポイント | 判定 | 備考 |
|---|---|---|---|
| 7 | IT Admin / Tenant Admin のみアクセス可能 | ✅ | [page.tsx L9-10](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/audit-logs/page.tsx#L9-L10): `user.roles.some(r => r.role === "it_admin" \|\| r.role === "tenant_admin")` で検証。RLS でも同等のポリシーあり |
| 8 | 時系列降順で表示 | ✅ | [page.tsx L38](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/audit-logs/page.tsx#L38): `.order("created_at", { ascending: false })` |
| 9 | フィルタ: 期間、ユーザー、アクション種別、リソース種別 | ✅ | [AuditLogViewer.tsx L345-435](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/audit-logs/_components/AuditLogViewer.tsx#L345-L435): `RangePicker` + 3つの `Select` で実装 |
| 10 | before_data / after_data の JSON 内容確認 | ✅ | [AuditLogViewer.tsx L75-194](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/audit-logs/_components/AuditLogViewer.tsx#L75-L194): `JsonDiff` コンポーネントで変更前/変更後を差分表示。`expandedRowRender` で詳細展開 |
| 11 | 読み取り専用（INSERT/UPDATE/DELETE UI なし） | ✅ | 表示・フィルタのみ。編集・削除ボタン一切なし |
| 13-b | 型定義: `Tables<"audit_logs">` 使用 | ✅ | [AuditLogViewer.tsx L25](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/audit-logs/_components/AuditLogViewer.tsx#L25): `type AuditLogRow = Tables<"audit_logs">` |
| 14-b | Server/Client 分離 | ✅ | Server: `page.tsx`（data fetch + アクセス制御）、Client: `AuditLogViewer.tsx`（`"use client"` 表示・フィルタ） |
| 15-b | `any` の使用なし | ✅ | JSON 型は `Json`（`database.ts` の型）を使用 |
| 16-b | Ant Design コンポーネント使用 | ✅ | `Table`, `Card`, `Select`, `DatePicker`, `Tag`, `Typography`, `Row`, `Col`, `Button` |

### ⚠️ 軽微な指摘

| # | 指摘 | 詳細 | 影響度 |
|---|---|---|---|
| W-4 | アクセス制御が `requireRole()` ではなくインラインの `roles.some()` で実装 | [page.tsx L9-20](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/audit-logs/page.tsx#L9-L20): 他の管理画面（tenant, users）は `requireRole()` を使用している。機能上は同等だが、`requireRole()` はエラーを throw する一方、こちらは UI でエラーメッセージを表示する方式。Server Component の Page レベルでは UI 表示の方がユーザー体験として適切な場合もある。統一性のみの観点。 | 低 |
| W-5 | 最新100件の固定取得 | [page.tsx L39](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/audit-logs/page.tsx#L39): `.limit(100)` で固定。データ量が増えた場合にサーバーサイドページネーションが望ましい。初期リリースでは許容範囲だが、将来的な課題として記録。 | 低 |
| W-6 | フィルタがクライアントサイドのみ | 100件のデータをクライアントでフィルタしているため、100件を超えるデータは取得されない。期間フィルタを100件以上前に設定すると結果が空になる可能性がある。W-5 と関連する包括的な改善が必要。 | 中 |

---

## ❌ 重大な問題

**なし** — セキュリティ上の問題、型エラー、DB スキーマとの不整合はいずれも検出されませんでした。

---

## 修正対応

今回のレビューでは **修正が必要な重大な問題は検出されなかった** ため、コード修正は行っていません。

---

## 総合評価

全体として高品質な実装です。設計ドキュメント（DB スキーマ、RLS、パブリックドキュメント）との整合性が取れており、セキュリティ（認証・認可）も適切に実装されています。

| 観点 | 評価 |
|---|---|
| DB スキーマ整合 | ◎ |
| セキュリティ | ◎ |
| コード品質 | ○（`withAuth` 統一性のみ）|
| UX | ◎ |
| スケーラビリティ | △（監査ログのページネーション課題）|
