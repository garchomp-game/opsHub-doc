---
title: "R17-4: ドキュメント内部品質 最終検証"
description: "全ドキュメントの一貫性・リンク・用語・フォーマットの最終検証結果"
---

> **検証日**: 2026-02-25
> **対象**: `opsHub-doc/src/content/docs/` 配下 全112ファイル
> **前回監査**: [audit-04-internal-quality](../audit-04-internal-quality/)

---

## 1. 用語の統一

### 1.1 ロール名（TenantAdmin 混在チェック）

**検証方法**: `grep -rn TenantAdmin` で全ファイルを走査

| 区分 | ファイル数 | TenantAdmin 残存 | 判定 |
|---|---|---|---|
| 仕様書 (`spec/`) | 29 | 1件 → **修正済** | ✅ |
| 詳細設計 (`detail/`) | 11 | 13件 → **修正済** | ✅ |
| 要件 (`requirements/`) | 5 | 0件 | ✅ |
| ADR (`adr/`) | 8 | 0件 | ✅ |
| catchup | 3 | 0件 | ✅ |
| logs/ | 56 | 複数（履歴ログのため修正対象外） | ✅ |

**修正内容**:

| ファイル | 修正箇所 | 変更 |
|---|---|---|
| `spec/apis/API-D02.md` | L317 エラー表 | `TenantAdmin` → `Tenant Admin` |
| `detail/sequences/index.md` | L110-114, L118 請求書遷移表 | `TenantAdmin` → `Tenant Admin`（6箇所） |
| `detail/rls/index.md` | L343, 359, 370, 380, 393, 511, 512 | `TenantAdmin` → `Tenant Admin`（7箇所） |
| `logs/knowledge.md` | L61 | `TenantAdmin` → `Tenant Admin` |

> `logs/` 配下のプロンプト・ウォークスルー・レビュー記録は履歴資料のため修正対象外。

### 1.2 ステータス名

全ファイルで snake_case が一貫して使用されている。

| ドメイン | ステータス値 | 判定 |
|---|---|---|
| workflow | `draft`, `submitted`, `approved`, `rejected`, `withdrawn` | ✅ |
| project | `planning`, `active`, `completed`, `cancelled` | ✅ |
| task | `todo`, `in_progress`, `done` | ✅ |
| invoice | `draft`, `sent`, `paid`, `cancelled` | ✅ |

### 1.3 アプリ名

`Starlight App` の残存なし（audit-04 で修正済み、`logs/` 履歴のみ）。 ✅

---

## 2. Frontmatter

**検証方法**: 全 `.md`/`.mdx` ファイルで `title` フィールドの存在を確認

| 分類 | ファイル数 | title 完備 | 判定 |
|---|---|---|---|
| 仕様書・設計書 | 56 | 56/56 | ✅ |
| logs/ 配下 | 56 | 56/56 | ✅ |

> audit-04 で指摘された `logs/prompts/audit-tasks.md` の frontmatter 欠落は修正済み。

✅ **全112ファイルに `title` が設定されている**

---

## 3. 内部リンク

**検証方法**: `npm run build` によるビルド検証 + Related セクションの手動サンプル検証

| 検証項目 | 結果 |
|---|---|
| ビルドエラー（リンク切れ） | 0件 |
| Related セクションのサンプル検証 | 全リンク有効 |
| ADR 一覧 (`adr/index.md`) | ADR-0001～0006 全件掲載 ✅ |

✅ **リンク切れなし**

---

## 4. 採番の連続性

### SCR（画面仕様）

| 採番 | ファイル | 備考 |
|---|---|---|
| SCR-001 | ✅ | ログイン |
| SCR-002 | ✅ | ダッシュボード |
| SCR-A01～A03 | ✅ | テナント/ユーザー/監査ログ |
| SCR-B01～B03 | ✅ | 申請一覧/作成/詳細 |
| SCR-C01-1, C01-2 | ✅ | PJ一覧/詳細 |
| SCR-C02 | ✅ | タスク管理 |
| SCR-C03-1, C03-2 | ✅ | 工数入力/集計 |
| SCR-D01 | ✅ | 経費管理 |
| SCR-D02 | ⚠️ 欠番 | **意図的**: D → 経費 Epic では D01=経費管理、D03=経費集計。D02 は API のみ（経費集計API） |
| SCR-D03 | ✅ | 経費集計 |
| SCR-E01 | ✅ | 通知 |
| SCR-F01 | ✅ | ドキュメント管理 |
| SCR-G01 | ⚠️ 欠番 | **意図的**: G01=通知（E01 で実装済）、G02=全文検索 |
| SCR-G02 | ✅ | 全文検索 |
| SCR-H01, H02 | ✅ | 請求一覧/詳細 |

