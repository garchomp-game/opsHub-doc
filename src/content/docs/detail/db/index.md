---
title: DB設計（主要テーブル）
description: OpsHub の主要テーブル定義・制約・Index
---

## 目的 / In-Out / Related
- **目的**: 主要テーブルのスキーマを定義し、実装の基盤を確立する
- **対象範囲（In）**: テーブル定義、制約、Index、共通カラム規約
- **対象範囲（Out）**: マイグレーションスクリプト（実装フェーズ）
- **Related**: [ADR-0003](../../adr/adr-0003/) / [ADR-0004](../../adr/adr-0004/) / [ADR-0006](../../adr/adr-0006/) / [ロール定義](../../requirements/roles/) / [RLS設計](../rls/)

---

## 共通カラム規約

全業務テーブルに以下のカラムを必須とする：

| カラム | 型 | 制約 | 用途 |
|---|---|---|---|
| `id` | `uuid` | PK, DEFAULT gen_random_uuid() | 主キー |
| `tenant_id` | `uuid` | NOT NULL, FK→tenants(id) | テナント分離（ADR-0003） |
| `created_by` | `uuid` | NOT NULL, FK→auth.users(id) | 作成者 |
| `updated_by` | `uuid` | FK→auth.users(id) | 最終更新者 |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT now() | 作成日時 |
| `updated_at` | `timestamptz` | NOT NULL, DEFAULT now() | 更新日時（トリガーで自動更新） |

---

## DD-DB-001 tenants（テナント）

| 列名 | 型 | NULL | 制約 | 備考 |
|---|---|---:|---|---|
| id | uuid | NOT NULL | PK | — |
| name | text | NOT NULL | — | テナント表示名 |
| slug | text | NOT NULL | UNIQUE | URL用の識別子 |
| settings | jsonb | — | DEFAULT '{}' | テナント固有設定 |
| workflow_seq | integer | NOT NULL | DEFAULT 0 | WF採番カウンター |
| invoice_seq | integer | NOT NULL | DEFAULT 0 | 請求書採番カウンター |
| deleted_at | timestamptz | — | — | 論理削除日時（30日保持後物理削除） |
| created_at | timestamptz | NOT NULL | DEFAULT now() | — |
| updated_at | timestamptz | NOT NULL | DEFAULT now() | — |

## DD-DB-002 user_roles（ユーザーロール）

| 列名 | 型 | NULL | 制約 | 備考 |
|---|---|---:|---|---|
| id | uuid | NOT NULL | PK | — |
| user_id | uuid | NOT NULL | FK→auth.users(id) | — |
| tenant_id | uuid | NOT NULL | FK→tenants(id) | — |
| role | text | NOT NULL | CHECK(IN member,approver,pm,accounting,it_admin,tenant_admin) | — |
| created_at | timestamptz | NOT NULL | DEFAULT now() | — |

- **UNIQUE**: (user_id, tenant_id, role)
- **Index**: (tenant_id, user_id), (user_id)

## DD-DB-003 projects（プロジェクト）

| 列名 | 型 | NULL | 制約 | 備考 |
|---|---|---:|---|---|
| id | uuid | NOT NULL | PK | — |
| tenant_id | uuid | NOT NULL | FK→tenants | — |
| name | text | NOT NULL | — | プロジェクト名 |
| description | text | — | — | — |
| status | text | NOT NULL | CHECK(IN planning,active,completed,cancelled) | — |
| start_date | date | — | — | — |
| end_date | date | — | — | — |
| pm_id | uuid | NOT NULL | FK→auth.users | プロジェクトマネージャー |
| created_by | uuid | NOT NULL | FK→auth.users | — |
| updated_by | uuid | — | FK→auth.users | — |
| created_at | timestamptz | NOT NULL | DEFAULT now() | — |
| updated_at | timestamptz | NOT NULL | DEFAULT now() | — |

