---
title: "修正チケット & 調査タスク & 実行計画"
---

# 修正チケット & 調査タスク & 実行計画

---

## 実行計画（タイムライン）

```
Wave 1（並列実行可能 — 全て独立・競合なし）:
├─ FIX-01: テナント論理削除          → Agent A
├─ FIX-02: ロール変更確認ダイアログ   → Agent B
├─ FIX-03: 監査ログサーバーサイドフィルタ → Agent C
├─ TICKET-09: WF承認・差戻し         → Agent D
├─ TICKET-10: 経費管理               → Agent E
└─ RESEARCH-01: profiles テーブル調査  → Agent F（調査のみ）

Wave 2（Wave 1 完了後）:
└─ TICKET-01: ダッシュボード          → Agent G

Wave 3（次フェーズ — 優先度に応じて順次）:
├─ FIX-04: WF番号並行安全性          ← 単独
├─ FIX-05: requireRole() 統一        ← 単独
├─ FIX-06: roleLabels 共通化         ← 単独
└─ FIX-07: ユーザー表示名            ← RESEARCH-01 の結果待ち
```

> **Wave 1 の6タスクは全て並列実行OK**。  
> 各タスクが触るファイルが完全に分離されているため競合しない。

---

## 🔴 即時修正チケット

### FIX-01: テナント論理削除

**触るファイル**: `admin/tenant/_actions.ts`, `admin/tenant/_components/TenantManagement.tsx`  
**競合**: なし（tenant ファイルのみ）

```
あなたは OpsHub の開発者です。テナント削除を「即時物理削除」から「30日間論理削除」に修正してください。

## 背景
レビューで API-A01 仕様との不適合が判明。現在の実装は `supabase.from("tenants").delete()` で即時物理削除だが、仕様は「論理削除（30日保持）→ 期限後に物理削除」。

## 参照ドキュメント
- API仕様: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/apis/API-A01.md（L171-173: 論理削除 → 30日後に物理削除）
- 現在の実装: /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/tenant/_actions.ts
- UI: /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/tenant/_components/TenantManagement.tsx

## 修正内容
1. tenants テーブルに `deleted_at` カラムを追加するマイグレーション作成
   - ファイル: /home/garchomp-game/workspace/starlight-test/OpsHub/supabase/migrations/20260224_000001_tenant_soft_delete.sql
   - ALTER TABLE public.tenants ADD COLUMN deleted_at timestamptz;
   - RLS ポリシーを更新: deleted_at IS NULL のデータのみ閲覧可能に
2. _actions.ts の `deleteTenant` を修正:
   - `.delete()` → `.update({ deleted_at: new Date().toISOString() })`
   - 監査ログのアクションを `tenant.soft_delete` に変更
3. UI に「テナントは30日間復元可能です」のメッセージを追加
4. マイグレーション適用: `npx supabase db reset`
5. 型再生成: `npm run db:types`

## 共通インフラ
- ナレッジ: /home/garchomp-game/workspace/starlight-test/OpsHub/docs/knowledge.md
- withAuth(): /home/garchomp-game/workspace/starlight-test/OpsHub/src/lib/actions.ts
- writeAuditLog(): 同上

## テスト
- npm run build で型エラーがないことを確認
```

---

### FIX-02: ロール変更確認ダイアログ

**触るファイル**: `admin/users/_components/UserDetailPanel.tsx`  
**競合**: なし（users コンポーネントのみ）

```
あなたは OpsHub の開発者です。ユーザーのロール変更時に確認ダイアログを追加してください。

## 背景
レビューで SCR-A02 仕様（L81: ロール変更には確認ダイアログが必要）との不適合が判明。現在はロール変更保存ボタンに Popconfirm がない。

## 参照ドキュメント
- 画面仕様: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/screens/SCR-A02.md（L81: ロール変更 → 確認ダイアログ）
- 現在の実装: /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/users/_components/UserDetailPanel.tsx

## 修正内容
1. UserDetailPanel.tsx のロール変更「保存」ボタンを Ant Design の `Popconfirm` で囲む
2. 確認メッセージ: 「{ユーザー名} のロールを変更しますか？この操作は監査ログに記録されます。」
3. 変更前後のロール一覧を確認ダイアログ内に表示する（変更差分が分かるように）
4. okText: "変更する"、cancelText: "キャンセル"

## テスト
- npm run build で型エラーがないことを確認
```

