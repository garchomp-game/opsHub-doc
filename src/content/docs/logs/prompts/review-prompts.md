---
title: "レビュープロンプト集"
---

# レビュープロンプト集

各エージェントの実装をレビューするためのプロンプトです。レビュー担当エージェントにそのまま渡してください。

---

## レビュー 1: TICKET-04（プロジェクト）+ TICKET-08（ワークフロー申請）

```
あなたは OpsHub のコードレビュアーです。以下の実装をレビューしてください。

## レビュー対象ファイル

### TICKET-04: プロジェクト CRUD
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/projects/page.tsx（一覧）
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/projects/new/page.tsx（作成）
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/projects/[id]/page.tsx（詳細）
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/projects/[id]/_components/ProjectDetailClient.tsx
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/projects/_actions.ts

### TICKET-08: ワークフロー申請
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/workflows/page.tsx（一覧）
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/workflows/new/page.tsx（作成）
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/workflows/[id]/page.tsx（詳細）
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/workflows/[id]/_components/WorkflowDetailClient.tsx
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/workflows/_actions.ts

## 参照すべき設計ドキュメント（正とする）

### プロジェクト
- API仕様: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/apis/API-C01.md
- 状態遷移: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/detail/sequences/index.md（L53-59）
  - planning → active → completed/cancelled, planning → cancelled のみ。逆方向遷移は不可
- Public Docs: /home/garchomp-game/workspace/starlight-test/opsHub-public-docs/src/content/docs/guides/projects/create-project.mdx
  - 作成時ステータスは **planning 固定**（入力項目にステータスがないこと）

### ワークフロー
- API仕様: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/apis/API-B01.md（作成）
- 状態遷移: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/apis/API-B03.md
  - draft→submitted, submitted→approved/rejected/withdrawn, rejected→submitted/withdrawn
- RLS: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/detail/rls/index.md（workflows セクション）
  - 申請者は自分の申請のみ閲覧、下書き/差戻し状態のみ更新可能

## チェックポイント

### 設計準拠
1. プロジェクト作成時、ステータスが `planning` に固定されているか？（ユーザーが選択できないこと）
2. プロジェクトの状態遷移が `PROJECT_TRANSITIONS`（src/types/index.ts）に従っているか？
3. ワークフローの状態遷移が `WORKFLOW_TRANSITIONS`（src/types/index.ts）に従っているか？
4. ワークフロー番号（WF-001形式）の自動採番は実装されているか？
5. ワークフローの RLS: 自分の申請 + 承認対象 + Tenant Admin のみ閲覧可能になっているか？

### 共通インフラの使用
6. Server Action は `withAuth()` ラッパー（src/lib/actions.ts）を使用しているか？
7. データ変更操作で `writeAuditLog()` を呼んでいるか？
8. 認証チェックに `requireAuth()` / `requireRole()` を使用しているか？
9. 型定義は `src/types/index.ts` と `src/types/database.ts` を使用しているか？

### コード品質
10. Server Component と Client Component が適切に分離されているか？（"use client" ディレクティブの確認）
11. Ant Design コンポーネント（Table, Form, Card 等）を使用しているか？
12. エラーハンドリング: `ActionResult<T>` 型でレスポンスを返しているか？
13. TypeScript の型安全性: any の使用がないか？

### セキュリティ
14. ユーザー入力のバリデーション（Server Action 側）が実装されているか？
15. tenant_id の検証: 操作対象が自テナントのデータであることを確認しているか？

## 実行すべき検証

1. `cd /home/garchomp-game/workspace/starlight-test/OpsHub && npm run build` でビルドが通ることを確認
2. 型エラーが0件であること
3. 問題があれば修正し、修正内容をレポート

## レポート形式

レビュー完了後、以下の形式で報告してください:
- ✅ 合格項目の一覧
- ⚠️ 軽微な指摘（修正推奨）
- ❌ 重大な問題（修正必須）
- 修正した場合はその内容
```

---

## レビュー 2: TICKET-11（通知）+ TICKET-12（監査ログビューア）

