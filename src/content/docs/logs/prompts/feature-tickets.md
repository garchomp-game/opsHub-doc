---
title: "OpsHub チケット一覧 & エージェントプロンプト"
---

# OpsHub チケット一覧 & エージェントプロンプト

> **前提**: 各エージェントは以下の共通インフラを使用すること
> - 認証済みレイアウト: `src/app/(authenticated)/layout.tsx`
> - Server Action ラッパー: `src/lib/actions.ts` の `withAuth()` / `writeAuditLog()`
> - RBAC ヘルパー: `src/lib/auth.ts` の `requireAuth()` / `requireRole()`
> - 型定義: `src/types/index.ts`（ActionResult, Role, ステータス列挙, 遷移ルール）
> - DB 型: `src/types/database.ts`（Supabase 自動生成）

---

## チケット依存関係

```
TICKET-01 (ダッシュボード) ← 他チケット完了後にKPI充実
TICKET-02 (テナント管理) ← 独立
TICKET-03 (ユーザー管理) ← 独立
TICKET-04 (プロジェクト) ← 独立
TICKET-05 (タスク)       ← TICKET-04
TICKET-06 (工数入力)     ← TICKET-04, TICKET-05
TICKET-07 (工数レポート) ← TICKET-06
TICKET-08 (WF申請)       ← 独立
TICKET-09 (WF承認)       ← TICKET-08
TICKET-10 (経費)         ← TICKET-08
TICKET-11 (通知)         ← 独立（他チケットから呼ばれる）
TICKET-12 (監査ログ)     ← 独立
```

**並列実行可能グループ:**
- グループ1（独立）: TICKET-02, 03, 04, 08, 11, 12
- グループ2（依存）: TICKET-05 → 06 → 07, TICKET-09, 10
- グループ3（最後）: TICKET-01（KPIに他データ必要）

---

## TICKET-01: ダッシュボード

**重さ**: M（UI + データ集約）
**Epic**: REQ-G03
**依存**: 他チケット完了後が理想だが、スタブデータで先行可能

### エージェントプロンプト

```
あなたは OpsHub の開発者です。ダッシュボード画面を実装してください。

## 参照ドキュメント
- 内部設計: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/requirements/roles/index.md（ロール別表示内容 L25-38）
- Public Docs: /home/garchomp-game/workspace/starlight-test/opsHub-public-docs/src/content/docs/getting-started/dashboard.mdx（仕様）
- DB型: /home/garchomp-game/workspace/starlight-test/OpsHub/src/types/database.ts
- 共通型: /home/garchomp-game/workspace/starlight-test/OpsHub/src/types/index.ts

## 実装場所
- ページ: /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/page.tsx（既存プレースホルダーを置換）
- データ取得: /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/_actions/dashboard.ts（新規）

## 要件
1. KPIカード: 未処理申請数、担当タスク数、今週の工数合計、プロジェクト進捗
2. 通知セクション: notifications テーブルから未読5件を表示
3. クイックアクション: 新規申請、工数入力、プロジェクト一覧へのリンク
4. ロール別に表示カードを出し分け（roles/index.md L27 参照）
5. Ant Design の Card, Statistic, List コンポーネントを使用
6. Server Component でデータ取得、Client Component は最小限

## 共通インフラ
- requireAuth() で認証チェック（src/lib/auth.ts）
- Supabase クライアント: src/lib/supabase/server.ts の createClient()

## テスト
- npm run build で型エラーがないことを確認
```

---

## TICKET-02: テナント管理

**重さ**: S（CRUD + 設定画面）
**Epic**: REQ-A01
**依存**: なし

### エージェントプロンプト

