---
title: RLS設計
description: Row Level Security ポリシーの具体定義
---

## 目的 / In-Out / Related
- **目的**: 全業務テーブルのRLSポリシーを定義し、テナント分離とロールベースアクセスを実現する
- **対象範囲（In）**: RLSポリシーのSQL定義、テスト方針
- **対象範囲（Out）**: アプリ層の認可チェック（→ spec/authz）
- **Related**: [ADR-0001](../../adr/adr-0001/) / [ADR-0003](../../adr/adr-0003/) / [DB設計](../db/) / [権限/認可](../../spec/authz/)

---

## RLS共通ヘルパー関数

```sql
-- 現在のユーザーが所属するテナントID一覧を返す
CREATE OR REPLACE FUNCTION get_user_tenant_ids()
RETURNS SETOF uuid
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
  SELECT tenant_id FROM user_roles WHERE user_id = auth.uid()
$$;

-- 現在のユーザーが指定テナント内で指定ロールを持つか
CREATE OR REPLACE FUNCTION has_role(p_tenant_id uuid, p_role text)
RETURNS boolean
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
      AND tenant_id = p_tenant_id
      AND role = p_role
  )
$$;
```

---

## テーブル別ポリシー

### tenants
```sql
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- テナントメンバーは自テナント情報を閲覧可能（論理削除済みを除外）
CREATE POLICY "tenant_select" ON tenants FOR SELECT
  USING (
    id IN (SELECT get_user_tenant_ids())
    AND deleted_at IS NULL
  );

-- Tenant Admin のみ自テナント設定を更新可能（論理削除済みを除外）
CREATE POLICY "tenant_update" ON tenants FOR UPDATE
  USING (
    has_role(id, 'tenant_admin')
    AND deleted_at IS NULL
  );
```

> [!NOTE]
> `deleted_at IS NULL` 条件は [20260224_000001_tenant_soft_delete](file:///home/garchomp-game/workspace/starlight-test/OpsHub/supabase/migrations/20260224_000001_tenant_soft_delete.sql) マイグレーションで追加。
> 論理削除されたテナントは SELECT / UPDATE ともに RLS レベルで不可視となる。

### profiles
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 同テナントメンバーの profiles を閲覧可能 + 自分のプロファイルは常に閲覧可能
CREATE POLICY "profiles_select" ON profiles FOR SELECT
  USING (
    id IN (
      SELECT ur.user_id FROM user_roles ur
      WHERE ur.tenant_id IN (SELECT get_user_tenant_ids())
    )
    OR id = auth.uid()
  );

-- 自分のプロファイルのみ更新可能
CREATE POLICY "profiles_update" ON profiles FOR UPDATE
  USING (id = auth.uid());

-- INSERT はトリガー関数（SECURITY DEFINER）経由のみ
-- auth.users 作成時に handle_new_user() が自動挿入するため、直接 INSERT は不要
CREATE POLICY "profiles_insert" ON profiles FOR INSERT
  WITH CHECK (true);

-- DELETE ポリシーなし（auth.users の ON DELETE CASCADE で自動削除）
```

### user_roles
```sql
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- 同テナントメンバーのロール一覧を閲覧可能
CREATE POLICY "user_roles_select" ON user_roles FOR SELECT
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- Tenant Admin のみロール付与/削除
CREATE POLICY "user_roles_insert" ON user_roles FOR INSERT
  WITH CHECK (has_role(tenant_id, 'tenant_admin'));

CREATE POLICY "user_roles_delete" ON user_roles FOR DELETE
  USING (has_role(tenant_id, 'tenant_admin'));
```

### projects
```sql
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- テナントメンバーは自テナントのプロジェクトを閲覧可能
CREATE POLICY "projects_select" ON projects FOR SELECT
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- PM / Tenant Admin のみ作成可能
CREATE POLICY "projects_insert" ON projects FOR INSERT
  WITH CHECK (
    has_role(tenant_id, 'pm') OR has_role(tenant_id, 'tenant_admin')
  );

-- PM（自分が管理するPJ）/ Tenant Admin のみ更新
CREATE POLICY "projects_update" ON projects FOR UPDATE
  USING (
    (pm_id = auth.uid() AND has_role(tenant_id, 'pm'))
    OR has_role(tenant_id, 'tenant_admin')
  );
```

### project_members
```sql
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

-- テナントメンバーは自テナントのプロジェクトメンバーを閲覧可能
CREATE POLICY "project_members_select" ON project_members FOR SELECT
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- PM（担当PJ）/ Tenant Admin のみメンバー追加可能
CREATE POLICY "project_members_insert" ON project_members FOR INSERT
  WITH CHECK (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND (
      EXISTS (SELECT 1 FROM projects WHERE projects.id = project_id AND projects.pm_id = auth.uid())
      OR has_role(tenant_id, 'tenant_admin')
    )
  );

-- PM（担当PJ）/ Tenant Admin のみメンバー削除可能
CREATE POLICY "project_members_delete" ON project_members FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = project_id AND projects.pm_id = auth.uid())
    OR has_role(tenant_id, 'tenant_admin')
  );
