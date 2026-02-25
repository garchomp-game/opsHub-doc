---
title: "R16-2: knowledge.md の最終更新"
description: "Phase 2-3 で追加した実装パターンと設計判断をナレッジベースに反映"
---

## 概要

Phase 2-3（R9〜R15）で蓄積された実装パターン・設計判断・レビューで発見されたバグパターンを `knowledge.md` に追記した。

## 変更ファイル

| ファイル | 変更内容 |
|---|---|
| `logs/knowledge.md` | Phase 2-3 パターン追記、チケット進捗更新、マイグレーション追加 |

## 追記内容

### 新規セクション: Phase 2-3 追加パターン（8件）

| パターン | 出典 |
|---|---|
| FormData Server Action パターン | R14-1, R15-1 |
| Supabase Storage 連携 | R14-1, R15-1 |
| CSV エクスポート Route Handler | R9-3, R11-1 |
| 構造化ロガー | R9-4 |
| pg_trgm + GIN インデックス検索 | R14-2, R15-1 |
| 横断検索パターン | R14-2, R15-1 |
| 請求書明細パターン | R10-1, R10-2, R11-2 |
| ヘルスチェックエンドポイント | R9-4 |

### 新規セクション: レビューで発見された重要バグパターン（4件）

| バグパターン | 出典 |
|---|---|
| `!inner` JOIN によるデータ欠落 | R11-1 |
| `regex.test()` + グローバルフラグの連続呼出しバグ | R15-1 |
| Route Handler での `requireAuth()` redirect 問題 | R9-3, R11-1 |
| ヘルスチェック HTTP ステータス | R9-4 |

### 既存セクションの更新

- **プロジェクト概要**: 「請求・ドキュメント」を追加
- **DB テーブル**: 12 → 14 テーブル（`invoices`, `invoice_items`, `documents` 追加）
- **共通パターン**: `INVOICE_STATUS_TRANSITIONS`, `INVOICE_STATUS_LABELS`, `next_invoice_number()` RPC 追加
- **チケット進捗**: Phase 2-3 の 9 チケット（REQ-D02, REQ-C03, NFR-04a/b, NFR-01f, REQ-E01×2, REQ-F01, REQ-G02）追加
- **マイグレーション一覧**: `20260225000002_search_indexes.sql` 追加（7件目）

## 参照ウォークスルー

10件のウォークスルーを参照して情報を集約:

- R9-2（経費集計）, R9-3（CSVエクスポート）, R9-4（NFR基盤）
- R10-1（請求一覧）, R10-2（請求詳細）
- R11-1（経費+CSVレビュー）, R11-2（請求レビュー）
- R14-1（ドキュメント管理）, R14-2（全文検索）
- R15-1（ドキュメント+検索レビュー）

## 検証結果

```
$ npm run build
10:59:02 [build] 175 page(s) built in 17.53s
10:59:02 [build] Complete!
Exit code: 0
```

ビルド成功。knowledge.md の Markdown 構文に問題なし。