```
あなたは OpsHub の開発者です。テナント管理画面を実装してください。

## 参照ドキュメント
- 画面仕様: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/screens/SCR-A01.md
- API仕様: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/apis/API-A01.md
- RLS: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/detail/rls/index.md（tenants セクション）
- DB型: /home/garchomp-game/workspace/starlight-test/OpsHub/src/types/database.ts

## 実装場所
- ページ: /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/tenant/page.tsx（新規）
- Server Actions: /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/tenant/_actions.ts（新規）

## 要件
1. テナント基本情報（名前、スラッグ）の表示と編集
2. テナント設定（settings JSON）の編集フォーム
3. テナント削除（IT Admin のみ。Tenant Admin には非表示）— API-A01 L182 参照
4. withAuth() を使った Server Action パターン
5. 操作時に writeAuditLog() で監査ログ記録
6. SCR-A01 のワイヤーフレームに沿った UI

## 共通インフラ
- withAuth(): src/lib/actions.ts
- writeAuditLog(): src/lib/actions.ts
- requireRole(): src/lib/auth.ts（tenant_admin or it_admin を検証）

## テスト
- npm run build で型エラーがないことを確認
```

---

## TICKET-03: ユーザー管理・招待

**重さ**: L（招待フロー + ロール管理 + 複雑な権限制御）
**Epic**: REQ-A02, REQ-A03
**依存**: なし

### エージェントプロンプト

```
あなたは OpsHub の開発者です。ユーザー管理・招待画面を実装してください。

## 参照ドキュメント
- 画面仕様: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/screens/SCR-A02.md
- API仕様: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/apis/API-A02.md
- ロール定義: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/requirements/roles/index.md
- Public Docs: /home/garchomp-game/workspace/starlight-test/opsHub-public-docs/src/content/docs/guides/user-management.mdx
- DB型: /home/garchomp-game/workspace/starlight-test/OpsHub/src/types/database.ts

## 実装場所
- ユーザー一覧: /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/users/page.tsx（新規）
- Server Actions: /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/users/_actions.ts（新規）
- 招待モーダル: /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/users/_components/InviteModal.tsx（新規）
- ユーザー詳細パネル: /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/users/_components/UserDetailPanel.tsx（新規）

## 要件
1. ユーザー一覧テーブル（SCR-A02 ワイヤーフレーム準拠）: 名前、メール、ロール、ステータス（有効/招待中/無効）
2. ユーザー招待（メール + ロール選択）— Supabase admin.inviteUserByEmail() 使用
3. ロール変更（詳細パネル内）— 最後の Tenant Admin 削除防止バリデーション
4. IT Admin ロール付与は IT Admin のみ（Tenant Admin には非表示。SCR-A02 L91 参照）
5. ユーザー無効化/再有効化
6. 全操作で writeAuditLog() 記録

## 注意事項
- 招待メール送信には Supabase service_role key が必要。Server Action 内で supabaseAdmin クライアントを使用
- SCR-A02 L91: Tenant Admin は「IT Admin ロールの付与除く」

## テスト
- npm run build で型エラーがないことを確認
```

---

## TICKET-04: プロジェクト CRUD

**重さ**: M（CRUD + メンバー管理）
**Epic**: REQ-C01
**依存**: なし

### エージェントプロンプト

```
あなたは OpsHub の開発者です。プロジェクト管理画面を実装してください。

## 参照ドキュメント
- API仕様: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/apis/API-C01.md
- 状態遷移: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/detail/sequences/index.md（L53-59 プロジェクト状態遷移）
- Public Docs: /home/garchomp-game/workspace/starlight-test/opsHub-public-docs/src/content/docs/guides/projects/create-project.mdx
- DB型: /home/garchomp-game/workspace/starlight-test/OpsHub/src/types/database.ts
- 遷移ルール: /home/garchomp-game/workspace/starlight-test/OpsHub/src/types/index.ts（PROJECT_TRANSITIONS）

## 実装場所
- 一覧: /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/projects/page.tsx（新規）
- 詳細: /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/projects/[id]/page.tsx（新規）
- 作成: /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/projects/new/page.tsx（新規）
- Actions: /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/projects/_actions.ts（新規）

## 要件
1. プロジェクト一覧（テーブル形式、ステータスフィルタ、検索）
2. プロジェクト作成（name, description, start_date, end_date, pm_id）— ステータスは planning 固定
3. プロジェクト詳細（タブ: 概要 / メンバー / タスク / 工数）
4. ステータス遷移（PROJECT_TRANSITIONS に従う）
5. メンバー追加/削除（project_members テーブル）
6. PM / Tenant Admin のみ作成・更新可能（RLS で制御）

## テスト
- npm run build で型エラーがないことを確認
```

