---
title: "R16-1: 画面一覧・API一覧の最終更新"
---

## 概要

Phase 2-3 で追加された仕様書を一覧インデックスファイルとサイドバーに反映した。

## 変更ファイル

| ファイル | 変更内容 |
|---|---|
| `spec/screens/index.md` | SCR-D03, SCR-F01, SCR-G02, SCR-H01, SCR-H02 を追加画面仕様テーブルに追加 |
| `spec/apis/index.md` | API-D02, API-F01, API-G01, API-H01 を追加API仕様テーブルに追加 |
| `requirements/screens/index.md` | Epic E の請求画面を SCR-H01/H02 に採番修正、注記を更新 |
| `astro.config.mjs` | サイドバーに画面5件・API4件を追加 |

## 追加エントリ詳細

### 画面仕様 (spec/screens/index.md)

| SPEC-SCR | 画面名 | REQ |
|---|---|---|
| SCR-D03 | 経費集計 | REQ-D02 |
| SCR-F01 | ドキュメント管理 | REQ-F01 |
| SCR-G02 | 全文検索 | REQ-G02 |
| SCR-H01 | 請求一覧 | REQ-E01 |
| SCR-H02 | 請求書詳細/編集 | REQ-E01 |

### API仕様 (spec/apis/index.md)

| SPEC-API | 名称 | REQ |
|---|---|---|
| API-D02 | 経費集計API | REQ-D02 |
| API-F01 | ドキュメント管理API | REQ-F01 |
| API-G01 | 全文検索API | REQ-G02 |
| API-H01 | 請求API | REQ-E01 |

### 画面定義 (requirements/screens/index.md)

- Epic E の旧 SCR-E01/E02 → SCR-H01/H02 に修正（SCR-E01 は通知システムとして使用済みのため）
- SCR-D03, SCR-F01, SCR-G02 は既に登録済みのため変更なし

## 検証結果

```
$ npm run build
✓ Completed in 1.69s.
Found 175 HTML files.
Finished building search index in 2.84s.
175 page(s) built in 17.10s
Complete!
```

ビルド成功・エラーなし。