```
あなたは OpsHub のコードレビュアーです。以下の実装をレビューしてください。

## レビュー対象ファイル

### TICKET-11: 通知システム
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/_components/NotificationBell.tsx
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/_actions/notifications.ts
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/lib/notifications.ts

### TICKET-12: 監査ログビューア
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/audit-logs/page.tsx
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/audit-logs/_components/AuditLogViewer.tsx

### 関連（エージェントが追加した可能性のあるファイル）
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/layout.tsx（NotificationBell の統合部分）

## 参照すべき設計ドキュメント（正とする）

### 通知
- DB設計: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/detail/db/index.md（DD-DB-010 notifications）
  - 列: id, tenant_id, user_id, type, title, body, resource_type, resource_id, is_read, created_at
- RLS: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/detail/rls/index.md
  - 自分の通知のみ閲覧/更新可能（user_id = auth.uid()）
- Public Docs: /home/garchomp-game/workspace/starlight-test/opsHub-public-docs/src/content/docs/getting-started/dashboard.mdx（通知セクション L30-48）

### 監査ログ
- DB設計: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/detail/db/index.md（DD-DB-009 audit_logs）
  - INSERT ONLY — UPDATE/DELETE 禁止（トリガーで防止）
- RLS: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/detail/rls/index.md（audit_logs セクション）
  - IT Admin / Tenant Admin **のみ** 閲覧可能
- Public Docs: /home/garchomp-game/workspace/starlight-test/opsHub-public-docs/src/content/docs/admin/audit-logs.mdx

## チェックポイント

### 通知（TICKET-11）
1. `createNotification()` ヘルパー関数が `src/lib/notifications.ts` に存在し、他のチケット（WF承認等）から呼び出せるインターフェースになっているか？
2. 引数: tenantId, userId, type, title, body, resourceType, resourceId を受け取るか？
3. NotificationBell コンポーネント: 未読件数バッジが表示されるか？
4. 「すべて既読にする」機能が実装されているか？
5. 通知クリック時に resource_type/resource_id に基づいてリンク生成しているか？
6. layout.tsx に正しく統合されているか？（ユーザーが手動で統合した変更が壊れていないか確認）

### 監査ログ（TICKET-12）
7. アクセス制御: IT Admin / Tenant Admin のみアクセス可能か？（requireRole で検証）
8. テーブル表示: 時系列降順（created_at DESC）で表示されるか？
9. フィルタ: 期間、ユーザー、アクション種別、リソース種別のフィルタが実装されているか？
10. 詳細展開: before_data / after_data の JSON 内容が確認できるか？
11. **読み取り専用**: INSERT/UPDATE/DELETE の UI が一切ないこと

### 共通インフラの使用
12. Server Action は `withAuth()` ラッパーを使用しているか？
13. 型定義は `src/types/database.ts` の notifications / audit_logs 型を使用しているか？

### コード品質
14. Server/Client Component の分離が適切か？
15. any の使用がないか？
16. Ant Design コンポーネントを使用しているか？（Table, Badge, Collapse 等）

## 実行すべき検証

1. `cd /home/garchomp-game/workspace/starlight-test/OpsHub && npm run build` でビルドが通ることを確認
2. 型エラーが0件であること
3. layout.tsx が正しくビルドされること（NotificationBell のインポートが整合していること）
4. 問題があれば修正し、修正内容をレポート

## レポート形式

レビュー完了後、以下の形式で報告してください:
- ✅ 合格項目の一覧
- ⚠️ 軽微な指摘（修正推奨）
- ❌ 重大な問題（修正必須）
- 修正した場合はその内容
```

---

## レビュー 3: TICKET-02（テナント管理）+ TICKET-03（ユーザー管理・招待）

