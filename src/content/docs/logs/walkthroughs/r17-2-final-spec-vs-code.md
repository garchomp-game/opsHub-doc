---
title: "R17-2: 仕様書 vs 実装 最終検証"
description: "Phase 2-3 の新規仕様書と実装コードの整合性を検証した結果レポート"
---

## 検証概要

| 項目 | 値 |
|---|---|
| 実施日 | 2026-02-25 |
| 検証範囲 | 経費集計 / 請求 / ドキュメント管理 / 全文検索 / NFR |
| 検証仕様書 | SCR-D03, API-D02, SCR-H01, SCR-H02, API-H01, SCR-F01, API-F01, SCR-G02, API-G01 |
| 結果 | ✅ **PASS**（不一致 3 件を修正済み） |

---

## 1. 経費集計（SCR-D03 / API-D02）

### 検証結果

| 検証項目 | 結果 | 詳細 |
|---|---|---|
| URL `/expenses/summary` | ✅ | `page.tsx` のルーティング一致 |
| フィルタ（期間/カテゴリ/PJ/ステータス） | ⚠️→✅ | カテゴリ名を修正（後述） |
| Server Action 4本 | ✅ | `getExpenseSummaryByCategory`, `ByProject`, `ByMonth`, `getExpenseStats` 全て存在 |
| 型定義 `ExpenseSummaryFilters` | ✅ | 仕様通り 5 フィールド |
| 出力型 `CategorySummary`, `ProjectSummary`, `MonthlySummary`, `ExpenseStats` | ✅ | 全フィールド一致 |
| 権限 `accounting / pm / tenant_admin` | ✅ | `hasRole` チェック実装済み |
| `Promise.all` 並列実行 | ✅ | 4 クエリ + プロジェクト一覧を並列取得 |
| エラーコード `ERR-AUTH-003`, `ERR-VAL-010`, `ERR-SYS-001` | ✅ | 仕様通り |
| テーブル列（カテゴリ/件数/合計金額/割合, PJ/件数/合計, 月/件数/合計） | ✅ | 全ビュー合計行つき |
| 監査ログ | ✅ | 参照のみのため記録なし（仕様通り） |

### 修正：SCR-D03 カテゴリ名不一致

| 箇所 | 修正前 | 修正後 | 理由 |
|---|---|---|---|
| SCR-D03 フィルタ/色定義/ワイヤーフレーム | `飲食費`, `備品` | `会議費`, `消耗品費` | SCR-D01 / API-D01 / 実装が `会議費/消耗品費` で統一 |

---

## 2. 請求（SCR-H01 / SCR-H02 / API-H01）

### 検証結果

| 検証項目 | 結果 | 詳細 |
|---|---|---|
| URL `/invoices` (一覧) | ✅ | ルーティング一致 |
| URL `/invoices/new` (新規) | ✅ | ルーティング一致 |
| URL `/invoices/[id]` (詳細) | ✅ | ルーティング一致 |
| テーブル列 9 列（請求番号〜操作） | ✅ | リンク・Tag 色・期限超過赤字すべて実装 |
| フィルタ（ステータス/PJ/期間） | ✅ | GET パラメータ経由で実装 |
| ページネーション 20件 | ✅ | `pageSize: 20`, `showTotal` |
| ソート `issued_date` DESC, `created_at` DESC | ✅ | `.order()` 二段 |
| ステータス色定義 (`draft:blue`, `sent:orange`, `paid:green`, `cancelled:default`) | ✅ | `_constants.ts` で完全一致 |
| ステータス遷移ルール | ✅ | `INVOICE_STATUS_TRANSITIONS` で完全一致 |
| Server Action 6 本 | ✅ | `createInvoice`, `updateInvoice`, `getInvoices`, `getInvoiceById`, `updateInvoiceStatus`, `deleteInvoice` |
| 入力型 `CreateInvoiceInput`, `UpdateInvoiceInput` 等 | ✅ | 全フィールド仕様通り |
| 金額計算ロジック（`FLOOR(subtotal × tax_rate / 100)`） | ✅ | `Math.floor` 使用 |
| 請求番号採番 `INV-YYYY-NNNN` | ✅ | `next_invoice_number` RPC 呼出 |
| エラーコード 14 種 | ✅ | `ERR-AUTH-003/004`, `ERR-VAL-H01〜H08`, `ERR-INV-001〜004`, `ERR-SYS-001` 全実装 |
| 権限チェック（Accounting/TenantAdmin:CRUD, PM:閲覧） | ✅ | 実装済み |
| PM の自 PJ スコープ制限 | ✅ | `pm_id` フィルタ実装 |
| 監査ログ 4 ポイント | ✅ | `invoice.create/update/status_change/delete` 全実装 |
| 削除は `draft` のみ | ✅ | `ERR-INV-004` で制御 |
| 編集は `draft` のみ | ✅ | `ERR-INV-002` で制御 |
| PDF 出力（`window.print()` + 印刷用 CSS） | ✅ | `InvoicePrintView` コンポーネント |
| 権限エラー時リダイレクト | ⚠️→✅ | `/` → `/dashboard` に修正（後述） |

### 修正：リダイレクト先不一致

| ファイル | 修正前 | 修正後 |
|---|---|---|
| `invoices/page.tsx` | `redirect("/")` | `redirect("/dashboard")` |
| `invoices/[id]/page.tsx` | `redirect("/")` | `redirect("/dashboard")` |

---

## 3. ドキュメント管理（SCR-F01 / API-F01）

### 検証結果