```

### tasks
```sql
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- テナントメンバーは自テナントのタスクを閲覧可能
CREATE POLICY "tasks_select" ON tasks FOR SELECT
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- PM（担当PJ）/ Tenant Admin のみタスク作成可能
CREATE POLICY "tasks_insert" ON tasks FOR INSERT
  WITH CHECK (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND (
      EXISTS (SELECT 1 FROM projects WHERE projects.id = project_id AND projects.pm_id = auth.uid())
      OR has_role(tenant_id, 'tenant_admin')
    )
  );

-- テナントメンバーはタスク更新可能
CREATE POLICY "tasks_update" ON tasks FOR UPDATE
  USING (tenant_id IN (SELECT get_user_tenant_ids()));
```

### workflows
```sql
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;

-- 申請者は自分の申請を閲覧、承認者は承認対象を閲覧
CREATE POLICY "workflows_select" ON workflows FOR SELECT
  USING (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND (created_by = auth.uid() OR approver_id = auth.uid()
         OR has_role(tenant_id, 'tenant_admin'))
  );

-- テナントメンバーは申請を作成可能
CREATE POLICY "workflows_insert" ON workflows FOR INSERT
  WITH CHECK (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND created_by = auth.uid()
  );

-- 申請者は下書き更新可能、承認者はステータス更新可能
CREATE POLICY "workflows_update" ON workflows FOR UPDATE
  USING (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND (
      (created_by = auth.uid() AND status IN ('draft', 'rejected'))
      OR (approver_id = auth.uid() AND status = 'submitted')
      OR has_role(tenant_id, 'tenant_admin')
    )
  );
```

### timesheets
```sql
ALTER TABLE timesheets ENABLE ROW LEVEL SECURITY;

-- 自分の工数 + PM は担当PJの工数を閲覧可能 + Tenant Admin は全件閲覧
CREATE POLICY "timesheets_select" ON timesheets FOR SELECT
  USING (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND (
      user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = timesheets.project_id
          AND projects.pm_id = auth.uid()
      )
      OR has_role(tenant_id, 'tenant_admin')
    )
  );

