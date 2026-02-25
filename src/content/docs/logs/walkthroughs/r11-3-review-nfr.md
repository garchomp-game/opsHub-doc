---
title: "R11-3: NFR運用基盤レビュー"
description: "構造化ログ・ヘルスチェック・CSP設定の実装レビュー結果"
---

## レビュー概要

| 対象 | ファイル | 判定 |
|------|----------|------|
| 構造化ログ | `src/lib/logger.ts` | ✅ OK |
| ログ置換 (withAuth) | `src/lib/actions.ts` | ✅ OK |
| ログ置換 (通知ヘルパー) | `src/lib/notifications.ts` | ✅ OK |
| ヘルスチェック | `src/app/api/health/route.ts` | ⚠️ → 修正済 |
| CSP設定 | `next.config.ts` | ✅ OK |

## 構造化ログ（NFR-04a）

### logger.ts

- [x] **JSON 形式出力** — `JSON.stringify(entry)` で `timestamp`, `level`, `message`, `context`, `error` を出力
- [x] **LOG_LEVEL フィルタリング** — `getCurrentLevel()` で `process.env.LOG_LEVEL` を参照、デフォルト `info`
- [x] **error に stack trace** — `formatEntry` が `Error.stack` を `error.stack` として含める
- [x] **出力先の使い分け** — `error`/`warn` は `console.error`、`info`/`debug` は `console.log`

### ログ置換状況

- [x] `actions.ts` (withAuth catch) — `logger.error` に置換済み
- [x] `notifications.ts` (lib) — `logger.error` に置換済み

### 修正: 残存 console.error の置換

以下のファイルで計7箇所の `console.error` が `logger.error` に未置換だった:

| ファイル | 箇所数 |
|----------|--------|
| `_actions/dashboard.ts` | 5 |
| `_actions/notifications.ts` | 2 |

すべて `logger.error(message, { supabaseError: error })` 形式に置換済み。

## ヘルスチェック（NFR-04b）

### route.ts

- [x] **DB 接続チェックが軽量** — `select("id").limit(1)` on `tenants` テーブル
- [x] **`force-dynamic`** — キャッシュ無効化済み
- [x] **認証不要** — `createAdminClient()` 使用、認証チェックなし（公開エンドポイント）

### 修正: 異常時の HTTP ステータス

**修正前**: DB エラー時にボディは `status: "unhealthy"` だが HTTP 200 を返していた。

**修正後**: `error` がある場合は HTTP 503 を返すよう変更。

```diff
+        const httpStatus = error ? 503 : 200;
         return Response.json({
             status,
             ...
-        });
+        }, { status: httpStatus });
```

## CSP設定（NFR-01f）

### next.config.ts

- [x] **`default-src 'self'`** — 設定済み
- [x] **Supabase URL** — `connect-src 'self' https://*.supabase.co wss://*.supabase.co`
- [x] **X-Frame-Options: DENY** — 設定済み
- [x] **X-Content-Type-Options: nosniff** — 設定済み
- [x] **Ant Design 対応** — `style-src 'self' 'unsafe-inline'` 設定済み
- [x] **追加セキュリティ** — `Referrer-Policy: strict-origin-when-cross-origin`、`frame-ancestors 'none'`

## ビルド検証

```
npm run build → ✓ exit code 0
TypeScript: Compiled successfully
Static pages: 22/22 generated
```

## 変更ファイル一覧

| ファイル | 変更内容 |
|----------|----------|
| `src/app/api/health/route.ts` | DB エラー時に 503 を返すよう修正 |
| `src/app/(authenticated)/_actions/dashboard.ts` | `console.error` × 5 → `logger.error` + import 追加 |
| `src/app/(authenticated)/_actions/notifications.ts` | `console.error` × 2 → `logger.error` + import 追加 |
