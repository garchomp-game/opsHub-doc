---
title: "R17-1: トレーサビリティ最終検証"
---

> 監査実施日: 2026-02-25
> 対象: Phase 1〜3 全体の REQ → SCR → API → DD 追跡可能性

---

## 1. REQ → SCR/API マッピング（全 Epic）

### 1.1 Epic A: テナント/組織/権限（Must）

| REQ | 画面一覧 SCR | SCR spec | API spec | DD-DB | RLS | 判定 |
|---|---|---|---|---|---|---|
| REQ-A01 | SCR-A01 ✅ | SCR-A01.md ✅ | API-A01 ✅ | DD-DB-001 ✅ | tenants ✅ | ✅ |
| REQ-A02 | SCR-A02 ✅ | SCR-A02.md ✅ | API-A02 ✅ | DD-DB-002 ✅ | user_roles ✅ | ✅ |
| REQ-A03 | SCR-A03 ✅ | SCR-A03.md ✅ | — ¹ | DD-DB-002 ✅ | user_roles ✅ | ⚠️ |

¹ ロール管理 API は API-A02 に包含。SCR-A03 は監査ログビューアとして再定義済み（画面一覧更新済み）

### 1.2 Epic B: ワークフロー（Must）

| REQ | 画面一覧 SCR | SCR spec | API spec | DD-DB | RLS | 判定 |
|---|---|---|---|---|---|---|
| REQ-B01 | SCR-B02 ✅ | SCR-B02.md ✅ | API-B02 ✅ | DD-DB-006 ✅ | workflows ✅ | ✅ |
| REQ-B02 | SCR-B03 ✅ | SCR-B03.md ✅ | API-B03 ✅ | DD-DB-006 ✅ | workflows ✅ | ✅ |
| REQ-B03 | SCR-B01 ✅ | SCR-B01.md ✅ | API-B01 ✅ | DD-DB-006 ✅ | workflows ✅ | ✅ |

### 1.3 Epic C: 案件/タスク/工数（Must）

| REQ | 画面一覧 SCR | SCR spec | API spec | DD-DB | RLS | 判定 |
|---|---|---|---|---|---|---|
| REQ-C01 | SCR-C01-1/C01-2 ✅ | ✅ 両方 | API-C01 ✅ | DD-DB-003/004 ✅ | projects ✅ / PM ✅ | ✅ |
| REQ-C02 | SCR-C02 ✅ | ✅ | API-C02 ✅ | DD-DB-005 ✅ | tasks ✅ | ✅ |
| REQ-C03 | SCR-C03-1/C03-2 ✅ | ✅ 両方 | API-C03-1/C03-2 ✅ | DD-DB-007 ✅ | timesheets ✅ | ✅ |

### 1.4 Epic D: 経費（Should）

| REQ | 画面一覧 SCR | SCR spec | API spec | DD-DB | RLS | 判定 |
|---|---|---|---|---|---|---|
| REQ-D01 | SCR-D01 ✅ | SCR-D01.md ✅ | API-D01 ✅ | DD-DB-008 ✅ | expenses ✅ | ✅ |
| REQ-D02 | SCR-D03 ✅ | SCR-D03.md ✅ | API-D02 ✅ | DD-DB-008 ✅ | expenses ✅ | ✅ 🆕 |

> **Phase 1→2 変更**: SCR-D03 / API-D02 が Phase 2 で作成され、REQ-D02 はフルカバーに

### 1.5 Epic E: 請求（Should）

| REQ | 画面一覧 SCR | SCR spec | API spec | DD-DB | RLS | 判定 |
|---|---|---|---|---|---|---|
| REQ-E01 | SCR-H01/H02 ✅ | SCR-H01.md/H02.md ✅ | API-H01 ✅ | DD-DB-013/014 ✅ | invoices/items ✅ | ✅ 🆕 |

