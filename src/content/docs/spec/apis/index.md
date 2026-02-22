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
- **例外**: Webhook受信、外部システム連携は Route Handler
- **認可**: 全Action先頭で `auth.getUser()` + ロールチェック
- **RLS**: Supabase Client SDK 経由のため自動適用

## Must API仕様

| SPEC-API | 名称 | 種別 | REQ | ステータス |
|---|---|---|---|---|
| [API-B01](./API-B01/) | 申請一覧取得 | Server Component | REQ-B03 | Draft |
| [API-B02](./API-B02/) | 申請作成/更新 | Server Action | REQ-B01 | Draft |
| [API-B03](./API-B03/) | 申請承認/差戻し | Server Action | REQ-B02 | Draft |
| API-C01 | プロジェクトCRUD | Server Action | REQ-C01 | 未着手 |
| API-C04 | 工数入力/更新 | Server Action | REQ-C03 | 未着手 |
| API-A02 | ユーザー招待 | Server Action | REQ-A02 | 未着手 |

## Should / Could API仕様

Must完了後に着手。