```
あなたは OpsHub のコードレビュアーです。以下の実装をレビューしてください。

## レビュー対象ファイル

### TICKET-02: テナント管理
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/tenant/page.tsx
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/tenant/_actions.ts
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/tenant/_components/TenantManagement.tsx

### TICKET-03: ユーザー管理・招待
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/users/page.tsx
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/users/_actions.ts
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/users/_components/InviteModal.tsx
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/users/_components/UserDetailPanel.tsx
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/users/_components/UserManagement.tsx

### 関連（エージェントが追加した可能性のあるファイル）
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/lib/supabase/admin.ts（service_role key を使う管理者クライアント）

## 参照すべき設計ドキュメント（正とする）

### テナント管理
- 画面仕様: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/screens/SCR-A01.md
  - L75: Tenant Admin = 全操作（**テナント削除除く**）
  - L76: IT Admin = 全操作（テナント削除含む）
- API仕様: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/apis/API-A01.md
  - L182: テナント削除は **IT Admin のみ**（Tenant Admin は不可）
- Public Docs（修正済み）: /home/garchomp-game/workspace/starlight-test/opsHub-public-docs/src/content/docs/admin/tenant-settings.mdx
  - テナント削除セクションに IT Admin 限定の caution を追記済み

### ユーザー管理
- 画面仕様: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/screens/SCR-A02.md
  - L50: ステータスは 有効/招待中/無効 の **3値**
  - L91: Tenant Admin = テナント内ユーザー管理（**IT Admin ロールの付与除く**）
  - L92: IT Admin = 全テナントのユーザー管理
- API仕様: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/apis/API-A02.md
  - 招待: Supabase admin.inviteUserByEmail() を使用
  - 無効化/再有効化: action = "disable" / "enable"
- ロール定義: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/requirements/roles/index.md
  - 6ロール: member, approver, pm, accounting, it_admin, tenant_admin

## チェックポイント

### テナント管理（TICKET-02）— 最重要: 権限制御
1. **【Critical】テナント削除が IT Admin のみに制限されているか？** Tenant Admin にはボタン自体が表示されないこと
2. テナント名・スラッグの編集は Tenant Admin / IT Admin 両方可能か？
3. settings JSON の編集フォームが実装されているか？
4. 操作時に `writeAuditLog()` が呼ばれているか？
5. `requireRole(tenantId, ['tenant_admin', 'it_admin'])` で権限チェックしているか？

### ユーザー管理（TICKET-03）— 最重要: 権限昇格防止
6. **【Critical】Tenant Admin が IT Admin ロールを付与できないこと** — ロール選択肢に it_admin が表示されないか、Server Action 側でブロックされているか
7. **【Critical】最後の Tenant Admin からの Tenant Admin ロール削除がブロックされているか？**
8. ユーザー一覧に3つのステータス（有効/招待中/無効）が表示されるか？
9. 招待: Supabase の admin.inviteUserByEmail() を使用しているか？（service_role key が必要）
10. admin.ts: service_role key を使った管理者用 Supabase クライアントが適切に実装されているか？
11. ロール変更フォーム: SCR-A02 のワイヤーフレーム（L37）に沿った UI か？
12. ユーザー無効化/再有効化ボタンが実装されているか？
13. 全操作で `writeAuditLog()` が記録されているか？（特に role_change は重要度「最高」）

### 共通インフラの使用
14. Server Action は `withAuth()` ラッパーを使用しているか？
15. 型定義は `src/types/index.ts` の `Role` 型、`ROLES` 定数を使用しているか？
16. `ActionResult<T>` でレスポンスを返しているか？

### セキュリティ（特に重要）
17. service_role key が Client Component に露出していないこと（Server Action / Route Handler 内のみで使用）
18. tenant_id のスコープ検証: 操作対象が自テナント内のユーザーであることを確認しているか？
19. 自分自身のロール変更がブロックされているか？（SCR-A02 バリデーション L100）

### コード品質
20. Server/Client Component の分離が適切か？
21. any の使用がないか？
22. Ant Design コンポーネントを使用しているか？（Table, Modal, Form, Tag 等）

## 実行すべき検証

1. `cd /home/garchomp-game/workspace/starlight-test/OpsHub && npm run build` でビルドが通ることを確認
2. 型エラーが0件であること
3. 問題があれば修正し、修正内容をレポート

## レポート形式

レビュー完了後、以下の形式で報告してください:
- ✅ 合格項目の一覧
- ⚠️ 軽微な指摘（修正推奨）
- ❌ 重大な問題（修正必須）— 特に権限関連は最優先で修正
- 修正した場合はその内容
```

