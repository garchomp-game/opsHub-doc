---
title: "監査04: ドキュメント内部品質"
---

> **調査日**: 2026-02-24  
> **対象**: `opsHub-doc/src/content/docs/` 配下 全105ファイル

---

## 1. 用語の統一

### 1.1 アプリ名

| 判定 | ファイル | 行 | 内容 |
|---|---|---|---|
| ❌ | `getting-started/overview.mdx` | L3 | `description: Starlight App プロジェクトの概要` |
| ❌ | `getting-started/overview.mdx` | L11 | `Starlight App は **Next.js** + **Ant Design** + …` |
| ✅ | その他全ファイル | — | 「OpsHub」または言及なし |

> **備考**: `overview.mdx` は Archive ページのため影響は限定的だが、参照される可能性があるため修正推奨。

### 1.2 ロール名の統一（snake_case）

正式なロール名: `member` / `approver` / `pm` / `accounting` / `it_admin` / `tenant_admin`

| 判定 | ファイル | 行 | 表記揺れ | 正しい表記 |
|---|---|---|---|---|
| ⚠️ | `spec/screens/SCR-D01.md` | L27 | `TenantAdmin`（表セル） | `tenant_admin` |
| ⚠️ | `spec/screens/SCR-D01.md` | L151 | `Approver/Accounting/TenantAdmin` | `approver/accounting/tenant_admin` |
| ⚠️ | `spec/apis/API-D01.md` | L25, 135, 173 | `TenantAdmin`（表セル/本文） | `tenant_admin` |
| ⚠️ | `detail/rls/index.md` | L191, 210 | `TenantAdmin`（SQL コメント） | `tenant_admin` |
| ⚠️ | `logs/prompts/doc-tickets.md` | L57, 208 | `TenantAdmin`（タスク記述） | `tenant_admin` |
| ✅ | `spec/authz/index.md` | 全行 | PascalCase は人間向けラベル列のみ使用 | OK |
| ✅ | `requirements/roles/index.md` | 全行 | 英語列に `Tenant Admin` / snake_case は DB 層 | OK |
| ✅ | `adr/ADR-0001.md` | L59 | CHECK 制約で正しい snake_case | OK |

> **判断**: `spec/authz` では「必要ロール」列が PascalCase（`Tenant Admin`）、「チェック方法」列が snake_case（`"tenant_admin"`）で使い分けており妥当。一方、`SCR-D01` / `API-D01` / `detail/rls` のコメント内 `TenantAdmin` は PascalCase が混在しているため統一推奨。

### 1.3 テーブル名・カラム名

全ドキュメントで snake_case が一貫して使用されている。問題なし。

✅ **統一済み**: `user_roles`, `tenant_id`, `created_by`, `workflow_number`, `deleted_at` 等

---

## 2. 内部リンクの健全性

### 2.1 Astro 内部リンク（`/spec/xxx/` 形式）

全 34 件のリンク先を検証済み。Starlight は大文字ファイル名を小文字スラッグに自動変換するため、`/spec/screens/scr-d01/` → `SCR-D01.md` のマッピングも正常。

✅ **全リンク有効**

### 2.2 相対リンク（`../../xxx/` 形式）

全 60 件超の相対パスリンクを検証済み。

✅ **全リンク有効**

### 2.3 ADR 一覧ページの更新漏れ

| 判定 | ファイル | 問題 |
|---|---|---|
| ❌ | `adr/index.md` | ADR-0004, ADR-0005 が一覧に掲載されていない |

`adr/index.md` の ADR 一覧には ADR-0001 〜 ADR-0003 の 3 件のみ記載されているが、実際には `ADR-0004.md`（profiles テーブル導入）と `ADR-0005.md`（Supabase CLI 採用）が存在する。

### 2.4 Related セクションのリンク

各仕様書・詳細設計の Related リンクをサンプル検証。

✅ **リンク切れなし**（`spec/apis/API-E01.md`, `requirements/roles/index.md`, `detail/setup/index.md` 等を確認）

---

## 3. ドキュメント間の矛盾

### 3.1 requirements/roles vs spec/authz — ロール定義・権限マッピング

