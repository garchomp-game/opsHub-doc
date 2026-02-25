---
title: "R16-2: knowledge.md の最終更新"
description: "Phase 2-3 で追加した実装パターンと設計判断をナレッジベースに反映"
---

あなたは OpsHub の設計ドキュメント担当です。
Phase 2-3 で蓄積された実装パターン・設計判断を knowledge.md に追記してください。

## 対象ファイル

/home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/knowledge.md

## 参照（Phase 2-3 のウォークスルー全て）

- /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/r9-2-expense-summary.md
- /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/r9-3-csv-export.md
- /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/r9-4-nfr-infra.md
- /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/r10-1-invoice-list.md
- /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/r10-2-invoice-detail.md
- /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/r14-1-documents.md
- /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/r14-2-search.md
- /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/r11-1-review-expense-csv.md
- /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/r11-2-review-invoices.md
- /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/r15-1-review-documents-search.md

## 追記すべきナレッジ

### 新しいパターン
1. **FormData Server Action パターン**: `uploadDocument` は `withAuth` に適合しないため手動実装。`requireAuth()` + try-catch + Storage ロールバック。
2. **Supabase Storage 連携**: バケット作成、テナント分離パス、signedURL（60秒有効）、Storage RLS ポリシー。
3. **CSV エクスポート Route Handler**: BOM 付き UTF-8、`getCurrentUser()` 使用（redirect 問題回避）、CSV エスケープ。
4. **構造化ロガー**: `lib/logger.ts`、JSON 出力、`LOG_LEVEL` 環境変数、`console.error` → `logger.error` 一括置換。
5. **pg_trgm + GIN インデックス**: ILIKE 検索、SQL メタ文字エスケープ（`%`, `_`, `\`）。
6. **横断検索パターン**: 4テーブル `Promise.all` 並列、統一 `SearchResult` 型への正規化。
7. **請求書明細パターン**: ヘッダー/明細 2テーブル、Editable Table、自動計算、`ON DELETE CASCADE`。
8. **請求書採番**: `next_invoice_number` RPC、`SELECT FOR UPDATE` 行ロック。

### レビューで発見された重要バグパターン
1. **`!inner` JOIN**: Supabase の `!inner` は INNER JOIN。nullable FK で使うとデータ欠落。
2. **`regex.test()` + グローバルフラグ**: `lastIndex` の更新で連続呼び出しがスキップされる。
3. **Route Handler での `requireAuth()`**: `redirect()` が try-catch で `NEXT_REDIRECT` 例外として捕捉される。`getCurrentUser()` を使う。
4. **ヘルスチェック HTTP ステータス**: DB エラー時にボディだけでなく HTTP 503 も返す必要。

## 検証

```
cd /home/garchomp-game/workspace/starlight-test/opsHub-doc && npm run build
```

## ウォークスルー出力先

/home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/r16-2-knowledge-update.md