- **Index**: (tenant_id, status), (tenant_id, pm_id)

## DD-DB-004 project_members（プロジェクトメンバー）

| 列名 | 型 | NULL | 制約 | 備考 |
|---|---|---:|---|---|
| id | uuid | NOT NULL | PK | — |
| project_id | uuid | NOT NULL | FK→projects | — |
| user_id | uuid | NOT NULL | FK→auth.users | — |
| tenant_id | uuid | NOT NULL | FK→tenants | 非正規化（RLS高速化） |
| created_at | timestamptz | NOT NULL | DEFAULT now() | — |

- **UNIQUE**: (project_id, user_id)
- **Index**: (tenant_id, user_id)

## DD-DB-005 tasks（タスク）

| 列名 | 型 | NULL | 制約 | 備考 |
|---|---|---:|---|---|
| id | uuid | NOT NULL | PK | — |
| tenant_id | uuid | NOT NULL | FK→tenants | — |
| project_id | uuid | NOT NULL | FK→projects | — |
| title | text | NOT NULL | — | — |
| description | text | — | — | — |
| status | text | NOT NULL | CHECK(IN todo,in_progress,done) DEFAULT 'todo' | — |
| assignee_id | uuid | — | FK→auth.users | 担当者 |
| due_date | date | — | — | — |
| created_by | uuid | NOT NULL | FK→auth.users | — |
| created_at | timestamptz | NOT NULL | DEFAULT now() | — |
| updated_at | timestamptz | NOT NULL | DEFAULT now() | — |

- **Index**: (tenant_id, project_id), (tenant_id, assignee_id)

## DD-DB-006 workflows（ワークフロー/申請）

| 列名 | 型 | NULL | 制約 | 備考 |
|---|---|---:|---|---|
| id | uuid | NOT NULL | PK | — |
| tenant_id | uuid | NOT NULL | FK→tenants | — |
| workflow_number | text | NOT NULL | UNIQUE per tenant | 表示用 WF-001 等 |
| type | text | NOT NULL | CHECK(IN expense,leave,purchase,other) | 申請種別 |
| title | text | NOT NULL | — | — |
| description | text | — | — | — |
| status | text | NOT NULL | CHECK(IN draft,submitted,approved,rejected,withdrawn) DEFAULT 'draft' | — |
| amount | numeric(12,2) | — | — | 金額（経費等） |
| date_from | date | — | — | 期間開始 |
| date_to | date | — | — | 期間終了 |
| approver_id | uuid | — | FK→auth.users | 承認者 |
| rejection_reason | text | — | — | 差戻し理由 |
| created_by | uuid | NOT NULL | FK→auth.users | 申請者 |
| approved_at | timestamptz | — | — | 承認日時 |
| created_at | timestamptz | NOT NULL | DEFAULT now() | — |
| updated_at | timestamptz | NOT NULL | DEFAULT now() | — |

- **Index**: (tenant_id, status), (tenant_id, created_by), (tenant_id, approver_id, status)

## DD-DB-007 timesheets（工数）

| 列名 | 型 | NULL | 制約 | 備考 |
|---|---|---:|---|---|
| id | uuid | NOT NULL | PK | — |
| tenant_id | uuid | NOT NULL | FK→tenants | — |
| user_id | uuid | NOT NULL | FK→auth.users | — |
| project_id | uuid | NOT NULL | FK→projects | — |
| task_id | uuid | — | FK→tasks | — |
| work_date | date | NOT NULL | — | 作業日 |
| hours | numeric(4,2) | NOT NULL | CHECK(0〜24), 0.25刻み | — |
| note | text | — | — | — |
| created_at | timestamptz | NOT NULL | DEFAULT now() | — |
| updated_at | timestamptz | NOT NULL | DEFAULT now() | — |

- **UNIQUE**: (user_id, project_id, task_id, work_date)
- **Index**: (tenant_id, user_id, work_date), (tenant_id, project_id, work_date)

