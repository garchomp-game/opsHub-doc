---
title: "R13-2: 全文検索 仕様書 + ADR-0006 ウォークスルー"
description: "SCR-G02, API-G01, ADR-0006 の作成記録"
---

## 概要

全文検索機能（REQ-G02）に関する3つの設計ドキュメントを新規作成した。

## 作成ファイル

| # | ファイル | 内容 |
|---|---|---|
| 1 | [ADR-0006.md](/adr/adr-0006/) | 検索方式の選定 — `pg_trgm` + `GIN` インデックス採用 |
| 2 | [SCR-G02.md](/spec/screens/scr-g02/) | 全文検索画面仕様 — カテゴリタブ・結果カード・ハイライト |
| 3 | [API-G01.md](/spec/apis/api-g01/) | 全文検索 API 仕様 — `searchAll` Server Action |

## ADR-0006 要約

- **採用**: PostgreSQL `pg_trgm` 拡張 + `GIN` インデックス
- **却下**: Supabase Vector（オーバーキル）、Elasticsearch（外部依存）、Meilisearch（同上）
- **根拠**: 外部依存なし、RLS 互換、Supabase ネイティブ対応、10万レコードで1秒以内（NFR-02e）
- **将来**: `tsvector` + `pg_bigm`（日本語辞書）への移行パスあり

## SCR-G02 要約

- URL: `/search?q={キーワード}`、全ロールアクセス可
- カテゴリ別タブ: すべて / ワークフロー / プロジェクト / タスク / 経費
- 結果カード: アイコン・タイトル（ハイライト）・スニペット・ステータス Tag・日付・リンク
- ロール別データ範囲を RLS で自動制御

## API-G01 要約

- Server Action: `searchAll(query, category?, page?)`
- 4カテゴリを `Promise.all` で並列取得（`ILIKE` 検索）
- `category = "all"` → 各10件、個別カテゴリ → 20件/ページ
- 経費の権限: Member は自分のみ、Accounting/TenantAdmin は全件

## 検証結果

```
npm run build → exit code 0
160 page(s) built in 17.39s
```

ビルド成功を確認。ADR-0006、SCR-G02、API-G01 の3ページが正常に生成された。