> **Phase 1→2 変更**: SCR-H01/H02 / API-H01 / DD-DB-013/014 が Phase 2 で作成。旧 SCR-E01 は通知機能のため、請求は SCR-H01/H02 として採番。画面一覧も更新済み

### 1.6 Epic F: ドキュメント（Could）

| REQ | 画面一覧 SCR | SCR spec | API spec | DD-DB | RLS | 判定 |
|---|---|---|---|---|---|---|
| REQ-F01 | SCR-F01 ✅ | SCR-F01.md ✅ | API-F01 ✅ | DD-DB-015 ✅ | documents ✅ | ✅ 🆕 |

> **Phase 1→3 変更**: SCR-F01 / API-F01 / DD-DB-015 が Phase 3 で作成され、REQ-F01 はフルカバーに

### 1.7 Epic G: 通知/検索/レポート（Could）

| REQ | 画面一覧 SCR | SCR spec | API spec | DD-DB | RLS | 判定 |
|---|---|---|---|---|---|---|
| REQ-G01 | SCR-G01 ✅ | SCR-E01.md ✅ ¹ | API-E01 ✅ | DD-DB-010 ✅ | notifications ✅ | ✅ |
| REQ-G02 | SCR-G02 ✅ | SCR-G02.md ✅ | API-G01 ✅ | pg_trgm GIN ✅ | — ² | ✅ 🆕 |
| REQ-G03 | SCR-002 ✅ | SCR-002.md ✅ | — ³ | — | — | ✅ |

¹ 通知機能は SCR-E01 として実装済み（画面一覧では SCR-G01 として記載、spec ファイルは SCR-E01.md）
² 全文検索は読み取り専用で既存テーブルの RLS に依存
³ ダッシュボードは Server Component 直接取得のため API spec 不要

> **Phase 1→3 変更**: SCR-G02 / API-G01 / pg_trgm GIN インデックスが Phase 3 で作成され、REQ-G02 はフルカバーに

### 1.8 Epic H（追加）: 請求サブ番号系

> 画面一覧では Epic E の請求機能を SCR-H01/H02 として採番（SCR-E01 番号衝突の解決策）

---

## 2. SCR → Related リンク検証

### 2.1 Phase 2-3 追加画面（全て ✅）

| SCR | REQ参照 | API参照 | DD参照 | 判定 |
|---|---|---|---|---|
| SCR-D03 | REQ-D02 ✅ | SPEC-API-D02 ✅ | DD-DB-008 ✅ | ✅ |
| SCR-F01 | REQ-F01 ✅ | SPEC-API-F01 ✅ | DD-DB-015 ✅ | ✅ |
| SCR-G02 | REQ-G02 ✅ | SPEC-API-G01 ✅ | — (ADR-0006) | ✅ |
| SCR-H01 | REQ-E01 ✅ | SPEC-API-H01 ✅ | DD-DB-013 ✅ | ✅ |
| SCR-H02 | REQ-E01 ✅ | SPEC-API-H01 ✅ | DD-DB-013/014 ✅ | ✅ |

### 2.2 Phase 1 既存画面（残存課題）

| SCR | 課題 | 判定 |
|---|---|---|
| SCR-E01 | REQ-G01 参照なし（Related に REQ 未記載） | ⚠️→ 修正 |
| SCR-A03 | REQ-A03 参照なし（Related に REQ 未記載） | ⚠️→ 修正 |
| SCR-A01 | API-A01 参照なし | ⚠️→ 修正 |
| SCR-A02 | API-A02 参照なし | ⚠️→ 修正 |
| SCR-C01-2 | API-C01 参照なし | ⚠️→ 修正 |
| SCR-C02 | API-C02 参照なし | ⚠️→ 修正 |
| SCR-C03-2 | API-C03-2 参照なし | ⚠️→ 修正 |

---

## 3. API → Related リンク検証

### 3.1 Phase 2-3 追加 API（全て ✅）