## DD-DB-008 expenses（経費）

| 列名 | 型 | NULL | 制約 | 備考 |
|---|---|---:|---|---|
| id | uuid | NOT NULL | PK | — |
| tenant_id | uuid | NOT NULL | FK→tenants | — |
| workflow_id | uuid | — | FK→workflows | 申請連動 |
| project_id | uuid | — | FK→projects | 紐付けPJ |
| category | text | NOT NULL | — | 科目（交通費/宿泊費/消耗品等） |
| amount | numeric(12,2) | NOT NULL | — | — |
| expense_date | date | NOT NULL | — | 発生日 |
| description | text | — | — | — |
| receipt_url | text | — | — | Storage パス |
| created_by | uuid | NOT NULL | FK→auth.users | — |
| created_at | timestamptz | NOT NULL | DEFAULT now() | — |
| updated_at | timestamptz | NOT NULL | DEFAULT now() | — |

- **Index**: (tenant_id, created_by), (tenant_id, project_id)

## DD-DB-009 audit_logs（監査ログ）

| 列名 | 型 | NULL | 制約 | 備考 |
|---|---|---:|---|---|
| id | uuid | NOT NULL | PK | — |
| tenant_id | uuid | NOT NULL | FK→tenants | — |
| user_id | uuid | NOT NULL | FK→auth.users | 操作者 |
| action | text | NOT NULL | — | workflow.approve 等 |
| resource_type | text | NOT NULL | — | workflow, project 等 |
| resource_id | uuid | — | — | 対象リソースID |
| before_data | jsonb | — | — | 変更前 |
| after_data | jsonb | — | — | 変更後 |
| metadata | jsonb | — | DEFAULT '{}' | IP, UA 等 |
| created_at | timestamptz | NOT NULL | DEFAULT now() | — |

- **Index**: (tenant_id, created_at DESC), (tenant_id, resource_type, resource_id), (tenant_id, user_id)
- **制約**: INSERT ONLY（UPDATE/DELETE禁止のRLSポリシー）

## DD-DB-010 notifications（通知）

| 列名 | 型 | NULL | 制約 | 備考 |
|---|---|---:|---|---|
| id | uuid | NOT NULL | PK | — |
| tenant_id | uuid | NOT NULL | FK→tenants | — |
| user_id | uuid | NOT NULL | FK→auth.users | 通知先 |
| type | text | NOT NULL | — | workflow_submitted, workflow_approved 等 |
| title | text | NOT NULL | — | — |
| body | text | — | — | — |
| resource_type | text | — | — | リンク先のリソース種別 |
| resource_id | uuid | — | — | リンク先ID |
| is_read | boolean | NOT NULL | DEFAULT false | — |
| created_at | timestamptz | NOT NULL | DEFAULT now() | — |

- **Index**: (tenant_id, user_id, is_read, created_at DESC)

## DD-DB-011 workflow_attachments（申請添付ファイル）

| 列名 | 型 | NULL | 制約 | 備考 |
|---|---|---:|---|---|
| id | uuid | NOT NULL | PK | — |
| tenant_id | uuid | NOT NULL | FK→tenants | — |
| workflow_id | uuid | NOT NULL | FK→workflows ON DELETE CASCADE | — |
| file_name | text | NOT NULL | — | 元のファイル名 |
| file_size | integer | NOT NULL | CHECK(> 0 AND <= 10485760) | 最大10MB |
| content_type | text | NOT NULL | — | MIME type |
| storage_path | text | NOT NULL | — | Supabase Storage パス |
| uploaded_by | uuid | NOT NULL | FK→auth.users | — |
| created_at | timestamptz | NOT NULL | DEFAULT now() | — |

- **Index**: (tenant_id, workflow_id)
- **制約**: 1申請あたり最大5ファイル（アプリ層で制御）