---

### FIX-03: 監査ログのサーバーサイドフィルタ & ページネーション

**触るファイル**: `admin/audit-logs/page.tsx`, `admin/audit-logs/_components/AuditLogViewer.tsx`  
**競合**: なし（audit-logs ファイルのみ）

```
あなたは OpsHub の開発者です。監査ログビューアをクライアントサイドフィルタからサーバーサイドフィルタ+ページネーションに改修してください。

## 背景
レビューで指摘: 現状は最新100件をクライアントでフィルタしているため、100件超のデータが取得できない。期間フィルタで過去データを見られない。

## 参照ドキュメント
- 現在の実装:
  - /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/audit-logs/page.tsx（L39: .limit(100) 固定）
  - /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/audit-logs/_components/AuditLogViewer.tsx
- DB設計: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/detail/db/index.md（DD-DB-009 audit_logs）
- ナレッジ: /home/garchomp-game/workspace/starlight-test/OpsHub/docs/knowledge.md

## 修正内容
1. Server Action を新規作成: `admin/audit-logs/_actions.ts`
   - `fetchAuditLogs(input: { page, pageSize, dateFrom?, dateTo?, userId?, action?, resourceType? })`
   - Supabase クエリでサーバーサイドフィルタ（`.eq()`, `.gte()`, `.lte()`）
   - `.range()` でページネーション
   - 総件数も返す（ヘッダー count or count クエリ）
2. AuditLogViewer.tsx を改修:
   - フィルタ変更時に Server Action を呼び出し（クライアントサイドフィルタを撤去）
   - Ant Design Table の `pagination` プロパティでページネーション
   - ページ変更・フィルタ変更時にサーバーから再取得
3. page.tsx: 初期データをサーバーサイドで取得（デフォルト: 最新50件, page=1）

## テスト
- npm run build で型エラーがないことを確認
```

---

## 🟡 次フェーズ修正チケット

### FIX-04: WF番号の並行安全性

**触るファイル**: `workflows/_actions.ts`, 新規マイグレーション  
**依存**: なし

```
あなたは OpsHub の開発者です。ワークフロー番号の採番を並行安全にしてください。

## 背景
レビュー指摘: 現在の `count + 1` 方式は同時作成時に番号重複のリスクがある。

## 参照ドキュメント
- 現在の実装: /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/workflows/_actions.ts（L38-49 generateWorkflowNumber 関数）
- ナレッジ: /home/garchomp-game/workspace/starlight-test/OpsHub/docs/knowledge.md

## 修正内容
1. DB にテナントごとのシーケンスカウンター用テーブルまたはカラムを追加
   - 案A: tenants.workflow_seq カラム追加 + FOR UPDATE ロック
   - 案B: PostgreSQL の ADVISORY LOCK を使用
2. generateWorkflowNumber を修正して並行安全にする
3. マイグレーションファイルを作成

## テスト
- npm run build で型エラーがないことを確認
```

---

### FIX-05: requireRole() 統一使用

**触るファイル**: 複数ファイルの Server Action / Page  
**依存**: なし

```
あなたは OpsHub の開発者です。権限チェックを requireRole() ヘルパーに統一してください。

## 背景
レビュー指摘: 一部の Server Action や Server Component で requireRole() ではなくインラインの roles.some() で権限チェックしている。

## 参照ドキュメント
- requireRole() の実装: /home/garchomp-game/workspace/starlight-test/OpsHub/src/lib/auth.ts
- ナレッジ: /home/garchomp-game/workspace/starlight-test/OpsHub/docs/knowledge.md

## 修正内容
1. 以下のファイルでインライン権限チェックを requireRole() に置換:
   - /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/audit-logs/page.tsx（L9-20: roles.some() → requireRole + catch で UI表示）
   - その他、grep で `roles.some` や `role ===` パターンを検索して統一
2. requireRole() の throw をキャッチして適切な UI を表示するパターンが必要な箇所では、getCurrentUser() + 手動チェックに統一

## テスト
- npm run build で型エラーがないことを確認
```