-- 自分の工数のみ作成/更新
CREATE POLICY "timesheets_insert" ON timesheets FOR INSERT
  WITH CHECK (user_id = auth.uid() AND tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "timesheets_update" ON timesheets FOR UPDATE
  USING (user_id = auth.uid() AND tenant_id IN (SELECT get_user_tenant_ids()));

-- 自分の工数のみ削除可能
CREATE POLICY "timesheets_delete" ON timesheets FOR DELETE
  USING (user_id = auth.uid() AND tenant_id IN (SELECT get_user_tenant_ids()));
```

### expenses
```sql
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- 作成者は自分の経費を閲覧、Accounting / Tenant Admin は全件閲覧
CREATE POLICY "expenses_select" ON expenses FOR SELECT
  USING (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND (
      created_by = auth.uid()
      OR has_role(tenant_id, 'accounting')
      OR has_role(tenant_id, 'tenant_admin')
    )
  );

-- 認証済みテナントメンバーのみ作成可能
CREATE POLICY "expenses_insert" ON expenses FOR INSERT
  WITH CHECK (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND created_by = auth.uid()
  );

-- 作成者本人で、紐づくワークフローが draft 状態の場合のみ更新可能
-- Accounting / Tenant Admin も更新可能
CREATE POLICY "expenses_update" ON expenses FOR UPDATE
  USING (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND (
      created_by = auth.uid()
      OR has_role(tenant_id, 'accounting')
      OR has_role(tenant_id, 'tenant_admin')
    )
  );
```

> [!IMPORTANT]
> expenses の UPDATE は RLS レベルでは作成者 + 管理ロールに許可し、
> ワークフロー status = 'draft' のチェックは **アプリ層（Server Action）で実施** する。
> RLS で workflow テーブルを JOIN すると実行計画が複雑化するため、レイヤー分離を選択。

### audit_logs
```sql
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- IT Admin / Tenant Admin のみ閲覧
CREATE POLICY "audit_logs_select" ON audit_logs FOR SELECT
  USING (
    has_role(tenant_id, 'it_admin') OR has_role(tenant_id, 'tenant_admin')
  );

-- Server Action から INSERT のみ（ユーザー権限で記録）
CREATE POLICY "audit_logs_insert" ON audit_logs FOR INSERT
  WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

-- UPDATE/DELETE は一切禁止（ポリシーなし = 拒否）
```

### notifications
```sql
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 自分宛の通知のみ閲覧可能
CREATE POLICY "notifications_select" ON notifications FOR SELECT
  USING (
    user_id = auth.uid()
    AND tenant_id IN (SELECT get_user_tenant_ids())
  );

-- 自分宛の通知のみ更新可能（既読マーク等）
CREATE POLICY "notifications_update" ON notifications FOR UPDATE
  USING (
    user_id = auth.uid()
    AND tenant_id IN (SELECT get_user_tenant_ids())
  );

-- Server Action から INSERT（テナントメンバーであれば許可）
CREATE POLICY "notifications_insert" ON notifications FOR INSERT
  WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));
```

### workflow_attachments
```sql
ALTER TABLE workflow_attachments ENABLE ROW LEVEL SECURITY;

-- テナントメンバーは自テナントの添付ファイルメタデータを閲覧可能
CREATE POLICY "workflow_attachments_select" ON workflow_attachments FOR SELECT
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- テナントメンバーが自分のファイルをアップロード可能
CREATE POLICY "workflow_attachments_insert" ON workflow_attachments FOR INSERT
  WITH CHECK (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND uploaded_by = auth.uid()
  );

-- UPDATE/DELETE はポリシーなし（アプリ層で制御）
```

### invoices
```sql
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Accounting / Tenant Admin は全件閲覧、PM は自担当PJの請求のみ閲覧
 CREATE POLICY "invoices_select" ON invoices FOR SELECT
  USING (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND (
      has_role(tenant_id, 'accounting')
      OR has_role(tenant_id, 'tenant_admin')
      OR (
        has_role(tenant_id, 'pm')
        AND project_id IN (
          SELECT id FROM projects WHERE pm_id = auth.uid()
        )
      )
    )
  );

-- Accounting / Tenant Admin のみ作成可能、created_by は自分
 CREATE POLICY "invoices_insert" ON invoices FOR INSERT
  WITH CHECK (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND created_by = auth.uid()
    AND (
      has_role(tenant_id, 'accounting')
      OR has_role(tenant_id, 'tenant_admin')
    )
  );

-- Accounting / Tenant Admin のみ更新可能
CREATE POLICY "invoices_update" ON invoices FOR UPDATE
  USING (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND (
      has_role(tenant_id, 'accounting')
      OR has_role(tenant_id, 'tenant_admin')
    )
  );

-- Accounting / Tenant Admin のみ削除可能、draft 状態のみ
CREATE POLICY "invoices_delete" ON invoices FOR DELETE
  USING (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND status = 'draft'
    AND (
      has_role(tenant_id, 'accounting')
      OR has_role(tenant_id, 'tenant_admin')
    )
  );
```

> [!NOTE]
> PM の SELECT は自担当 PJ の請求のみに制限。全請求一覧にアクセスするには Accounting または Tenant Admin ロールが必要。

### invoice_items
```sql
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- 親 invoices の SELECT 権限に準拠
CREATE POLICY "invoice_items_select" ON invoice_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
        AND invoices.tenant_id = invoice_items.tenant_id
    )
  );

