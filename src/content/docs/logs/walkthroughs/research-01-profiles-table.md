---
title: "profiles テーブル設計調査 — ウォークスルー"
---

# profiles テーブル設計調査 — ウォークスルー

## 実施内容

OpsHub の `auth.users` 補助テーブルとしての `profiles` テーブル設計を調査・提案した。

## 調査で参照したドキュメント

| ドキュメント | 確認内容 |
|---|---|
| [DB設計](file:///home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/detail/db/index.md) | 既存11テーブル構成、全テーブルで `auth.users` FK 参照を確認 |
| [RLS設計](file:///home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/detail/rls/index.md) | `get_user_tenant_ids()` / `has_role()` ヘルパー関数、テナント分離パターン |
| [knowledge.md](file:///home/garchomp-game/workspace/starlight-test/OpsHub/docs/knowledge.md) | 「次フェーズ 🟡 7. ユーザー表示名」として課題認識済み |
| Supabase 公式パターン | profiles + trigger の推奨設計（Web 検索で確認） |

## 影響範囲の特定結果

コードベース全体を `grep` で走査し、**10 ファイル / 16 箇所**で UUID がユーザー表示名として使用されていることを特定した。

### UUID 表示パターン別の分類

````carousel
**パターン A: UUID スライス表示（6 箇所）**

```
task.assignee_id.slice(0, 8)...     // KanbanBoard.tsx L212
m.user_id.slice(0, 8)...            // KanbanBoard.tsx L376, L425
m.user_id.slice(0, 8)...            // ReportClient.tsx L227
user_id.substring(0, 8)…            // AuditLogViewer.tsx L337
id.substring(0, 8)…                 // AuditLogViewer.tsx L449
```
<!-- slide -->
**パターン B: UUID 全文表示（7 箇所）**

```
project.pm_id                       // ProjectDetailClient.tsx L207
u.user_id（role）                    // ProjectDetailClient.tsx L354
a.user_id（role）                    // WorkflowDetailClient.tsx L173
workflow.approver_id                 // WorkflowDetailClient.tsx L234
workflow.created_by                  // WorkflowDetailClient.tsx L235
a.user_id（role）                    // workflows/new/page.tsx L158
u.user_id（role）                    // projects/new/page.tsx L113
```
<!-- slide -->
**パターン C: バックエンド/API（3 箇所）**

```
ts.user_id → CSV「メンバー名」列    // route.ts L80-84
MemberSummary.user_id               // reports/_actions.ts L114
user_id テーブル列                   // ReportClient.tsx L149
```
````

## 提案した設計

### テーブル構成

- `profiles` テーブル: `id`(PK/FK), `display_name`, `avatar_url`, `created_at`, `updated_at`
- `auth.users` と 1:1 リレーション、`ON DELETE CASCADE`
- `tenant_id` なし（テナント横断で 1 ユーザー 1 レコード）

### 同期メカニズム

- `AFTER INSERT` トリガー: `auth.users` 新規作成 → `profiles` 自動生成
- `AFTER UPDATE` トリガー: `raw_user_meta_data.name` 変更時に同期
- バックフィル SQL: 既存ユーザーの一括 profiles 作成

### RLS

- SELECT: 同テナントメンバー + 自分
- UPDATE: 自分のみ
- INSERT/DELETE: トリガー/CASCADE に委譲

## 成果物

| 成果物 | パス |
|---|---|
| 調査ドキュメント | [profiles-table.md](file:///home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/detail/research/profiles-table.md) |

ドキュメントには以下の 5 セクションを含む:
1. 推奨テーブル設計（DDL）
2. トリガー SQL（INSERT / UPDATE / バックフィル）
3. RLS ポリシー
4. 影響箇所一覧（16 箇所の詳細テーブル）
5. マイグレーション手順（ファイル名、型再生成、実装優先順序、JOIN パターン例）