| API | REQ参照 | SCR参照 | DD参照 | 判定 |
|---|---|---|---|---|
| API-D02 | REQ-D02 ✅ | SCR-D03 ✅ | DD-DB-008 ✅ | ✅ |
| API-F01 | REQ-F01 ✅ | SPEC-SCR-F01 ✅ | DD-DB-015 ✅ | ✅ |
| API-G01 | REQ-G02 ✅ | SPEC-SCR-G02 ✅ | ADR-0006 ✅ | ✅ |
| API-H01 | REQ-E01 ✅ | SCR-H01/H02 ✅ | DD-DB-013/014 ✅ | ✅ |

### 3.2 Phase 1 既存 API

Phase 1 監査で確認済み、全 API spec に SCR 参照あり ✅

---

## 4. DD → 実テーブル検証

### 4.1 DD-DB 定義一覧

| DD-DB ID | テーブル名 | 定義有無 | RLS定義 | 判定 |
|---|---|---|---|---|
| DD-DB-001 | tenants | ✅ | ✅ SELECT/UPDATE | ✅ |
| DD-DB-002 | user_roles | ✅ | ✅ SELECT/INSERT/DELETE | ✅ |
| DD-DB-003 | projects | ✅ | ✅ SELECT/INSERT/UPDATE | ✅ |
| DD-DB-004 | project_members | ✅ | ✅ SELECT/INSERT/DELETE | ✅ 🔧 |
| DD-DB-005 | tasks | ✅ | ✅ SELECT/INSERT/UPDATE | ✅ 🔧 |
| DD-DB-006 | workflows | ✅ | ✅ SELECT/INSERT/UPDATE | ✅ |
| DD-DB-007 | timesheets | ✅ | ✅ SELECT/INSERT/UPDATE/DELETE | ✅ |
| DD-DB-008 | expenses | ✅ | ✅ SELECT/INSERT/UPDATE | ✅ |
| DD-DB-009 | audit_logs | ✅ | ✅ SELECT/INSERT（UPDATE/DELETE禁止） | ✅ |
| DD-DB-010 | notifications | ✅ | ✅ SELECT/UPDATE/INSERT | ✅ |
| DD-DB-011 | workflow_attachments | ✅ | ✅ SELECT/INSERT | ✅ |
| DD-DB-012 | profiles | ✅ | ✅ SELECT/UPDATE/INSERT | ✅ |
| DD-DB-013 | invoices | ✅ 🆕 | ✅ SELECT/INSERT/UPDATE/DELETE | ✅ |
| DD-DB-014 | invoice_items | ✅ 🆕 | ✅ SELECT/INSERT/UPDATE/DELETE | ✅ |
| DD-DB-015 | documents | ✅ 🆕 | ✅ SELECT/INSERT/DELETE | ✅ |

🔧 Phase 1 監査で欠落が指摘された `project_members` / `tasks` の RLS は定義済みに更新されている

### 4.2 全文検索インデックス

| テーブル | カラム | インデックス名 | 判定 |
|---|---|---|---|
| workflows | title | idx_workflows_title_trgm | ✅ 🆕 |
| projects | name | idx_projects_name_trgm | ✅ 🆕 |
| tasks | title | idx_tasks_title_trgm | ✅ 🆕 |
| expenses | description | idx_expenses_description_trgm | ✅ 🆕 |
| documents | name | idx_documents_name_trgm | ✅ 🆕 |

---

## 5. ADR 一覧の完全性

| ADR | タイトル | ファイル存在 | 一覧記載 | 判定 |
|---|---|---|---|---|
| ADR-0001 | RBAC/RLS 方式の選定 | ✅ ADR-0001.md | ✅ | ✅ |
| ADR-0002 | 監査ログ方式 | ✅ ADR-0002.md | ✅ | ✅ |
| ADR-0003 | マルチテナント分離戦略 | ✅ ADR-0003.md | ✅ | ✅ |
| ADR-0004 | profiles テーブル導入 | ✅ ADR-0004.md | ✅ | ✅ |
| ADR-0005 | Supabase CLI 採用 | ✅ ADR-0005.md | ✅ | ✅ |
| ADR-0006 | 検索方式の選定 | ✅ ADR-0006.md | ✅ | ✅ 🆕 |