| 項目 | requirements/roles | spec/authz | 判定 |
|---|---|---|---|
| ロール数 | 6（Member〜IT Admin） | 6（同一） | ✅ |
| テナント管理 | Tenant Admin ✅ + IT Admin ✅ | IT Admin のみ（`requireRole(["it_admin"])`)  | ⚠️ |
| ユーザー管理 | Tenant Admin ✅ + IT Admin ✅ | Tenant Admin のみ（`requireRole(["tenant_admin"])`)  | ⚠️ |
| 監査ログ | IT Admin ✅ + Tenant Admin 閲覧 | IT Admin + Tenant Admin（一致） | ✅ |
| 経費承認/集計 | Accounting ✅ + Tenant Admin ✅ | 一致 | ✅ |

> **問題点**: `requirements/roles` の権限マトリクスでは「テナント設定」に Tenant Admin ✅ / IT Admin ✅ の両方が記載されているが、`spec/authz` の「テナント管理」行では IT Admin のみ。逆に「ユーザー管理」は requirements では両方 ✅ だが spec では Tenant Admin のみ。
>
> **判断**: 実装コードでは `requireRole(tenantId, ["tenant_admin", "it_admin"])` でテナント管理、`requireRole(tenantId, ["tenant_admin"])` でユーザー管理となっている。spec/authz は「テナント管理の削除は IT Admin のみ、名前編集は両方」という細分化を反映済みだが、requirements/roles の概要マトリクスがその詳細度に追いついていない。**requirements/roles を更新して粒度を合わせることを推奨**。

### 3.2 requirements/nfr と detail/ の対応

| NFR | 内容 | detail/ での対応 | 判定 |
|---|---|---|---|
| NFR-01a | 認証（Supabase Auth） | `detail/setup/` で構成説明あり | ✅ |
| NFR-01b | RLS 強制 | `detail/rls/` で全テーブル定義 | ✅ |
| NFR-01c | テナント分離 | `detail/rls/` + `detail/db/` | ✅ |
| NFR-02a | TTFB 200ms 以下 | 具体的なベンチマーク仕様なし | ⚠️ |
| NFR-02e | 全文検索 1 秒以内 | 未設計（将来機能） | ⚠️ |
| NFR-04b | ヘルスチェック | 未設計 | ⚠️ |
| NFR-04d | ゼロダウンタイムデプロイ | 未設計 | ⚠️ |
| NFR-05a–d | 監査ログ | `detail/rls/` の audit_logs ポリシー + `spec/audit-logging/` + ADR-0002 | ✅ |
| NFR-06a | レスポンシブ | 設計レベルの言及なし | ⚠️ |

> **判断**: NFR の大半は Phase 1 未着手の運用・性能要件。設計対象外と明示されていないため、今後のフェーズで detail/ に追加するか、スコープ外として明記すべき。

### 3.3 catchup/ の最新仕様との整合

| ファイル | 判定 | 根拠 |
|---|---|---|
| `catchup/glossary.md` | ✅ | 6 ロール名・ワークフローステータス・テーブル名が最新仕様と一致 |
| `catchup/confusion-points.md` | ✅ | RBAC vs RLS / 監査ログ vs 履歴 / 申請 vs 実データの説明が正確 |
| `catchup/design-pillars.md` | ✅ | 設計原則が現行アーキテクチャに適合 |

### 3.4 ADR の「決定」と実装の一致

| ADR | 決定 | 実装状況 | 判定 |
|---|---|---|---|
| ADR-0001 | RBAC + RLS 二層認可 | `lib/auth.ts` + 全テーブル RLS ポリシー | ✅ |
| ADR-0002 | `writeAuditLog` ヘルパーで INSERT ONLY | `lib/audit.ts` + audit_logs テーブル | ✅ |
| ADR-0003 | `tenant_id` による論理分離 | 全テーブルに tenant_id + RLS | ✅ |
| ADR-0004 | profiles テーブル + トリガー同期 | マイグレーション存在 + トリガー実装済み | ✅ |
| ADR-0005 | Supabase CLI 採用 | `supabase/config.toml` 存在 | ✅ |

---

## 4. フォーマット品質

### 4.1 Frontmatter

| 分類 | ファイル数 | `title` | `description` | 判定 |
|---|---|---|---|---|
| 仕様書・設計書 | 65 | 全あり | 全あり | ✅ |
| logs/ 配下 | 39 | 38/39 | 11/39 | ⚠️ |
| index.mdx | 1 | あり | あり | ✅ |

**問題のあるファイル**:

| 判定 | ファイル | 問題 |
|---|---|---|
| ❌ | `logs/prompts/audit-tasks.md` | frontmatter なし（`---` ブロック自体が存在しない） |
| ⚠️ | `logs/knowledge.md` | `description` なし |
| ⚠️ | `logs/prompts/*.md` (8ファイル) | `description` なし |
| ⚠️ | `logs/reviews/*.md` (6ファイル) | `description` なし |
| ⚠️ | `logs/walkthroughs/*.md` (11ファイル) | `description` なし |
| ⚠️ | `logs/qa/qa-report-answer.md` | `description` なし |

> **判断**: `logs/` 配下は運用ログのため `description` 必須とは言えないが、Starlight のサイドバーや検索で不便になる。`audit-tasks.md` のみ `title` すらないため修正必須。

### 4.2 テンプレ構造の遵守

仕様書テンプレ（`spec/screens/template.md`, `spec/apis/template.md`, `detail/db/template.md`）との構造比較:

| テンプレ要素 | 遵守率 | 備考 |
|---|---|---|
| 目的 / In-Out / Related | 95%+ | ほぼ全ファイルで記載 |
| 画面情報ヘッダ | 100% | SCR 全ファイル |
| エラー/例外セクション | 90%+ | 一部省略あり（軽微） |
| 監査ログポイント | 80%+ | 一部ファイルで省略 |

✅ **概ね良好**

### 4.3 Mermaid 図

25 箇所の Mermaid 図を確認。

✅ **構文エラーなし** — `graph LR`, `graph TB`, `sequenceDiagram`, `stateDiagram-v2` が適切に使用されている。

---

## 5. 旧ドキュメント（Archive）の扱い

### 5.1 Archive アノテーション

6 ファイルを対象に確認:

| # | ファイル | アノテーション | 正本リンク先 | 判定 |
|---|---|---|---|---|
| 1 | `architecture/directory-structure.md` | ✅ `> **このページは Archive（参照専用）です。**` | `/detail/modules/` | ✅ |
| 2 | `architecture/supabase.md` | ✅ 同上 | `/spec/architecture/` | ✅ |
| 3 | `architecture/tech-stack.md` | ✅ 同上 | `/spec/architecture/` | ✅ |
| 4 | `getting-started/overview.mdx` | ✅ 同上 | `/spec/architecture/` | ✅ |
| 5 | `getting-started/setup.mdx` | ✅ 同上 | `/spec/architecture/` | ⚠️ |
| 6 | `guides/supabase-client.mdx` | ✅ 同上 | `/spec/supabase-client/` | ✅ |

> **#5 備考**: `setup.mdx` のリンク先が `/spec/architecture/` だが、内容的には `/detail/setup/`（環境構築ガイド）が正本として適切。意図的にアーキテクチャ概要へ誘導しているなら問題ないが、セットアップ手順を探すユーザーには混乱の可能性あり。

---

## 総合サマリ

### 検出項目数

| 重要度 | 件数 | 概要 |
|---|---|---|
| ❌ 要修正 | 3 | Starlight App 残置 (2箇所)、ADR一覧の更新漏れ、frontmatter 欠落 |
| ⚠️ 改善推奨 | 6 | ロール名 PascalCase 混在、requirements/roles 粒度不足、`description` 欠落、NFR 未設計項目、setup.mdx 正本リンク、IT Admin/Tenant Admin の権限境界 |
| ✅ 問題なし | 5 | 内部リンク全有効、catchup 整合、ADR-実装整合、テーブル名 snake_case 統一、Archive アノテーション |

### 優先対応リスト

1. ~~**`adr/index.md`** — ADR-0004, ADR-0005 を一覧に追加~~ ✅ 修正済み
2. ~~**`getting-started/overview.mdx`** — `Starlight App` → `OpsHub` に修正（2箇所）~~ ✅ 修正済み
3. ~~**`logs/prompts/audit-tasks.md`** — frontmatter（`title` / `description`）を追加~~ ✅ 修正済み
4. ~~**`spec/screens/SCR-D01.md` / `spec/apis/API-D01.md` / `detail/rls/index.md`** — `TenantAdmin` → `Tenant Admin` に統一~~ ✅ 修正済み
5. **`requirements/roles/index.md`** — 権限マトリクスを `spec/authz` と粒度を合わせて更新（未対応 — 仕様判断が必要）
6. ~~**`getting-started/setup.mdx`** — 正本リンクを `/detail/setup/` に変更~~ ✅ 修正済み