---

## レビュー 4: TICKET-05（タスク管理）+ TICKET-06（工数入力）+ TICKET-07（工数レポート）

```
あなたは OpsHub のコードレビュアーです。以下の実装をレビューしてください。

## レビュー対象ファイル

### TICKET-05: タスク管理（カンバン）
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/projects/[id]/tasks/page.tsx
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/projects/[id]/tasks/_actions.ts
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/projects/[id]/tasks/_components/KanbanBoard.tsx

### TICKET-06: 工数入力
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/timesheets/page.tsx
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/timesheets/_actions.ts
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/timesheets/_components/WeeklyTimesheetClient.tsx

### TICKET-07: 工数レポート・CSV
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/timesheets/reports/page.tsx
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/timesheets/reports/_actions.ts
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/timesheets/reports/_components/ReportClient.tsx

## 参照すべき設計ドキュメント（正とする）

### タスク管理
- API仕様: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/apis/API-C02.md
  - L143: 状態遷移 — todo→in_progress, in_progress→todo/done, **done→in_progress（再開）**
- Public Docs: /home/garchomp-game/workspace/starlight-test/opsHub-public-docs/src/content/docs/guides/projects/task-management.mdx
  - done→in_progress の再開機能あり（QA-002 で追記済み）
- 遷移ルール: /home/garchomp-game/workspace/starlight-test/OpsHub/src/types/index.ts（TASK_TRANSITIONS）

### 工数入力
- API仕様: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/apis/API-C03-1.md
- DB設計: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/detail/db/index.md（DD-DB-007 timesheets）
  - hours: numeric(4,2), CHECK(0〜24), 0.25刻み
  - UNIQUE: (user_id, project_id, task_id, work_date)
- RLS: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/detail/rls/index.md（timesheets セクション）
  - 自分の工数のみ作成/更新、PM は担当PJの工数を閲覧可能
- Public Docs: /home/garchomp-game/workspace/starlight-test/opsHub-public-docs/src/content/docs/guides/timesheet/time-entry.mdx

### 工数レポート
- API仕様: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/apis/API-C03-2.md
  - L111: CSVの工数列は **小数点2桁（例: 8.00）**
- Public Docs（修正済み）: /home/garchomp-game/workspace/starlight-test/opsHub-public-docs/src/content/docs/guides/timesheet/reports.md
  - QA-006 で「小数点2桁」に修正済み

## チェックポイント

### タスク管理（TICKET-05）
1. 3カラムカンバン（todo / in_progress / done）が実装されているか？
2. **【重要】状態遷移が `TASK_TRANSITIONS` に従っているか？** 特に:
   - todo → in_progress ✅
   - in_progress → todo（戻し） ✅
   - in_progress → done ✅
   - **done → in_progress（再開）** ✅ — API-C02 L143 で明記
   - todo → done ❌（不可）
   - done → todo ❌（不可）
3. タスク作成: title, description, assignee_id, due_date の入力フォームがあるか？
4. PM / Tenant Admin のみタスク作成可能（RLS で制御）か？
5. カンバンのドラッグ＆ドロップ or ステータス変更ボタンが実装されているか？

### 工数入力（TICKET-06）
6. **【重要】週間カレンダー形式** になっているか？（行=プロジェクト×タスク、列=月〜日）
7. **【重要】0.25h 刻みバリデーション** が実装されているか？（DB制約: 0〜24, 0.25刻み）
8. 前週/翌週への移動ボタンが実装されているか？
9. 週の合計時間が表示されているか？
10. 自分の工数のみ入力可能か？（user_id = auth.uid() — RLS で制御）
11. 同じ (user_id, project_id, task_id, work_date) の重複防止（UNIQUE制約）が考慮されているか？（UPSERT パターン推奨）

### 工数レポート（TICKET-07）
12. プロジェクト別・メンバー別・月別の集計テーブルが実装されているか？
13. フィルタ（期間、プロジェクト、メンバー）が実装されているか？
14. **【重要】CSVダウンロードの工数列が小数点2桁（例: 8.00）** になっているか？ — API-C03-2 L111
15. CSV列: プロジェクト名, メンバー名, 日付(YYYY-MM-DD), 工数(h), タスク名, 備考 が含まれるか？
16. PM は担当PJの全メンバー工数を閲覧可能か？（RLS: projects.pm_id = auth.uid()）

### 共通インフラの使用
17. Server Action は `withAuth()` ラッパー（src/lib/actions.ts）を使用しているか？
18. データ変更操作で `writeAuditLog()` を呼んでいるか？（タスク作成/ステータス変更、工数入力）
19. 型定義は `src/types/index.ts` と `src/types/database.ts` を使用しているか？

### コード品質
20. Server/Client Component の分離が適切か？（カンバンと工数入力はClient Component が妥当）
21. any の使用がないか？
22. Ant Design コンポーネントを使用しているか？（Table, InputNumber, DatePicker, Card 等）
23. エラーハンドリング: `ActionResult<T>` 型でレスポンスを返しているか？

### セキュリティ
24. 工数入力: Server Action 側で user_id を auth.uid() に強制しているか？（クライアントからの user_id 改ざん防止）
25. tenant_id の検証: 操作対象が自テナントのデータであることを確認しているか？

## 実行すべき検証

1. `cd /home/garchomp-game/workspace/starlight-test/OpsHub && npm run build` でビルドが通ることを確認
2. 型エラーが0件であること
3. 問題があれば修正し、修正内容をレポート

## レポート形式

レビュー完了後、以下の形式で報告してください:
- ✅ 合格項目の一覧
- ⚠️ 軽微な指摘（修正推奨）
- ❌ 重大な問題（修正必須）
- 修正した場合はその内容
```

