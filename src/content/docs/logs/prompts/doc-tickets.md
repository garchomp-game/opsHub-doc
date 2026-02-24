---
title: "opsHub-doc 整理タスク — エージェントプロンプト集"
---

# opsHub-doc 整理タスク — エージェントプロンプト集

各プロンプトのコードブロック内をそのままエージェントに渡してください。

## 実行計画

```
Group A + C（先行、並列OK）:
├─ DOC-02: 経費の画面/API仕様       → Agent A
├─ DOC-03: 通知の画面/API仕様       → Agent B
├─ DOC-04: 監査ログの画面仕様       → Agent C
├─ DOC-05: ダッシュボード仕様更新    → Agent D
├─ DOC-09: ADR-0004 profiles       → Agent H
└─ DOC-10: ADR-0005 CLI vs Compose → Agent I

Group B（後続、並列OK）:
├─ DOC-06: DB設計更新              → Agent E
├─ DOC-07: RLS設計更新             → Agent F
└─ DOC-08: モジュール設計更新       → Agent G

DOC-11: サイドバー更新 → 全完了後に私が実行
```

---

## DOC-02: 経費管理の画面仕様 + API仕様

```
あなたは OpsHub の設計ドキュメント担当です。実装済みの経費管理機能から逆引きで画面仕様書とAPI仕様書を作成してください。

## 作成するファイル
1. /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/screens/SCR-D01.md
2. /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/apis/API-D01.md

## 参照する実装
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/expenses/_actions.ts
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/expenses/page.tsx
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/expenses/new/page.tsx

## 参照する既存ドキュメント（フォーマットを合わせる）
- 画面仕様テンプレ: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/screens/template.md
- API仕様テンプレ: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/apis/template.md
- 既存例（画面）: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/screens/SCR-B02.md
- 既存例（API）: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/apis/API-B02.md
- Public Docs: /home/garchomp-game/workspace/starlight-test/opsHub-public-docs/src/content/docs/guides/expenses/index.md

## 画面仕様に含める内容
- frontmatter: title, description
- 目的 / 関連 REQ / 関連 API
- ワイヤーフレーム（テキスト/ASCII）
- 画面要素の説明（フォーム項目、テーブル列、ボタン、フィルタ）
- カテゴリ: 交通費、宿泊費、会議費、消耗品費、通信費、その他
- ロール別表示（一般=自分のみ、Accounting/TenantAdmin=全件）
- ワークフロー連動の説明

## API仕様に含める内容
- frontmatter: title, description
- エンドポイント（Server Action 名）一覧
- 各アクションの入力/出力/バリデーション/エラーコード
- ワークフロー自動作成フロー
- 権限チェック
```

---

## DOC-03: 通知システムの画面仕様 + API仕様

```
あなたは OpsHub の設計ドキュメント担当です。実装済みの通知システムから逆引きで画面仕様書とAPI仕様書を作成してください。

## 作成するファイル
1. /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/screens/SCR-E01.md
2. /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/apis/API-E01.md

## 参照する実装
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/lib/notifications.ts（createNotification ヘルパー）
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/_actions/notifications.ts（Server Actions）
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/_components/NotificationBell.tsx（UI）
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/layout.tsx（統合箇所）

## 参照する既存ドキュメント（フォーマットを合わせる）
- 画面仕様テンプレ: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/screens/template.md
- API仕様テンプレ: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/apis/template.md
- DB設計: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/detail/db/index.md（DD-DB-010 notifications）
- Public Docs: /home/garchomp-game/workspace/starlight-test/opsHub-public-docs/src/content/docs/getting-started/dashboard.mdx（通知セクション）

## 画面仕様に含める内容
- NotificationBell のUI仕様（Badge, Popover, List）
- 未読件数表示、既読マーク、「すべて既読」ボタン
- 通知クリック→リソースへの遷移ルール（resource_type→URLマッピング）
- SSR での初期データ取得パターン

## API仕様に含める内容
- getNotifications / markAsRead / markAllAsRead の入出力
- createNotification ヘルパーのインターフェース
- 通知タイプ一覧（workflow_approved, workflow_rejected 等）
```