-- 親 invoices の INSERT 権限に準拠
CREATE POLICY "invoice_items_insert" ON invoice_items FOR INSERT
  WITH CHECK (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND (
      has_role(tenant_id, 'accounting')
      OR has_role(tenant_id, 'tenant_admin')
    )
  );

-- 親 invoices の UPDATE 権限に準拠
CREATE POLICY "invoice_items_update" ON invoice_items FOR UPDATE
  USING (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND (
      has_role(tenant_id, 'accounting')
      OR has_role(tenant_id, 'tenant_admin')
    )
  );

-- 親 invoices の DELETE 権限に準拠（CASCADE でも削除される）
CREATE POLICY "invoice_items_delete" ON invoice_items FOR DELETE
  USING (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND (
      has_role(tenant_id, 'accounting')
      OR has_role(tenant_id, 'tenant_admin')
    )
  );
```

> [!IMPORTANT]
> `invoice_items_select` は invoices テーブルへの `EXISTS` サブクエリで制御。
> 親請求書の RLS を経由するため、PM が自 PJ の請求明細を閲覧するケースも自動的にカバーされる。

### documents
```sql
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- プロジェクトメンバーは閲覧可能（project_id が NULL の場合はテナントメンバー全員）
CREATE POLICY "documents_select" ON documents FOR SELECT
  USING (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND (
      project_id IS NULL
      OR EXISTS (
        SELECT 1 FROM project_members
        WHERE project_members.project_id = documents.project_id
          AND project_members.user_id = auth.uid()
      )
      OR has_role(tenant_id, 'pm')
      OR has_role(tenant_id, 'tenant_admin')
    )
  );

-- PM / Tenant Admin のみアップロード可能
CREATE POLICY "documents_insert" ON documents FOR INSERT
  WITH CHECK (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND uploaded_by = auth.uid()
    AND (
      has_role(tenant_id, 'pm')
      OR has_role(tenant_id, 'tenant_admin')
    )
  );

-- PM / Tenant Admin のみ削除可能
CREATE POLICY "documents_delete" ON documents FOR DELETE
  USING (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND (
      has_role(tenant_id, 'pm')
      OR has_role(tenant_id, 'tenant_admin')
    )
  );
```

> [!NOTE]
> documents の UPDATE ポリシーは未定義。ファイルの差し替えは DELETE → INSERT で対応する方針。
> `documents_select` で `project_id IS NULL` のドキュメントはテナント共通ドキュメントとして全メンバーに公開される。

---

## RLSテスト方針

| テストケース | 検証内容 |
|---|---|
| テナント分離 | テナントAのユーザーがテナントBのデータを取得できないこと |
| ロール制御 | Member が PM 専用操作（プロジェクト作成等）を実行できないこと |
| 自分のデータ | Member が他ユーザーの工数を閲覧/更新できないこと |
| 承認フロー | 承認者以外が申請のステータスを変更できないこと |
| 監査ログ保護 | 全ロールで audit_logs の UPDATE/DELETE ができないこと |
| 論理削除テナント | deleted_at が設定されたテナントの SELECT/UPDATE が不可であること |
| プロファイル分離 | 別テナントユーザーの profiles が閲覧できないこと |
| プロファイル更新 | 他ユーザーの profiles を更新できないこと |
| 経費閲覧制限 | Member が他ユーザーの経費を閲覧できないこと |
| 経費管理ロール | Accounting ロールが全経費を閲覧・更新できること |
| 通知分離 | 他ユーザー宛の通知を閲覧できないこと |
| 請求書閲覧制限 | Member が請求書を閲覧できないこと、PM は自 PJ の請求のみ閲覧可能 |
| 請求書作成制限 | Member / PM が請求書を作成できないこと |
| 請求書削除制限 | draft 以外のステータスの請求書を削除できないこと |
| ドキュメント閲覧制限 | プロジェクトメンバー以外がプロジェクト紐付きドキュメントを閲覧できないこと |
| ドキュメント作成制限 | Member がドキュメントをアップロードできないこと（PM / Tenant Admin のみ） |
| ドキュメント削除制限 | Member がドキュメントを削除できないこと（PM / Tenant Admin のみ） |

---

## 未決事項
- RLSポリシーのパフォーマンス検証（JOINを伴うポリシーの実行計画）
- `get_user_tenant_ids()` のキャッシュ戦略