---

## レビュー 5: TICKET-09（ワークフロー承認・差戻し）

```
あなたは OpsHub のコードレビュアーです。以下の実装をレビューしてください。

## レビュー対象ファイル

### TICKET-09: ワークフロー承認・差戻し
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/workflows/pending/page.tsx（承認待ち一覧）
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/workflows/_actions.ts（既存に承認・差戻しアクション追記）

※ エージェントが追加で作成した可能性のあるファイルも確認:
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/workflows/pending/_components/
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/workflows/pending/_actions.ts

ファイルが見つからない場合は、実装先が異なる可能性があります。以下で実際のファイルを確認してください:
find /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/\(authenticated\)/workflows -type f -name "*.ts" -o -name "*.tsx" | sort

## 参照すべき設計ドキュメント（正とする）

### ワークフロー承認
- API仕様: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/apis/API-B03.md
  - 承認: submitted → approved（approved_at を記録）
  - 差戻し: submitted → rejected（rejection_reason 必須）
  - 取下げ: submitted → withdrawn（申請者のみ）
  - 再送信: rejected → submitted
- 遷移ルール: /home/garchomp-game/workspace/starlight-test/OpsHub/src/types/index.ts（WORKFLOW_TRANSITIONS）
- Public Docs: /home/garchomp-game/workspace/starlight-test/opsHub-public-docs/src/content/docs/guides/workflows/approve-reject.mdx
- ナレッジ: /home/garchomp-game/workspace/starlight-test/OpsHub/docs/knowledge.md

## チェックポイント

### 機能要件
1. **【重要】承認待ち一覧が実装されているか？** approver_id = 自分 AND status = submitted でフィルタ
2. 承認ボタン: submitted → approved + approved_at 記録
3. **【重要】差戻しボタン + 理由入力**: submitted → rejected + rejection_reason 記録（理由は必須バリデーション）
4. **状態遷移が `WORKFLOW_TRANSITIONS` に従っているか？** 不正遷移をブロック
5. 承認/差戻し時に `notifications` テーブルに通知レコード INSERT（createNotification ヘルパー使用推奨）
6. **Approver / Tenant Admin のみ** 承認操作可能か？

### 共通インフラ
7. Server Action は `withAuth()` ラッパー使用
8. `writeAuditLog()` で監査ログ記録（action: `workflow.approve` / `workflow.reject`）
9. 通知: `createNotification()`（/home/garchomp-game/workspace/starlight-test/OpsHub/src/lib/notifications.ts）を使用しているか？
10. `hasRole()` / `requireRole()` で権限チェック（FIX-05 で統一済み）
11. profiles テーブル JOIN でユーザー名表示（FIX-07 で導入済み）

### コード品質
12. Server/Client Component 分離が適切か？
13. any の使用がないか？
14. Ant Design コンポーネント使用（Table, Button, Modal, Input.TextArea 等）
15. `ActionResult<T>` でレスポンスを返しているか？

### セキュリティ
16. 承認操作: 自分が approver_id である申請のみ操作可能か？
17. tenant_id の検証あり？

## 実行すべき検証

1. `cd /home/garchomp-game/workspace/starlight-test/OpsHub && npm run build` でビルドが通ることを確認
2. 型エラーが0件であること
3. 問題があれば修正し、修正内容をレポート

## レポート形式

レビュー完了後、以下の形式で報告してください:
- ✅ 合格項目の一覧
- ⚠️ 軽微な指摘（修正推奨）
- ❌ 重大な問題（修正必須）
- 修正した場合はその内容
```

