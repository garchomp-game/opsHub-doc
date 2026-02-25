---
title: "R16-3: modules/index.md の最終更新 — ウォークスルー"
---

## 概要

Phase 2-3 で追加されたモジュール・ディレクトリ・ユーティリティ関数を `modules/index.md` に反映した。

## 変更内容

### ディレクトリ構成の更新

以下を追加:

| 追加パス | 説明 |
|---|---|
| `api/health/route.ts` | ヘルスチェック API（NFR-04b） |
| `_components/HeaderSearchBar.tsx` | ヘッダー共通検索バー |
| `expenses/summary/` | 経費集計（SC + CC + Actions） |
| `invoices/` | 請求一覧・作成・詳細・印刷プレビュー |
| `projects/[id]/documents/` | ドキュメント管理 |
| `search/` | 全文検索 |
| `lib/logger.ts` | 構造化ロガー |

### 新規モジュール定義

| モジュール | 責務 |
|---|---|
| DD-MOD-008 請求書モジュール | 請求書 CRUD、ステータス遷移、印刷プレビュー、採番 |
| DD-MOD-009 ドキュメント管理モジュール | Supabase Storage 連携、アップロード/ダウンロード/削除 |
| DD-MOD-010 全文検索モジュール | 横断検索（pg_trgm + GIN）、ヘッダー検索バー |
| DD-MOD-011 運用基盤モジュール | 構造化ロギング（logger）、ヘルスチェック |

### 既存モジュール更新

- **DD-MOD-003 工数**: `escapeCsvField()` ヘルパーを追記
- **DD-MOD-004 経費**: `expenses/summary/` の集計機能を反映（`getExpenseSummaryByCategory()` 等 4 関数追加）

### 定数セクション追加

- `INVOICE_STATUS_LABELS`, `INVOICE_STATUS_COLORS`, `INVOICE_STATUS_TRANSITIONS`（`invoices/_constants.ts`）
- `ALLOWED_MIME_TYPES`（`documents/_actions.ts`）

### ユーティリティ関数テーブル追加

| 関数 | ファイル | 用途 |
|---|---|---|
| `escapeCsvField()` | `api/timesheets/export/route.ts` | CSV エスケープ |
| `escapeLikePattern()` | `search/_actions.ts` | SQL LIKE メタ文字エスケープ |
| `formatFileSize()` | `DocumentListClient.tsx` | ファイルサイズ変換 |
| `highlightText()` | `SearchResultsClient.tsx` | 検索ハイライト |

### 決定済み事項テーブル更新

請求書採番、全文検索、構造化ログ、ファイル管理の 4 項目を追加。

## 検証

```
npm run build → 177 pages built, exit code 0
```