## DD-DB-012 profiles（ユーザープロファイル）

auth.users の補助テーブル。Supabase 公式推奨パターンに準拠し、表示名・アバターを管理する。  
テナント横断で 1 ユーザー 1 レコード（`tenant_id` を持たない）。

| 列名 | 型 | NULL | 制約 | 備考 |
|---|---|---:|---|---|
| id | uuid | NOT NULL | PK, FK→auth.users(id) ON DELETE CASCADE | auth.users と 1:1 |
| display_name | text | NOT NULL | — | 表示名（UI 表示用） |
| avatar_url | text | — | — | プロフィール画像 URL |
| updated_at | timestamptz | NOT NULL | DEFAULT now() | トリガーで自動更新 |

- **RLS**: 同テナントメンバーの profiles を SELECT 可 / 本人のみ UPDATE 可 / INSERT はトリガー経由
- **Related**: [ADR-0004](../../adr/adr-0004/) / [profiles テーブル設計調査](../../research/profiles-table/)

## DD-DB-013 invoices（請求書）

| 列名 | 型 | NULL | 制約 | 備考 |
|---|---|---:|---|---|
| id | uuid | NOT NULL | PK | — |
| tenant_id | uuid | NOT NULL | FK→tenants(id) | — |
| invoice_number | text | NOT NULL | UNIQUE per tenant | INV-YYYY-NNNN 形式 |
| project_id | uuid | — | FK→projects(id) | 紐付けPJ |
| client_name | text | NOT NULL | — | 請求先名 |
| issued_date | date | NOT NULL | — | 発行日 |
| due_date | date | NOT NULL | — | 支払期限 |
| subtotal | numeric(12,0) | NOT NULL | DEFAULT 0 | 小計 |
| tax_rate | numeric(5,2) | NOT NULL | DEFAULT 10.00 | 税率（%） |
| tax_amount | numeric(12,0) | NOT NULL | DEFAULT 0 | 税額 |
| total_amount | numeric(12,0) | NOT NULL | DEFAULT 0 | 合計金額 |
| status | text | NOT NULL | CHECK(IN draft,sent,paid,cancelled) DEFAULT 'draft' | — |
| notes | text | — | — | 備考 |
| created_by | uuid | NOT NULL | FK→auth.users(id) | 作成者 |
| created_at | timestamptz | NOT NULL | DEFAULT now() | — |
| updated_at | timestamptz | NOT NULL | DEFAULT now() | トリガーで自動更新 |

