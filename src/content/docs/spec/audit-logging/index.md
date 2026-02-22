---
title: 監査ログ方針
description: 誰が・いつ・何をしたかを確実に記録する設計方針
---

## 目的 / In-Out / Related
- **目的**: 監査要件（NFR-05）を満たす監査ログの設計方針を定める
- **対象範囲（In）**: 記録対象、記録内容、保持・参照方針
- **対象範囲（Out）**: テーブル定義の詳細（→ DD-DB-audit）
- **Related**: [NFR-05](../../requirements/nfr/) / [ADR-0001](../../adr/adr-0001/)

---

## 記録方式

**イベントログ方式**を採用する（ADR-0002相当）。

| 項目 | 方針 |
|---|---|
| 方式 | 専用 `audit_logs` テーブルへの INSERT |
| 記録タイミング | Server Action 内で DB 操作の直後 |
| トランザクション | 業務操作と同一トランザクション内（失敗時は両方ロールバック） |

## 記録内容

| フィールド | 内容 | 例 |
|---|---|---|
| `id` | UUID | — |
| `tenant_id` | テナントID | — |
| `user_id` | 操作者（auth.uid()） | — |
| `action` | 操作種別 | `workflow.submit`, `workflow.approve`, `expense.create` |
| `resource_type` | リソース種別 | `workflow`, `project`, `expense` |
| `resource_id` | リソースID | — |
| `before` | 変更前データ（JSONB） | `{"status": "draft"}` |
| `after` | 変更後データ（JSONB） | `{"status": "submitted"}` |
| `metadata` | 追加情報（JSONB） | `{"ip": "...", "user_agent": "..."}` |
| `created_at` | タイムスタンプ | — |

## 記録対象の操作

| 操作 | アクション名 | 記録 |
|---|---|---|
| 申請作成 | `workflow.create` | ✅ |
| 申請送信 | `workflow.submit` | ✅ |
| 承認 | `workflow.approve` | ✅ |
| 差戻し | `workflow.reject` | ✅ |
| プロジェクト作成/更新/削除 | `project.create/update/delete` | ✅ |
| タスク作成/更新/削除 | `task.create/update/delete` | ✅ |
| 経費申請/承認 | `expense.create/approve` | ✅ |
| 請求書作成/送付 | `invoice.create/send` | ✅ |
| ユーザー招待/ロール変更 | `user.invite/role_change` | ✅ |
| ログイン/ログアウト | `auth.login/logout` | ✅（Auth側で記録） |
| 工数入力 | `timesheet.create/update` | ⚠️ 量が多いため要検討 |

## 改ざん防止

1. `audit_logs` テーブルは **INSERT ONLY**（UPDATE/DELETE を RLS で禁止）
2. `service_role` でも UPDATE/DELETE を許可しない（DB レベルの TRIGGER で防止を検討）
3. 保持期間は最低1年（NFR-05c）

## 参照方法

- **IT Admin / Tenant Admin** が監査ログ画面で閲覧可能
- フィルタ: 期間、ユーザー、アクション種別、リソース種別
- 操作者の特定は「5分以内」（NFR成功指標）

---

## DBトリガ併用（重要テーブルのみ）

> Q4決定: イベントログ中心 + 重要テーブルのみトリガ併用（「全部トリガ」はやらない）

改ざん耐性が特に重要なテーブルのみ、DBトリガーで変更履歴を自動記録する。

| テーブル | トリガ記録 | 理由 |
|---|---|---|
| `user_roles` | ✅ | 権限変更の追跡 |
| `workflows`（status変更時） | ✅ | 承認・差戻し・締めの証跡 |
| `invoices` / `payments` | ✅ | 金額に関わるデータの改ざん防止 |
| その他の業務テーブル | ❌ | Server Action 内のイベントログで十分 |

---

## 未決事項
- 工数入力の監査ログ記録範囲（全件 vs 日次サマリー）
- 監査ログの外部エクスポート形式（CSV/JSON）