---

### FIX-06: roleLabels 重複定義の共通化

**触るファイル**: `types/index.ts`, `admin/users/_components/*.tsx`  
**依存**: なし

```
あなたは OpsHub の開発者です。roleLabels / statusLabels の重複定義を共通化してください。

## 背景
レビュー指摘: roleLabels が InviteModal.tsx, UserDetailPanel.tsx, UserManagement.tsx の3ファイルで重複定義。

## 修正内容
1. /home/garchomp-game/workspace/starlight-test/OpsHub/src/types/index.ts に以下を追加:
   - export const ROLE_LABELS: Record<Role, string>
   - export const USER_STATUS_LABELS / USER_STATUS_COLORS
2. 3ファイルのローカル定義を削除し、共通定義をインポート

## テスト
- npm run build で型エラーがないことを確認
```

---

### FIX-07: ユーザー表示名（profiles テーブル導入）

**触るファイル**: 新規マイグレーション, 新規型, 複数ファイル  
**依存**: RESEARCH-01 の調査結果

```
あなたは OpsHub の開発者です。ユーザーの表示名を UUID ではなく名前で表示するため、profiles テーブルを導入してください。

## 背景
レビュー指摘: タスクの担当者やCSVのメンバー名が UUID 表示。auth.users は RLS で直接アクセスしづらいため、public.profiles テーブルが必要。

## 依存
- RESEARCH-01 の調査結果を参照すること（/home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/detail/research/profiles-table.md）

## 修正内容
1. profiles テーブルのマイグレーション作成
2. auth.users の INSERT トリガーで profiles を自動作成
3. 既存の user_id 表示箇所を profiles JOIN に変更
4. 型再生成

## テスト
- npm run build で型エラーがないことを確認
```

---

## 🔍 調査タスク

### RESEARCH-01: profiles テーブル設計調査

**出力先**: `/home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/detail/research/profiles-table.md`  
**並列**: Wave 1 で他タスクと同時実行可能

```
あなたは OpsHub の設計調査担当です。auth.users の補助テーブルとしての profiles テーブルの設計を調査・提案してください。

## 背景
レビューで複数箇所で「ユーザー名が UUID 表示」の問題が指摘されている。Supabase の auth.users テーブルは RLS の制約で public スキーマから直接参照しづらい。public.profiles テーブルを導入してユーザーの表示名・アバター等を管理する設計が必要。

## 調査項目
1. Supabase 公式の推奨パターン（profiles テーブル + trigger）
2. profiles テーブルのカラム設計（id, display_name, avatar_url など）
3. auth.users の INSERT/UPDATE 時に profiles を自動同期するトリガー SQL
4. 既存テーブルとの JOIN パターン（projects.pm_id → profiles.display_name 等）
5. RLS ポリシー（同テナントメンバーの profiles を閲覧可能）
6. 既存の user_id 表示箇所の一覧（影響範囲の特定）

## 参照ドキュメント
- DB設計: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/detail/db/index.md
- RLS設計: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/detail/rls/index.md
- ナレッジ: /home/garchomp-game/workspace/starlight-test/OpsHub/docs/knowledge.md

## 影響箇所を調べるファイル
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/projects/[id]/tasks/_components/KanbanBoard.tsx（担当者 UUID 表示）
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/timesheets/reports/_actions.ts（CSV の「メンバー名」列が UUID）

## 出力先
調査結果を以下のファイルに保存してください:
/home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/detail/research/profiles-table.md

## 出力形式
---
title: profiles テーブル設計調査
description: ユーザー表示名のための profiles テーブル設計提案
---

以下のセクションを含めること:
1. 推奨テーブル設計（DDL）
2. トリガー SQL
3. RLS ポリシー
4. 影響箇所一覧
5. マイグレーション手順
```