- **Index**: (tenant_id, status), (tenant_id, project_id), (tenant_id, created_at DESC)
- **採番**: `invoice_number` は `next_invoice_number(p_tenant_id)` RPC で発行。`tenants.invoice_seq` を使用
- **状態遷移**: [請求書ステータス遷移](../sequences/#請求書ステータス遷移) を参照

## DD-DB-014 invoice_items（請求明細）

| 列名 | 型 | NULL | 制約 | 備考 |
|---|---|---:|---|---|
| id | uuid | NOT NULL | PK | — |
| tenant_id | uuid | NOT NULL | FK→tenants(id) | — |
| invoice_id | uuid | NOT NULL | FK→invoices(id) ON DELETE CASCADE | 親請求書 |
| description | text | NOT NULL | — | 明細内容 |
| quantity | numeric(10,2) | NOT NULL | DEFAULT 1 | 数量 |
| unit_price | numeric(12,0) | NOT NULL | — | 単価 |
| amount | numeric(12,0) | NOT NULL | — | 金額（quantity × unit_price の非正規化） |
| sort_order | integer | NOT NULL | DEFAULT 0 | 表示順 |
| created_at | timestamptz | NOT NULL | DEFAULT now() | — |

- **Index**: (tenant_id, invoice_id)
- **CASCADE**: 請求書削除時に明細も自動削除（`ON DELETE CASCADE`）
- **非正規化**: `amount` は `quantity * unit_price` の計算結果を保存。アプリ層で整合性を保証

## DD-DB-015 documents（ドキュメント）

| 列名 | 型 | NULL | 制約 | 備考 |
|---|---|---:|---|---|
| id | uuid | NOT NULL | PK | — |
| tenant_id | uuid | NOT NULL | FK→tenants(id) | — |
| project_id | uuid | — | FK→projects(id) | 紐付けPJ（任意） |
| name | text | NOT NULL | — | ファイル表示名 |
| file_path | text | NOT NULL | — | Supabase Storage パス |
| file_size | bigint | NOT NULL | DEFAULT 0 | ファイルサイズ（バイト） |
| mime_type | text | NOT NULL | — | MIME type |
| uploaded_by | uuid | NOT NULL | FK→auth.users(id) | アップロード者 |
| created_at | timestamptz | NOT NULL | DEFAULT now() | — |
| updated_at | timestamptz | NOT NULL | DEFAULT now() | トリガーで自動更新 |

- **Index**: (tenant_id, project_id)
- **Related**: [SCR-F01](../../spec/screens/SCR-F01/) / [API-F01](../../spec/apis/API-F01/)

---

## 全文検索インデックス（pg_trgm）

[ADR-0006](../../adr/adr-0006/) の決定に基づき、`pg_trgm` 拡張と GIN インデックスを使用した日本語対応の部分一致検索を実現する。

### 拡張の有効化

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

### GIN インデックス一覧

| 対象テーブル | カラム | インデックス名 |
|---|---|---|
| workflows | title, description | `idx_workflows_search` |
| projects | name, description | `idx_projects_search` |
| tasks | title | `idx_tasks_search` |
| expenses | description | `idx_expenses_search` |
| documents | name | `idx_documents_search` |

```sql
CREATE INDEX idx_workflows_search ON workflows USING GIN (title gin_trgm_ops, description gin_trgm_ops);
CREATE INDEX idx_projects_search ON projects USING GIN (name gin_trgm_ops, description gin_trgm_ops);
CREATE INDEX idx_tasks_search ON tasks USING GIN (title gin_trgm_ops);
CREATE INDEX idx_expenses_search ON expenses USING GIN (description gin_trgm_ops);
CREATE INDEX idx_documents_search ON documents USING GIN (name gin_trgm_ops);
```

> [!NOTE]
> `gin_trgm_ops` は 3-gram 分割による部分一致検索を実現。LIKE/ILIKE クエリおよび `%` ワイルドカード検索が GIN インデックスで高速化される。
> 日本語は 3 文字以上の検索語で効果的に機能する。
> workflows / projects は `title`（`name`）+ `description` の複合 GIN インデックスにより、一つのインデックスで複数カラムの部分一致検索に対応する。

---

## RPC 関数

### next_workflow_number(p_tenant_id uuid) → text

並行安全なワークフロー番号の採番関数。`SELECT FOR UPDATE` で `tenants.workflow_seq` を行ロックし、インクリメント後に `WF-001` 形式のテキストを返す。

| 引数 | 型 | 説明 |
|---|---|---|
| p_tenant_id | uuid | 対象テナントID |

| 戻り値 | 型 | 例 |
|---|---|---|
| workflow_number | text | `WF-001`, `WF-042` |

- **SECURITY DEFINER**: サービスロールで実行
- **並行制御**: `FOR UPDATE` 行ロックにより同時採番でも重複なし

### next_invoice_number(p_tenant_id uuid) → text

`next_workflow_number` と同方式の並行安全な請求書番号の採番関数。`SELECT FOR UPDATE` で `tenants.invoice_seq` を行ロックし、インクリメント後に `INV-{YYYY}-{NNNN}` 形式のテキストを返す。

| 引数 | 型 | 説明 |
|---|---|---|
| p_tenant_id | uuid | 対象テナントID |

| 戻り値 | 型 | 例 |
|---|---|---|
| invoice_number | text | `INV-2026-0001`, `INV-2026-0042` |

- **SECURITY DEFINER**: サービスロールで実行
- **並行制御**: `FOR UPDATE` 行ロックにより同時採番でも重複なし
  - 年が変わった場合のリセット処理はアプリ層で判断

---

## トリガー / 関数

### handle_new_user() — profiles 自動作成

`auth.users` への INSERT 時に `profiles` レコードを自動作成するトリガー関数。

| 項目 | 値 |
|---|---|
| トリガー名 | `on_auth_user_created` |
| イベント | AFTER INSERT ON `auth.users` |
| 関数 | `public.handle_new_user()` |
| SECURITY | DEFINER |
| display_name 決定ロジック | `COALESCE(raw_user_meta_data->>'name', email, 'Unknown')` |
| 重複時 | `ON CONFLICT (id) DO UPDATE SET display_name = EXCLUDED.display_name` |

### handle_user_updated() — profiles 同期

`auth.users` の `raw_user_meta_data->>'name'` 変更時に `profiles.display_name` を同期するトリガー関数。

| 項目 | 値 |
|---|---|
| トリガー名 | `on_auth_user_updated` |
| イベント | AFTER UPDATE ON `auth.users` |
| 関数 | `public.handle_user_updated()` |
| SECURITY | DEFINER |
| 条件 | `NEW.raw_user_meta_data->>'name' IS DISTINCT FROM OLD.raw_user_meta_data->>'name'` |

### profiles_updated_at — updated_at 自動更新

| 項目 | 値 |
|---|---|
| トリガー名 | `profiles_updated_at` |
| イベント | BEFORE UPDATE ON `public.profiles` |
| 関数 | `public.update_updated_at()` |

---

## ER図（主要テーブル）

```mermaid
erDiagram
    tenants ||--o{ user_roles : has
    tenants ||--o{ projects : has
    tenants ||--o{ workflows : has
    tenants ||--o{ audit_logs : has
    tenants ||--o{ invoices : has
    tenants ||--o{ documents : has

    auth_users ||--|| profiles : has
    auth_users ||--o{ user_roles : has

    projects ||--o{ project_members : has
    projects ||--o{ tasks : has
    projects ||--o{ timesheets : has
    projects ||--o{ expenses : has
    projects ||--o{ invoices : has
    projects ||--o{ documents : has

    tasks ||--o{ timesheets : has

    workflows ||--o{ expenses : links
    workflows ||--o{ workflow_attachments : has

    invoices ||--o{ invoice_items : has

    tenants {
        text name
        text slug
        integer workflow_seq
        integer invoice_seq
        timestamptz deleted_at
    }
    user_roles {
        uuid user_id
        uuid tenant_id
        text role
    }
    profiles {
        uuid id PK
        text display_name
        text avatar_url
        timestamptz updated_at
    }
    projects {
        text name
        text status
        uuid pm_id
    }
    workflows {
        text type
        text status
        uuid approver_id
    }
    timesheets {
        date work_date
        numeric hours
    }
    audit_logs {
        text action
        text resource_type
        jsonb before_data
        jsonb after_data
    }
    invoices {
        text invoice_number
        text status
        numeric total_amount
        uuid project_id
    }
    invoice_items {
        text description
        numeric quantity
        numeric unit_price
        numeric amount
    }
    documents {
        text name
        text file_path
        bigint file_size
        text mime_type
        uuid uploaded_by
    }
```

---

## マイグレーション方針
- **命名**: `YYYYMMDD_HHMMSS_description.sql`（Supabase Migrations 形式）
- **原則**: 前方互換を維持。カラム追加はNULLABLEまたはDEFAULT付きで
- **ロールバック**: 各マイグレーションに対応するdownファイルを用意

## 未決事項
- なし（documents テーブルは DD-DB-015 で定義済み）