---

## TICKET-05: タスク管理（カンバン）

**重さ**: M（カンバン UI + ステータス遷移）
**Epic**: REQ-C02
**依存**: TICKET-04（プロジェクト）

### エージェントプロンプト

```
あなたは OpsHub の開発者です。タスク管理画面（カンバンボード）を実装してください。

## 参照ドキュメント
- API仕様: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/apis/API-C02.md
- Public Docs: /home/garchomp-game/workspace/starlight-test/opsHub-public-docs/src/content/docs/guides/projects/task-management.mdx
- 遷移ルール: /home/garchomp-game/workspace/starlight-test/OpsHub/src/types/index.ts（TASK_TRANSITIONS）

## 実装場所
- カンバン: /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/projects/[id]/tasks/page.tsx（新規）
- Actions: /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/projects/[id]/tasks/_actions.ts（新規）
- コンポーネント: /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/projects/[id]/tasks/_components/（新規ディレクトリ）

## 前提条件
- TICKET-04 のプロジェクト画面が実装済みであること。まだの場合は projects テーブルにテストデータを直接 INSERT して動作確認

## 要件
1. 3カラムカンバン（未着手 / 進行中 / 完了）
2. タスク作成モーダル（title, description, assignee_id, due_date）
3. ドラッグ&ドロップ or ボタンでステータス変更（TASK_TRANSITIONS に従う）
4. done → in_progress の「再開」ボタン
5. タスク編集・削除
6. PM / Tenant Admin のみ作成可能（RLS で制御）

## テスト
- npm run build で型エラーがないことを確認
```

---

## TICKET-06: 工数入力

**重さ**: M（週間カレンダー UI）
**Epic**: REQ-C03
**依存**: TICKET-04, TICKET-05

### エージェントプロンプト

```
あなたは OpsHub の開発者です。工数入力画面を実装してください。

## 参照ドキュメント
- API仕様: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/apis/API-C03-1.md
- Public Docs: /home/garchomp-game/workspace/starlight-test/opsHub-public-docs/src/content/docs/guides/timesheet/time-entry.mdx
- DB型: /home/garchomp-game/workspace/starlight-test/OpsHub/src/types/database.ts（timesheets テーブル）

## 実装場所
- 入力画面: /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/timesheets/page.tsx（新規）
- Actions: /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/timesheets/_actions.ts（新規）

## 前提条件
- プロジェクト・タスクが存在すること。なければテストデータを INSERT

## 要件
1. 週間カレンダー形式（月〜日、7列）
2. 行 = プロジェクト × タスク、列 = 日付
3. セルに時間入力（0.25h 刻み、0〜24h）
4. 週の合計時間表示
5. 前週/翌週への移動
6. 自分の工数のみ入力可能（user_id = auth.uid() — RLS で制御）
7. Ant Design の InputNumber, Table を使用

## テスト
- npm run build で型エラーがないことを確認
```

---

## TICKET-07: 工数レポート・CSV出力

**重さ**: S（集計 + CSV）
**Epic**: REQ-C03
**依存**: TICKET-06

### エージェントプロンプト