---

## 6. Phase 1 監査課題の解消状況

| Phase 1 課題 | 状態 | 備考 |
|---|---|---|
| SCR-D02 spec 未作成 | ✅ 解消 | SCR-D01 に統合、画面一覧で ~~SCR-D02~~ として明示 |
| SCR-D03 spec 未作成 | ✅ 解消 | SCR-D03.md 作成済み |
| SCR-E01 番号衝突 | ✅ 解消 | 請求画面は SCR-H01/H02 として再採番、画面一覧注記済み |
| SCR-A03 用途変更未反映 | ✅ 解消 | 画面一覧で「監査ログビューア」に更新済み |
| project_members RLS なし | ✅ 解消 | SELECT/INSERT/DELETE ポリシー定義済み |
| tasks RLS なし | ✅ 解消 | SELECT/INSERT/UPDATE ポリシー定義済み |
| SCR-F01 / SCR-G02 未作成 | ✅ 解消 | Phase 3 で両方作成済み |
| SCR-E02（請求書編集）未作成 | ✅ 解消 | SCR-H02 として作成済み |
| SCR→API 片方向リンク | ⚠️ 残存 | 本監査で修正 → セクション 7 |
| SCR-E01 REQ参照なし | ⚠️ 残存 | 本監査で修正 → セクション 7 |
| SCR-A03 REQ参照なし | ⚠️ 残存 | 本監査で修正 → セクション 7 |
| REQ Related 欄の更新漏れ | ⚠️ 一部残存 | 本監査で修正 → セクション 7 |

---

## 7. 修正内容

本監査で以下の修正を実施した。

### 7.1 SCR Related リンクの追加

| ファイル | 修正内容 |
|---|---|
| SCR-E01.md | Related に `REQ-G01` を追加 |
| SCR-A03.md | Related に `REQ-A03` を追加 |
| SCR-A01.md | Related に `API-A01` を追加 |
| SCR-A02.md | Related に `API-A02` を追加 |
| SCR-C01-2.md | Related に `API-C01` を追加 |
| SCR-C02.md | Related に `API-C02` を追加 |
| SCR-C03-2.md | Related に `API-C03-2` を追加 |

### 7.2 REQ Related リンクの更新

| ファイル | 修正内容 |
|---|---|
| req-catalog/index.md | REQ-E01: `SPEC-SCR-E01` → `SCR-H01 / SCR-H02 / API-H01` に更新 |
| req-catalog/index.md | REQ-D02: `SPEC-SCR-D02` → `SCR-D03 / API-D02` に更新 |
| req-catalog/index.md | REQ-G02: `ADR-0005` → `SCR-G02 / API-G01 / ADR-0006` に更新 |
| req-catalog/index.md | REQ-A03: SCR-A03 参照を追加 |

---

## 8. 最終判定

| 検証項目 | 結果 |
|---|---|
| REQ → SCR/API マッピング完全性 | ✅ 全 REQ（A〜G + H）に対応する SCR/API が存在 |
| SCR → Related リンク | ✅ 修正後、全 SCR に REQ/API/DD 参照あり |
| API → Related リンク | ✅ 全 API に REQ/SCR/DD 参照あり |
| DD-DB-001〜015 定義 | ✅ 15 テーブル全て定義済み、RLS 完備 |
| ADR-0001〜0006 一覧完全性 | ✅ 6 件全て存在し、一覧に記載 |

> **結論**: Phase 1 監査で指摘された重大欠落（未作成 SCR/API、RLS 欠如、番号衝突）は全て解消済み。
> 本監査で残存していた片方向リンク・Related 欄の更新漏れ 11 件を修正し、全層トレーサビリティが確立された。