---

## レビュー 6: TICKET-10（経費管理）

```
あなたは OpsHub のコードレビュアーです。以下の実装をレビューしてください。

## レビュー対象ファイル

### TICKET-10: 経費管理
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/expenses/page.tsx（一覧）
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/expenses/new/page.tsx（作成）
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/expenses/_actions.ts

※ エージェントが追加で作成した可能性のあるファイルも確認:
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/expenses/_components/
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/expenses/[id]/

ファイルが見つからない場合は、実装先が異なる可能性があります。以下で実際のファイルを確認してください:
find /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/\(authenticated\)/expenses -type f -name "*.ts" -o -name "*.tsx" | sort

## 参照すべき設計ドキュメント（正とする）

### 経費管理
- DB設計: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/detail/db/index.md（DD-DB-008 expenses）
  - 列: id, tenant_id, created_by, category, amount, expense_date, description, project_id, receipt_url, workflow_id
- RLS: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/detail/rls/index.md（expenses セクション）
  - 作成者は自分の経費のみ閲覧、Accounting/Tenant Admin は全件閲覧
- Public Docs: /home/garchomp-game/workspace/starlight-test/opsHub-public-docs/src/content/docs/guides/expenses/index.md
  - カテゴリ: 交通費、宿泊費、会議費、消耗品費、通信費、その他
  - ワークフロー連動
- ナレッジ: /home/garchomp-game/workspace/starlight-test/OpsHub/docs/knowledge.md

## チェックポイント

### 機能要件
1. 経費一覧: 自分の経費のみ表示（created_by = auth.uid()）
2. **【重要】Accounting / Tenant Admin は全件閲覧可能** — RLS or アプリ側で出し分け
3. 経費作成フォーム: category, amount, expense_date, description, project_id の入力
4. カテゴリ選択肢が Public Docs と一致するか？（交通費、宿泊費、会議費、消耗品費、通信費、その他）
5. **【重要】ワークフロー連動**: 経費申請時に workflows テーブルに type=expense の申請を同時作成し、expenses.workflow_id に紐付け
6. プロジェクト別経費集計は実装されているか？（集計テーブルまたは統計値表示）

### 共通インフラ
7. Server Action は `withAuth()` ラッパー使用
8. `writeAuditLog()` で監査ログ記録
9. `hasRole()` で Accounting / Tenant Admin 判定（FIX-05 で統一済み）
10. profiles テーブル JOIN でユーザー名表示（FIX-07 で導入済み）
11. 型定義: `src/types/database.ts` の expenses 型を使用

### コード品質
12. Server/Client Component 分離が適切か？
13. any の使用がないか？
14. Ant Design コンポーネント使用（Table, Form, InputNumber, Select, DatePicker 等）
15. `ActionResult<T>` でレスポンスを返しているか？

### セキュリティ
16. 経費作成時、created_by を Server Action 側で auth.uid() に強制しているか？（クライアント改ざん防止）
17. tenant_id の検証あり？
18. 金額バリデーション（0超、上限チェック等）

## 実行すべき検証

1. `cd /home/garchomp-game/workspace/starlight-test/OpsHub && npm run build` でビルドが通ることを確認
2. 型エラーが0件であること
3. 問題があれば修正し、修正内容をレポート

## レポート形式

レビュー完了後、以下の形式で報告してください:
- ✅ 合格項目の一覧
- ⚠️ 軽微な指摘（修正推奨）
- ❌ 重大な問題（修正必須）
- 修正した場合はその内容
```