```
あなたは OpsHub の開発者です。工数レポート・CSV出力画面を実装してください。

## 参照ドキュメント
- API仕様: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/apis/API-C03-2.md
- Public Docs: /home/garchomp-game/workspace/starlight-test/opsHub-public-docs/src/content/docs/guides/timesheet/reports.md

## 実装場所
- レポート画面: /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/timesheets/reports/page.tsx（新規）
- Actions: /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/timesheets/reports/_actions.ts（新規）

## 要件
1. プロジェクト別・メンバー別・月別の集計テーブル
2. フィルタ（期間、プロジェクト、メンバー）
3. CSVダウンロード（工数は小数点2桁 例: 8.00 — reports.md 参照）
4. CSV列: プロジェクト名, メンバー名, 日付(YYYY-MM-DD), 工数(h), タスク名, 備考
5. PM は担当PJの全メンバー工数を閲覧可能

## テスト
- npm run build で型エラーがないことを確認
```

---

## TICKET-08: ワークフロー申請作成

**重さ**: L（フォーム + 添付 + 状態管理）
**Epic**: REQ-B01
**依存**: なし

### エージェントプロンプト

```
あなたは OpsHub の開発者です。ワークフロー申請作成画面を実装してください。

## 参照ドキュメント
- API仕様: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/apis/API-B01.md
- 状態遷移: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/apis/API-B03.md
- Public Docs: /home/garchomp-game/workspace/starlight-test/opsHub-public-docs/src/content/docs/guides/workflows/create-request.mdx
- 遷移ルール: /home/garchomp-game/workspace/starlight-test/OpsHub/src/types/index.ts（WORKFLOW_TRANSITIONS）
- DB型: /home/garchomp-game/workspace/starlight-test/OpsHub/src/types/database.ts（workflows, workflow_attachments テーブル）

## 実装場所
- 一覧: /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/workflows/page.tsx（新規）
- 新規作成: /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/workflows/new/page.tsx（新規）
- 詳細: /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/workflows/[id]/page.tsx（新規）
- Actions: /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/workflows/_actions.ts（新規）

## 要件
1. 申請一覧（テーブル形式、ステータスフィルタ、自分の申請のみ）
2. 新規申請フォーム: type(expense/leave/purchase/other), title, description, amount, date_from, date_to, approver_id
3. 下書き保存（status = draft）
4. 送信（draft → submitted）
5. 取下げ（submitted or rejected → withdrawn）
6. workflow_number の自動採番（WF-001 形式）
7. 監査ログ記録

## テスト
- npm run build で型エラーがないことを確認
```

---

## TICKET-09: ワークフロー承認・差戻し

**重さ**: M（承認ロジック + 通知連携）
**Epic**: REQ-B02
**依存**: TICKET-08

### エージェントプロンプト

```
あなたは OpsHub の開発者です。ワークフロー承認・差戻し機能を実装してください。

## 参照ドキュメント
- API仕様: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/apis/API-B03.md
- Public Docs: /home/garchomp-game/workspace/starlight-test/opsHub-public-docs/src/content/docs/guides/workflows/approve-reject.mdx
- 遷移ルール: /home/garchomp-game/workspace/starlight-test/OpsHub/src/types/index.ts（WORKFLOW_TRANSITIONS）

## 実装場所
- 承認一覧: /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/workflows/pending/page.tsx（新規）
- Actions に追記: /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/workflows/_actions.ts（既存に追記）

## 前提条件
- TICKET-08 が完了し、workflows テーブルに submitted ステータスのデータがあること

## 要件
1. 承認待ち一覧（approver_id = 自分 AND status = submitted）
2. 承認ボタン（submitted → approved）+ approved_at を記録
3. 差戻しボタン + 理由入力（submitted → rejected）+ rejection_reason を記録
4. 承認/差戻し時に notifications テーブルに通知レコード INSERT
5. 監査ログ記録（action: workflow.approve / workflow.reject）
6. WORKFLOW_TRANSITIONS に従った遷移検証

## テスト
- npm run build で型エラーがないことを確認
```

---

## TICKET-10: 経費管理

**重さ**: M（CRUD + ワークフロー連携）
**Epic**: REQ-D01, REQ-D02
**依存**: TICKET-08（ワークフロー）

### エージェントプロンプト