> 採番ルール: `SCR-{Epic}-{REQ番号}` で REQ と 1:1 対応。SCR-D02/G01 の欠番は対応する画面が不要なため意図的。

### API（API仕様）

| 採番 | 判定 |
|---|---|
| API-A01～A02 | ✅ |
| API-B01～B03 | ✅ |
| API-C01～C03-2 | ✅ |
| API-D01～D02 | ✅ |
| API-E01 | ✅ |
| API-F01 | ✅ |
| API-G01 | ✅ |
| API-H01 | ✅ |

✅ **欠番なし**

### DD-DB（DB設計）

DD-DB-001 ～ DD-DB-015 まで連続。 ✅ **欠番なし**

### ADR

ADR-0001 ～ ADR-0006 まで連続。 ✅ **欠番なし**

---

## 5. Mermaid 構文

**検証方法**: `npm run build` で Mermaid ブロックのパースエラーを確認

| 検出数 | エラー数 | 判定 |
|---|---|---|
| 36ブロック | 0件 | ✅ |

使用ダイアグラム種別: `stateDiagram-v2`, `sequenceDiagram`, `erDiagram`, `graph LR`, `graph TB`, `flowchart LR`

✅ **全 Mermaid ブロック有効**

---

## 6. サイドバー vs ファイル

**検証方法**: `astro.config.mjs` の sidebar 定義（全68リンク）と実ファイルを突合

| セクション | サイドバーリンク数 | ファイル存在 | 判定 |
|---|---|---|---|
| キャッチアップ | 3 | 3/3 | ✅ |
| 要件定義 | 6 | 6/6 | ✅ |
| 基本設計 | 26 | 26/26 | ✅ |
| 詳細設計 | 9 | 9/9 | ✅ |
| ADR | 8 | 8/8 | ✅ |
| 計画 | 3 | 3/3 | ✅ |
| 開発ログ | autogen | — | ✅ |
| Archive | 6 | 6/6 | ✅ |
| その他 | 7 | 7/7 | ✅ |

✅ **全サイドバーリンクが実ファイルに対応**

---

## 7. Phase 1 audit-04 指摘の解消確認

| # | 指摘 | 状態 | 確認結果 |
|---|---|---|---|
| 1 | `adr/index.md` — ADR-0004, 0005 未掲載 | ✅ 修正済 | ADR-0001～0006 全件掲載 |
| 2 | `overview.mdx` — `Starlight App` 残置 | ✅ 修正済 | grep で残存なし |
| 3 | `audit-tasks.md` — frontmatter 欠落 | ✅ 修正済 | title あり |
| 4 | SCR-D01/API-D01/rls — `TenantAdmin` 混在 | ✅ 修正済 | 今回の再検証で追加修正も完了 |
| 5 | `requirements/roles` — 権限マトリクス粒度不足 | ⚠️ 未対応 | 仕様判断が必要（audit-04 から引き継ぎ） |
| 6 | `setup.mdx` — 正本リンク修正 | ✅ 修正済 | `/detail/setup/` を参照 |

> **#5 について**: `requirements/roles` の権限マトリクスは概要レベルでの記載であり、細分化された権限は `spec/authz` に定義済み。現状で実害はないが、将来のメンテナンス性向上のため粒度を合わせることを引き続き推奨する。

---

## 総合サマリ

| 検証項目 | 結果 | 修正数 |
|---|---|---|
| 用語の統一 | ✅ | 4ファイル15箇所修正 |
| Frontmatter | ✅ | 0（全件 title あり） |
| 内部リンク | ✅ | 0（リンク切れなし） |
| 採番連続性 | ✅ | 0（欠番は意図的） |
| Mermaid 構文 | ✅ | 0（全36ブロック有効） |
| サイドバー整合 | ✅ | 0（全リンク対応） |
| audit-04 解消 | ✅ | 5/6件解消、1件は仕様判断待ち |

### ビルド検証

```
$ npm run build
✓ Completed in 13.42s (build 1)
✓ Completed in 3.17s (build 2)
✓ 1851 modules transformed.
Exit code: 0
```

✅ **ビルド成功 — エラー・警告なし**