---

## DOC-04: 監査ログビューアの画面仕様

```
あなたは OpsHub の設計ドキュメント担当です。実装済みの監査ログビューアから逆引きで画面仕様書を作成してください。

## 作成するファイル
1. /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/screens/SCR-A03.md

## 参照する実装
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/audit-logs/page.tsx
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/audit-logs/_actions.ts
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/audit-logs/_components/AuditLogViewer.tsx

## 参照する既存ドキュメント
- 画面仕様テンプレ: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/screens/template.md
- DB設計: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/detail/db/index.md（DD-DB-009 audit_logs）
- 監査ログ方針: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/audit-logging/index.md
- Public Docs: /home/garchomp-game/workspace/starlight-test/opsHub-public-docs/src/content/docs/admin/audit-logs.mdx

## 含める内容
- アクセス権限: IT Admin / Tenant Admin のみ
- テーブル列: 日時、操作者名（profiles JOIN）、アクション種別、リソース種別、リソースID
- フィルタ: 期間（RangePicker）、ユーザー、アクション種別、リソース種別
- サーバーサイドページネーション（FIX-03 で改修済み）
- 詳細展開: before_data / after_data の JSON 差分表示
- 読み取り専用（編集/削除 UI 一切なし）
```

---

## DOC-05: ダッシュボード画面仕様の更新

```
あなたは OpsHub の設計ドキュメント担当です。既存のダッシュボード画面仕様を実装内容に合わせて更新してください。

## 更新するファイル
1. /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/screens/SCR-002.md

## 参照する実装
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/page.tsx
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/_actions/dashboard.ts

## 参照する既存ドキュメント
- 画面仕様テンプレ: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/screens/template.md
- Public Docs: /home/garchomp-game/workspace/starlight-test/opsHub-public-docs/src/content/docs/getting-started/dashboard.mdx

## 更新する内容
- KPIカード5種の詳細（データソース、表示条件、ロール制限）
- ロール別表示ルール: approver→承認待ち、pm→PJ進捗、member→タスク/工数
- 通知セクション（未読5件表示）
- Promise.all による並行データ取得パターン
- Server Component としての設計判断
```

---

## DOC-06: DB設計の更新

```
あなたは OpsHub の設計ドキュメント担当です。DB設計ドキュメントに実装で追加されたテーブル・カラムを反映してください。

## 更新するファイル
1. /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/detail/db/index.md

## 参照する実装
- マイグレーション:
  - /home/garchomp-game/workspace/starlight-test/OpsHub/supabase/migrations/20260224_000001_tenant_soft_delete.sql
  - /home/garchomp-game/workspace/starlight-test/OpsHub/supabase/migrations/20260224_000002_workflow_seq.sql
  - /home/garchomp-game/workspace/starlight-test/OpsHub/supabase/migrations/20260224_000002_profiles_table.sql
- profiles 調査: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/detail/research/profiles-table.md
- 型定義: /home/garchomp-game/workspace/starlight-test/OpsHub/src/types/database.ts

## 追加する内容
1. DD-DB-012: profiles テーブル（id, display_name, avatar_url, created_at, updated_at）
2. tenants テーブルに `deleted_at timestamptz` カラム追加
3. tenants テーブルに `workflow_seq integer DEFAULT 0` カラム追加
4. `next_workflow_number(p_tenant_id)` RPC 関数
5. profiles の INSERT/UPDATE トリガー
```

---

## DOC-07: RLS設計の更新

