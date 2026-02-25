---
title: "R13-3: DB設計拡張（documents テーブル + pg_trgm）"
description: "documents テーブルと全文検索インデックスの設計追記"
---

あなたは OpsHub の設計ドキュメント担当です。
ドキュメント管理と全文検索に必要なDB設計を追記してください。

## 対象ファイル

1. /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/detail/db/index.md
2. /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/detail/rls/index.md

## 参照

### DB 設計書（フォーマット参照）
最初に対象ファイルを全て読み、既存フォーマットに合わせて追記すること。

### テーブル設計メモ
/home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/plans/phase-2-4-plan.md

## DD-DB-015 documents テーブル

### テーブル定義（plan参照）
```sql
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    project_id UUID REFERENCES projects(id),
    name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL DEFAULT 0,
    mime_type TEXT NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Index
- `idx_documents_tenant_project (tenant_id, project_id)`

### RLS ポリシー
| ポリシー | 条件 |
|---|---|
| `documents_select` | プロジェクトメンバーは閲覧可能 |
| `documents_insert` | PM / Tenant Admin のみ |
| `documents_delete` | PM / Tenant Admin のみ |

## 全文検索インデックス（pg_trgm）

ADR-0006 の決定に基づき、以下の GIN インデックスを設計:

```sql
-- pg_trgm 拡張を有効化
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 検索対象テーブルにGINインデックス追加
CREATE INDEX idx_workflows_title_trgm ON workflows USING gin (title gin_trgm_ops);
CREATE INDEX idx_projects_name_trgm ON projects USING gin (name gin_trgm_ops);
CREATE INDEX idx_tasks_title_trgm ON tasks USING gin (title gin_trgm_ops);
CREATE INDEX idx_expenses_description_trgm ON expenses USING gin (description gin_trgm_ops);
```

これを DB 設計書の「検索」セクションとして追記。

## 検証
```
cd /home/garchomp-game/workspace/starlight-test/opsHub-doc && npm run build
```

## ウォークスルー出力先
/home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/r13-3-db-documents-search.md