---

## レビュー 7: TICKET-01（ダッシュボード）

```
あなたは OpsHub のコードレビュアーです。以下の実装をレビューしてください。

## レビュー対象ファイル

### TICKET-01: ダッシュボード画面
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/page.tsx（ダッシュボード本体）
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/_actions/dashboard.ts（データ取得 Server Actions）

## 参照すべき設計ドキュメント（正とする）

- Public Docs: /home/garchomp-game/workspace/starlight-test/opsHub-public-docs/src/content/docs/getting-started/dashboard.mdx
  - KPIカード、通知セクション、アクティビティフィード、クイックアクション
- ナレッジ: /home/garchomp-game/workspace/starlight-test/OpsHub/docs/knowledge.md
  - 全12チケット完了、profiles テーブル導入済み、hasRole() 統一済み

## チェックポイント

### KPIカード
1. **承認待ち申請数**: `workflows` テーブルから `approver_id = user.id AND status = submitted` でカウント。approver / tenant_admin のみ表示
2. **自分の申請数**: `workflows` テーブルから `created_by = user.id AND status IN (draft, submitted)` でカウント。全ロール表示
3. **担当タスク数**: `tasks` テーブルから `assignee_id = user.id AND status != done` でカウント。member / pm のみ表示
4. **今週の工数**: `timesheets` テーブルから今週（月〜日）の合計時間。member / pm のみ表示
5. **プロジェクト進捗**: PM 担当プロジェクトの done tasks / total tasks 比率。pm のみ表示

### ロール別表示
6. **【重要】ロール判定に `hasRole()` を使用しているか？**（FIX-05 で統一済み）
7. ロールに応じて不要なカードが非表示になるか？（例: member は承認待ちカードを見ない）
8. 不要なデータ取得がスキップされるか？（例: approver でなければ getPendingApprovalsCount を呼ばない）

### 通知セクション
9. 未読通知の最新5件が表示されるか？
10. 通知クリックで対象リソースに遷移するリンクがあるか？

### データ取得パフォーマンス
11. **`Promise.all()` で並列取得** しているか？（直列で取得していないこと）
12. Server Component からデータ取得しているか？（Client Component からの直接 fetch でないこと）

### 共通インフラ
13. `requireAuth()` で認証チェック
14. `tenant_id` で全クエリがスコープされているか？
15. profiles テーブル JOIN でユーザー名表示（通知の送信者名等）

### コード品質
16. **Server Component** として実装されているか？（ダッシュボードはデータ表示のみなので "use client" 不要）
17. any の使用がないか？
18. Ant Design コンポーネント使用（Card, Statistic, Row, Col, List, Progress, Button 等）

## 実行すべき検証

1. `cd /home/garchomp-game/workspace/starlight-test/OpsHub && npm run build` でビルドが通ることを確認
2. 型エラーが0件であること
3. 問題があれば修正し、修正内容をレポート

## レポート形式

レビュー完了後、以下の形式で報告してください:
- ✅ 合格項目の一覧
- ⚠️ 軽微な指摘（修正推奨）
- ❌ 重大な問題（修正必須）
- 修正した場合はその内容
```