```
あなたは OpsHub の設計ドキュメント担当です。RLS設計ドキュメントに不足しているポリシーを追加してください。

## 更新するファイル
1. /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/detail/rls/index.md

## 参照する実装
- マイグレーション:
  - /home/garchomp-game/workspace/starlight-test/OpsHub/supabase/migrations/20260223_000001_initial_schema.sql
  - /home/garchomp-game/workspace/starlight-test/OpsHub/supabase/migrations/20260224_000001_tenant_soft_delete.sql
  - /home/garchomp-game/workspace/starlight-test/OpsHub/supabase/migrations/20260224_000002_profiles_table.sql
- profiles 調査: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/detail/research/profiles-table.md

## 追加する内容
1. profiles テーブルの RLS ポリシー:
   - SELECT: 同テナントメンバー + 自分自身
   - UPDATE: 自分のみ
2. expenses テーブルの RLS ポリシー:
   - INSERT: 認証済みユーザー（tenant_id 一致）
   - SELECT: 作成者は自分のみ、Accounting/TenantAdmin は全件
   - UPDATE: 作成者かつ WF draft 状態のみ
3. tenants テーブルの既存ポリシーに `deleted_at IS NULL` 条件追加を記載
```

---

## DOC-08: モジュール設計の更新

```
あなたは OpsHub の設計ドキュメント担当です。モジュール設計ドキュメントを実装完了後の状態に更新してください。

## 更新するファイル
1. /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/detail/modules/index.md

## 参照する実装
- ナレッジ: /home/garchomp-game/workspace/starlight-test/OpsHub/docs/knowledge.md
- ディレクトリ構造:
  find /home/garchomp-game/workspace/starlight-test/OpsHub/src -type f -name "*.ts" -o -name "*.tsx" | head -80

## 更新する内容
1. 実装後のディレクトリ構成ツリー（全ページ・コンポーネント・アクション）
2. 共通ユーティリティの説明:
   - `withAuth()` — Server Action ラッパー
   - `writeAuditLog()` — 監査ログ記録
   - `requireAuth()` / `requireRole()` / `hasRole()` — 認証・認可
   - `createNotification()` — 通知作成ヘルパー
   - profiles JOIN — ユーザー表示名取得パターン
3. 共通定数: `ROLE_LABELS`, `USER_STATUS_LABELS`, `USER_STATUS_COLORS`
4. Server Component / Client Component の分離パターン
```

---

## DOC-09: ADR-0004 profiles テーブル導入

```
あなたは OpsHub の設計ドキュメント担当です。profiles テーブル導入の意思決定記録（ADR）を作成してください。

## 作成するファイル
1. /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/adr/ADR-0004.md

## 参照するドキュメント
- ADRテンプレ: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/adr/template.md
- 既存ADR例: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/adr/ADR-0001.md
- profiles 調査: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/detail/research/profiles-table.md

## 内容
- タイトル: ADR-0004 ユーザー表示名のための profiles テーブル導入
- ステータス: Accepted
- コンテキスト: auth.users は RLS で直接参照困難、16箇所で UUID 表示問題
- 決定: public.profiles テーブル + auth.users の INSERT/UPDATE トリガーで自動同期
- 却下案: auth.users の直接参照、アプリ側キャッシュ
- 結果: 全UI で display_name 表示可能に、JOIN パターンで統一
```

---

## DOC-10: ADR-0005 Supabase CLI vs Docker Compose

```
あなたは OpsHub の設計ドキュメント担当です。Supabase ローカル環境の選択に関する意思決定記録（ADR）を作成してください。

## 作成するファイル
1. /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/adr/ADR-0005.md

## 参照するドキュメント
- ADRテンプレ: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/adr/template.md
- 既存ADR例: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/adr/ADR-0001.md
- 旧ドキュメント: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/architecture/supabase.md
- セットアップ: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/detail/setup/index.md

## 内容
- タイトル: ADR-0005 Supabase ローカル環境: CLI vs Docker Compose
- ステータス: Accepted
- コンテキスト: 初期設計では docker-compose.yml による手動管理を想定。実装時に Supabase CLI を採用
- 決定: Supabase CLI (`npx supabase start`) を採用
- 理由:
  1. マイグレーション管理が CLI ネイティブ（`supabase db reset`, `supabase db diff`）
  2. 型生成が CLI ネイティブ（`supabase gen types`）
  3. Docker コンテナの構成を CLI が自動管理（手動 docker-compose.yml 不要）
  4. docker-compose.yml のバージョン追従が不要
- 却下案: 手動 Docker Compose 管理
- 結果: docker-compose.yml は不要、supabase/config.toml + migrations/ で管理
```
