---
title: "R13-3: DB設計拡張（documents + pg_trgm）"
description: "documents テーブルと全文検索インデックスの設計追記ウォークスルー"
---

## 概要

DB設計書（`detail/db/index.md`）と RLS設計書（`detail/rls/index.md`）に、ドキュメント管理テーブルと全文検索インデックスの設計を追記した。

---

## 変更内容

### DB設計書（detail/db/index.md）

| 変更箇所 | 内容 |
|---|---|
| DD-DB-015 documents テーブル | テーブル定義・Index・Related リンクを追加 |
| 全文検索インデックス（pg_trgm） | ADR-0006 に基づく GIN インデックス 5 本の設計セクションを新設 |
| ER図 | `documents` テーブルと `tenants` / `projects` のリレーションを追加 |
| Related | ADR-0006 へのリンクを追加 |
| 未決事項 | documents テーブル定義済みのため解消 |

#### GIN インデックス一覧

| 対象テーブル | カラム | インデックス名 |
|---|---|---|
| workflows | title | `idx_workflows_title_trgm` |
| projects | name | `idx_projects_name_trgm` |
| tasks | title | `idx_tasks_title_trgm` |
| expenses | description | `idx_expenses_description_trgm` |
| documents | name | `idx_documents_name_trgm` |

### RLS設計書（detail/rls/index.md）

| ポリシー | 操作 | 条件 |
|---|---|---|
| `documents_select` | SELECT | プロジェクトメンバー / PM / TenantAdmin（project_id=NULL はテナント全員） |
| `documents_insert` | INSERT | PM / TenantAdmin のみ（uploaded_by = 自分） |
| `documents_delete` | DELETE | PM / TenantAdmin のみ |

テスト方針テーブルにドキュメント関連の 3 テストケースを追加。

---

## 検証

```
npm run build → 153 page(s) built — Exit code: 0 ✅
```
