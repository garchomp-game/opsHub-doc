---
title: "R15-1: ドキュメント管理 + 全文検索 レビュー"
description: "REQ-F01 ドキュメント管理 / REQ-G02 全文検索の実装レビュー結果"
---

## レビュー対象

| 機能 | ファイル |
|---|---|
| ドキュメント DB | `20260225000001_documents.sql` |
| ドキュメント Actions | `projects/[id]/documents/_actions.ts` |
| ドキュメント Page | `projects/[id]/documents/page.tsx` |
| ドキュメント Client | `DocumentListClient.tsx` |
| 検索 DB | `20260225000002_search_indexes.sql` |
| 検索 Actions | `search/_actions.ts` |
| 検索 Page | `search/page.tsx` |
| 検索 Client | `SearchResultsClient.tsx` |
| ヘッダー検索バー | `HeaderSearchBar.tsx` |

## レビュー結果サマリ

全体的に高品質な実装。仕様（SCR-F01, API-F01, SCR-G02, API-G01, ADR-0006）に準拠。
5件の問題を発見し、すべてその場で修正済み。

---

## ドキュメント管理チェック結果

| # | チェック項目 | 結果 |
|---|---|---|
| 1 | Storage バケット `public: false` | ✅ |
| 2 | Storage パス `{tenant_id}/{project_id}/{uuid}_{filename}` | ✅ |
| 3 | Storage RLS ポリシー（テナント分離） | ✅ |
| 4 | ファイルサイズ/MIME バリデーション（10MB, 8種類） | ✅ |
| 5 | DB INSERT 失敗時の Storage ロールバック | ✅ |
| 6 | Storage + DB 両方の削除 | ✅ |
| 7 | signedURL 有効期限 60秒 | ✅ |
| 8 | 権限: Member=閲覧DL, PM/Admin=CRUD | ✅ |
| 9 | 監査ログ 3アクション | ✅ |

## 全文検索チェック結果

| # | チェック項目 | 結果 |
|---|---|---|
| 1 | `pg_trgm` 拡張有効化 | ✅ |
| 2 | GIN インデックス 4テーブル | ✅ |
| 3 | LIKE メタ文字エスケープ（`%`, `_`, `\`） | ✅ |
| 4 | `Promise.all` 4並列検索 | ✅ |
| 5 | 経費のロール別データ範囲 | ✅ |
| 6 | キーワードハイライト（`<mark>`タグ） | ✅ |
| 7 | ヘッダー検索バー → `/search?q=` 遷移 | ✅ |

---

## 発見・修正した問題

### BUG-01: `console.error` → `logger.error`（重要度: 低）

**ファイル**: `documents/_actions.ts` L207

Storage 削除失敗時に `console.error` を使用していた。NFR-04a の構造化ログ要件に従い `logger.error` に統一。

```diff
-console.error("ERR-SYS-F02: Storage deletion failed:", storageError.message);
+logger.error("ERR-SYS-F02: Storage deletion failed", { documentId: input.document_id, filePath: doc.file_path });
```

### BUG-02: `uploadDocument` の `withAuth` 不使用（情報のみ）

`uploadDocument` は `FormData` を直接受け取るため `withAuth` パターンに適合しない。手動で `requireAuth()` + `createClient()` + try/catch を実装しており、仕様上問題なし。現状維持。

### BUG-03: `let` → `const`（重要度: 低）

**ファイル**: `search/_actions.ts` L91

`searchWorkflows` 内で `let q = supabase...` と宣言しているが再代入がないため `const` に変更。

```diff
-let q = supabase
+const q = supabase
```

### BUG-04: `searchTasks` の `tenant_id` フィルタ欠落（重要度: 高）

**ファイル**: `search/_actions.ts` L141-146

`searchTasks` で他カテゴリと違い `.eq("tenant_id", tenantId)` が欠落していた。RLS により実害は限定的だが、Application 層の防御としてフィルタを追加。

```diff
 const { data, count, error } = await supabase
     .from("tasks")
     .select("id, title, status, created_at, project_id", { count: "exact" })
+    .eq("tenant_id", tenantId)
     .ilike("title", pattern)
```

### BUG-05: `highlightText` regex.test() バグ（重要度: 高）

**ファイル**: `SearchResultsClient.tsx` L64-78

`RegExp` に `gi`（global）フラグを使用し、`.test()` で判定していた。`test()` はグローバルフラグ付き正規表現の `lastIndex` を更新するため、連続呼び出しで **奇数番目のマッチがスキップ** されるバグ。

```diff
-regex.test(part) ? (
+part.toLowerCase() === query.toLowerCase() ? (
```

---

## 共通パターンチェック

| チェック項目 | 結果 | 備考 |
|---|---|---|
| `withAuth` パターン | ✅ | `uploadDocument` は FormData 制約のため手動実装 |
| `writeAuditLog` 呼び出し | ✅ | upload/delete/download 全対応 |
| `tenant_id` フィルタ | ✅ | BUG-04 修正後 |
| 型安全性 | ✅ | |
| エラーハンドリング | ✅ | |

## 検証

```bash
$ cd /home/garchomp-game/workspace/starlight-test/OpsHub && npm run build
✓ Compiled successfully in 14.8s
✓ Generating static pages (23/23)
Exit code: 0
```

## 修正ファイル一覧

| ファイル | 修正内容 |
|---|---|
| `documents/_actions.ts` | `logger` import 追加、`console.error` → `logger.error` |
| `search/_actions.ts` | `let` → `const`、`searchTasks` に `tenant_id` フィルタ追加 |
| `SearchResultsClient.tsx` | `highlightText` の `regex.test()` バグ修正 |
