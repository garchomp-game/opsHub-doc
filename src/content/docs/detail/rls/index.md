---
title: RLS設計
description: Row Level Security ポリシーの具体定義
---

## 目的 / In-Out / Related
- **目的**: 全業務テーブルのRLSポリシーを定義し、テナント分離とロールベースアクセスを実現する
- **対象範囲（In）**: RLSポリシーのSQL定義、テスト方針
- **対象範囲（Out）**: アプリ層の認可チェック（→ spec/authz）
- **Related**: [ADR-0001](../../adr/ADR-0001/) / [ADR-0003](../../adr/ADR-0003/) / [DB設計](../db/) / [権限/認可](../../spec/authz/)

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

-- テナントメンバーは自テナント情報を閲覧可能
CREATE POLICY "tenant_select" ON tenants FOR SELECT
  USING (id IN (SELECT get_user_tenant_ids()));

-- Tenant Admin のみ自テナント設定を更新可能
CREATE POLICY "tenant_update" ON tenants FOR UPDATE
  USING (has_role(id, 'tenant_admin'));
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

-- 自分の工数 + PM は担当PJの工数を閲覧可能
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
    )
  );

-- 自分の工数のみ作成/更新
CREATE POLICY "timesheets_insert" ON timesheets FOR INSERT
  WITH CHECK (user_id = auth.uid() AND tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "timesheets_update" ON timesheets FOR UPDATE
  USING (user_id = auth.uid() AND tenant_id IN (SELECT get_user_tenant_ids()));
```

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

---

## RLSテスト方針

| テストケース | 検証内容 |
|---|---|
| テナント分離 | テナントAのユーザーがテナントBのデータを取得できないこと |
| ロール制御 | Member が PM 専用操作（プロジェクト作成等）を実行できないこと |
| 自分のデータ | Member が他ユーザーの工数を閲覧/更新できないこと |
| 承認フロー | 承認者以外が申請のステータスを変更できないこと |
| 監査ログ保護 | 全ロールで audit_logs の UPDATE/DELETE ができないこと |

---

## 未決事項
- RLSポリシーのパフォーマンス検証（JOINを伴うポリシーの実行計画）
- `get_user_tenant_ids()` のキャッシュ戦略
