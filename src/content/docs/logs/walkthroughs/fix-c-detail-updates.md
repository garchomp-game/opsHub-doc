---
title: "FIX-C: 詳細設計書修正"
---

## 概要

監査で検出された詳細設計書の記載漏れ・不一致を修正した。

## 修正一覧

### 修正1: audit_logs カラム名の修正

**対象**: `detail/db/index.md` — DD-DB-009 audit_logs

| 修正前 | 修正後 |
|---|---|
| `before` | `before_data` |
| `after` | `after_data` |

マイグレーション・実装に合わせてカラム名を統一。

---

### 修正2: project_members の RLS ポリシー追記

**対象**: `detail/rls/index.md`

マイグレーションで定義済みの3ポリシーを追記:

| ポリシー | 条件 |
|---|---|
| `project_members_select` | テナントメンバーは閲覧可能 |
| `project_members_insert` | PM（担当PJ）/ Tenant Admin のみ追加可能 |
| `project_members_delete` | PM（担当PJ）/ Tenant Admin のみ削除可能 |

---

### 修正3: tasks の RLS ポリシー追記

**対象**: `detail/rls/index.md`

マイグレーションで定義済みの3ポリシーを追記:

| ポリシー | 条件 |
|---|---|
| `tasks_select` | テナントメンバーは閲覧可能 |
| `tasks_insert` | PM（担当PJ）/ Tenant Admin のみ作成可能 |
| `tasks_update` | テナントメンバーは更新可能 |

---

### 修正4: timesheets_select に tenant_admin 条件追記

**対象**: `detail/rls/index.md`

`timesheets_select` ポリシーに `OR has_role(tenant_id, 'tenant_admin')` 条件を追加。

---

### 修正5: timesheets_delete ポリシー追記

**対象**: `detail/rls/index.md`

`timesheets_delete` ポリシーを追記（自分の工数のみ削除可能）。

---

### 修正6: タスク状態遷移図の追記

**対象**: `detail/sequences/index.md`

Mermaid `stateDiagram-v2` 形式で状態遷移図と遷移ルール表を追加:

```
todo → in_progress（着手）
in_progress → todo（差戻し）
in_progress → done（完了）
done → in_progress（再開）
```

---

### 修正7: getCurrentUser() の追記

**対象**: `detail/modules/index.md`

認証ヘルパー一覧に `getCurrentUser(): Promise<CurrentUser | null>` を追加。
未認証でも `null` を返し、例外を投げない点を明記。

---

### 修正8: getNotificationLink() の追記

**対象**: `detail/modules/index.md`

通知リソースからリンク先 URL を生成するヘルパー関数のシグネチャとルーティングルール表を追加。

## 検証

```
cd opsHub-doc && npm run build
```

- **結果**: ✅ 116 pages built, exit code 0
- **ビルド時間**: 26.18s