```
あなたは OpsHub の開発者です。経費管理画面を実装してください。

## 参照ドキュメント
- DB設計: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/detail/db/index.md（DD-DB-008 expenses）
- Public Docs: /home/garchomp-game/workspace/starlight-test/opsHub-public-docs/src/content/docs/guides/expenses/index.md
- RLS: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/detail/rls/index.md（expenses セクション）
- DB型: /home/garchomp-game/workspace/starlight-test/OpsHub/src/types/database.ts（expenses テーブル）

## 実装場所
- 一覧: /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/expenses/page.tsx（新規）
- 作成: /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/expenses/new/page.tsx（新規）
- Actions: /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/expenses/_actions.ts（新規）

## 要件
1. 経費一覧（自分の経費 + Accounting は全件）
2. 経費申請（category, amount, expense_date, description, project_id）
3. ワークフロー連動: 経費apply時に workflows テーブルに type=expense の申請を同時作成
4. プロジェクト別経費集計
5. Accounting / Tenant Admin のみ全件閲覧（RLS で制御）

## テスト
- npm run build で型エラーがないことを確認
```

---

## TICKET-11: 通知システム

**重さ**: S（CRUD + リアルタイム）
**Epic**: REQ-G01
**依存**: なし（他チケットから呼ばれるヘルパーを提供）

### エージェントプロンプト

```
あなたは OpsHub の開発者です。通知システムを実装してください。

## 参照ドキュメント
- DB設計: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/detail/db/index.md（DD-DB-010 notifications）
- Public Docs: /home/garchomp-game/workspace/starlight-test/opsHub-public-docs/src/content/docs/getting-started/dashboard.mdx（通知セクション）
- DB型: /home/garchomp-game/workspace/starlight-test/OpsHub/src/types/database.ts（notifications テーブル）

## 実装場所
- 通知ドロップダウン: /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/_components/NotificationBell.tsx（新規）
- 通知ヘルパー: /home/garchomp-game/workspace/starlight-test/OpsHub/src/lib/notifications.ts（新規）
- Actions: /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/_actions/notifications.ts（新規）

## 要件
1. ヘッダーのベルアイコンクリックで通知ドロップダウン表示
2. 未読件数バッジ
3. 通知一覧（最新20件）
4. 「すべて既読にする」ボタン
5. 通知クリックで該当リソースページへ遷移
6. 通知作成ヘルパー関数 createNotification(supabase, { tenantId, userId, type, title, body, resourceType, resourceId })
7. レイアウト（layout.tsx）のベルアイコンを NotificationBell コンポーネントに差し替え

## テスト
- npm run build で型エラーがないことを確認
```

---

## TICKET-12: 監査ログビューア

**重さ**: S（読み取り専用テーブル）
**Epic**: 管理機能
**依存**: なし

### エージェントプロンプト

```
あなたは OpsHub の開発者です。監査ログビューア画面を実装してください。

## 参照ドキュメント
- DB設計: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/detail/db/index.md（DD-DB-009 audit_logs）
- RLS: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/detail/rls/index.md（audit_logs セクション — IT Admin / Tenant Admin のみ閲覧）
- Public Docs: /home/garchomp-game/workspace/starlight-test/opsHub-public-docs/src/content/docs/admin/audit-logs.mdx
- DB型: /home/garchomp-game/workspace/starlight-test/OpsHub/src/types/database.ts（audit_logs テーブル）

## 実装場所
- 一覧: /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/audit-logs/page.tsx（新規）

## 要件
1. 監査ログ一覧（テーブル形式、時系列降順）
2. フィルタ: 期間、ユーザー、アクション種別、リソース種別
3. 詳細展開: before/after の JSON diff 表示
4. IT Admin / Tenant Admin のみアクセス可能（requireRole で検証）
5. 読み取り専用（INSERT/UPDATE/DELETE の UI なし）
6. Ant Design の Table + Collapse コンポーネント

## テスト
- npm run build で型エラーがないことを確認
```
