---
title: API仕様一覧
description: SPEC-API の目次とステータス管理
---

## 目的 / In-Out / Related
- **目的**: API仕様の一覧管理と進捗追跡
- **対象範囲（In）**: Server Actions / Route Handlers の仕様
- **対象範囲（Out）**: 実装詳細（→ DD-MOD）
- **Related**: [画面仕様](../screens/) / [エラー方針](../errors/) / [監査ログ方針](../audit-logging/)

---

## 設計方針

- **原則**: Server Actions を使用（型安全、API Route 不要）
- **例外**: Webhook受信、外部システム連携、ファイルダウンロードは Route Handler
- **認可**: 全Action先頭で `auth.getUser()` + ロールチェック
- **RLS**: Supabase Client SDK 経由のため自動適用

## 採番ルール

- `API-{Epic}-{REQ番号}` で REQ と 1:1 対応
- 同一 REQ に複数 API がある場合: `-1`, `-2` のサブ番号を付与

## Must API仕様

| SPEC-API | 名称 | 種別 | REQ | 対応画面 | ステータス |
|---|---|---|---|---|---|
| [API-A01](/spec/apis/api-a01/) | テナント管理 | Server Action + Route Handler | REQ-A01 | SCR-A01 | Draft |
| [API-A02](/spec/apis/api-a02/) | ユーザー招待/管理 | Server Action | REQ-A02 | SCR-A02 | Draft |
| [API-B01](/spec/apis/api-b01/) | 申請一覧取得 | Server Component | REQ-B03 | SCR-B01 | Draft |
| [API-B02](/spec/apis/api-b02/) | 申請作成/更新 | Server Action | REQ-B01 | SCR-B02 | Draft |
| [API-B03](/spec/apis/api-b03/) | 申請承認/差戻し | Server Action | REQ-B02 | SCR-B03 | Draft |
| [API-C01](/spec/apis/api-c01/) | プロジェクトCRUD | Server Action | REQ-C01 | SCR-C01-1, C01-2 | Draft |
| [API-C02](/spec/apis/api-c02/) | タスクCRUD | Server Action | REQ-C02 | SCR-C02 | Draft |
| [API-C03-1](/spec/apis/api-c03-1/) | 工数入力/更新 | Server Action | REQ-C03 | SCR-C03-1 | Draft |
| [API-C03-2](/spec/apis/api-c03-2/) | 工数集計/CSV出力 | Server Component + Route Handler | REQ-C03 | SCR-C03-2 | Draft |

## API が不要な画面

| 画面 | 理由 |
|---|---|
| SCR-001 ログイン | Supabase Auth 標準API（`signInWithPassword`）で完結 |
| SCR-002 ダッシュボード | Server Component で各テーブルを直接クエリ（専用APIは不要） |

## 追加 API仕様

| SPEC-API | 名称 | 種別 | REQ | 対応画面 | ステータス |
|---|---|---|---|---|---|
| [API-D01](/spec/apis/api-d01/) | 経費管理 | Server Actions | REQ-D01 | SCR-D01 | Draft |
| [API-D02](/spec/apis/api-d02/) | 経費集計API | Server Actions | REQ-D02 | SCR-D03 | Draft |
| [API-E01](/spec/apis/api-e01/) | 通知API | Server Actions + ヘルパー | REQ-G01 | SCR-E01 | Draft |
| [API-F01](/spec/apis/api-f01/) | ドキュメント管理API | Server Actions | REQ-F01 | SCR-F01 | Draft |
| [API-G01](/spec/apis/api-g01/) | 全文検索API | Server Actions | REQ-G02 | SCR-G02 | Draft |
| [API-H01](/spec/apis/api-h01/) | 請求API | Server Actions | REQ-E01 | SCR-H01, H02 | Draft |

## Should / Could API仕様

Must完了後に着手。