| 検証項目 | 結果 | 詳細 |
|---|---|---|
| URL `/projects/[id]/documents` | ✅ | ルーティング一致 |
| Server Action 4 本 | ✅ | `getDocuments`, `uploadDocument`, `deleteDocument`, `getDownloadUrl` |
| テーブル列 6 列（ファイル名/サイズ/種別/UP者/日時/操作） | ✅ | 完全一致 |
| MIME 色定義（PDF:red, 画像:blue, DOCX:geekblue, XLSX:green, PPTX:orange, TXT:default） | ✅ | `MIME_TAG_CONFIG` で完全一致 |
| アップロード制約（10MB / MIME 8 種） | ✅ | `MAX_FILE_SIZE`, `ALLOWED_MIME_TYPES` 一致 |
| Storage パス `{tenant_id}/{project_id}/{uuid}_{filename}` | ✅ | `crypto.randomUUID()` + サニタイズ |
| DB INSERT ロールバック | ✅ | 失敗時 Storage ファイル削除実装 |
| signedURL 有効期限 60 秒 | ✅ | `.createSignedUrl(path, 60)` |
| 権限（PJ メンバー:閲覧/DL, PM/Admin:CRUD） | ✅ | `canManage` フラグ + `hasRole` |
| エラーコード | ✅ | `ERR-AUTH-F01/F02`, `ERR-VAL-F01〜F03`, `ERR-DOC-001`, `ERR-SYS-001/F01/F02` 全実装 |
| Storage 削除失敗→ログ記録して続行 | ✅ | `logger.error()` で記録後処理続行 |
| 監査ログ 3 ポイント | ✅ | `document.upload/delete/download` 全実装 |
| ドラッグ＆ドロップ | ✅ | Ant Design `Upload.Dragger` 使用 |
| 削除確認モーダル `{ファイル名} を削除しますか？` | ✅ | `Modal.confirm` 実装 |

---

## 4. 全文検索（SCR-G02 / API-G01）

### 検証結果

| 検証項目 | 結果 | 詳細 |
|---|---|---|
| URL `/search?q={keyword}` | ✅ | ルーティング一致 |
| Server Action `searchAll` | ✅ | 実装済み |
| 入力型 `SearchAllInput` (query/category/page) | ✅ | 仕様通り |
| 出力型 `SearchAllResponse` (results/counts/page/hasMore) | ✅ | 仕様通り |
| `SearchResult` 型（id/category/title/description/status/createdAt/link/metadata） | ✅ | 完全一致 |
| カテゴリタブ 5 種（すべて/WF/PJ/タスク/経費） | ✅ | バッジ付きで実装 |
| ILIKE 検索（`%query%`） | ✅ | `escapeLikeQuery()` + `ilike` |
| 並列実行 `Promise.all` 4 カテゴリ | ✅ | 実装済み |
| 取得件数（all: 10件/カテゴリ, 個別: 20件/ページ） | ✅ | `limitPerCategory` で制御 |
| ソート `created_at` 降順 | ✅ | 全カテゴリ共通 |
| 経費権限（Accounting/TenantAdmin:全件, 他:自分のみ） | ✅ | `isExpenseAdmin` + `created_by` |
| バリデーション 6 項目 | ✅ | `ERR-AUTH-001/003`, `ERR-VAL-001〜004` |
| ステータス Tag 色定義（WF/PJ/タスク/経費 各ステータス） | ✅ | `STATUS_CONFIG` で全ステータス一致 |
| キーワードハイライト `<mark>` | ✅ | `highlightText()` 関数 |
| スニペット抽出（前後 50 文字） | ✅ | `extractSnippet()` 関数 |
| 空状態 UI | ✅ | `Empty` コンポーネント + メッセージ「別のキーワードで検索してみてください」 |
| 遷移先 URL（WF→`/workflows/{id}`, PJ→`/projects/{id}`, タスク→`/projects/{pid}/tasks`, 経費→`/expenses/{id}`） | ✅ | `link` 生成ロジック一致 |
| 監査ログ | ✅ | 検索は監査ログ不要（仕様通り） |

---

## 5. NFR

### 検証結果

| 検証項目 | 結果 | 詳細 |
|---|---|---|
| 構造化ロガー（NFR-04a） `lib/logger.ts` | ✅ | JSON 形式、4 レベル、`LOG_LEVEL` 環境変数対応 |
| ログエントリ型（timestamp/level/message/context/error） | ✅ | `LogEntry` 型定義 |
| ヘルスチェック（NFR-04b） `/api/health` | ✅ | DB 接続確認、構造化レスポンス |
| ヘルスチェック HTTP ステータス（200:healthy / 503:unhealthy） | ✅ | 正しいステータスコード |
| CSP ヘッダー（NFR-01f） `next.config.ts` | ✅ | `Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy` |
| `connect-src` に Supabase 含む | ✅ | `https://*.supabase.co wss://*.supabase.co` |
| `frame-ancestors 'none'` | ✅ | クリックジャッキング対策 |

---

## ビルド検証

| プロジェクト | 結果 |
|---|---|
| OpsHub (`next build`) | ✅ Exit code: 0 |
| opsHub-doc (`npm run build`) | ✅ 183 pages, 0 errors |

---

## 修正サマリー

| # | 種別 | ファイル | 内容 |
|---|---|---|---|
| 1 | **仕様書修正** | `SCR-D03.md` | カテゴリ名 `飲食費→会議費`, `備品→消耗品費`（SCR-D01 統一） |
| 2 | **コード修正** | `invoices/page.tsx` | リダイレクト先 `/` → `/dashboard` |
| 3 | **コード修正** | `invoices/[id]/page.tsx` | リダイレクト先 `/` → `/dashboard` |

---

## 総合判定

Phase 2-3 で追加された **9 仕様書** と **5 機能実装** の整合性を検証した結果、
軽微な不一致 3 件（カテゴリ名の誤表記 1 件、リダイレクト先 2 件）を発見・修正し、
**すべての検証項目が PASS** であることを確認した。
