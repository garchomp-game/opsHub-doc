---
title: "R9-4: NFR運用基盤（構造化ログ + ヘルスチェック + CSP）"
---

# R9-4: NFR運用基盤の実装

> **実施日**: 2026-02-24
> **対象 NFR**: NFR-04a（構造化ログ）、NFR-04b（ヘルスチェック）、NFR-01f（CSP設定）

---

## 変更サマリ

| NFR | 対応内容 | ファイル |
|---|---|---|
| NFR-04a | JSON構造化ロガー | `src/lib/logger.ts` (NEW) |
| NFR-04a | 既存 console.error の置換 | `src/lib/actions.ts`, `src/lib/notifications.ts` |
| NFR-04b | ヘルスチェックエンドポイント | `src/app/api/health/route.ts` (NEW) |
| NFR-01f | CSP + セキュリティヘッダー | `next.config.ts` |

---

## タスク1: 構造化ログ（NFR-04a）

### `src/lib/logger.ts`（新規）

軽量な構造化ロガーを外部ライブラリなしで実装。

- **出力形式**: JSON（`LogEntry` 型）
  - `timestamp` / `level` / `message` / `context?` / `error?`
- **フィルタリング**: `LOG_LEVEL` 環境変数（デフォルト: `info`）
- **出力先**: `error` / `warn` → `console.error`、`info` / `debug` → `console.log`

### 既存コードの修正

- **`src/lib/actions.ts`**: `withAuth` の catch ブロックに `logger.error("Server Action failed", { code }, error)` を追加
- **`src/lib/notifications.ts`**: `console.error` → `logger.error` に置換（Supabase エラーオブジェクトをコンテキストに含む）

---

## タスク2: ヘルスチェック（NFR-04b）

### `src/app/api/health/route.ts`（新規）

`GET /api/health` エンドポイントを実装。

- **DB接続チェック**: `createAdminClient()` で `tenants` テーブルに `select('id').limit(1)` を実行
- **正常レスポンス**: `{ status: 'healthy', timestamp, version, database: 'healthy' }`（200）
- **異常レスポンス**: `{ status: 'unhealthy', timestamp }`（503）
- `force-dynamic` でキャッシュを無効化

---

## タスク3: CSP設定（NFR-01f）

### `next.config.ts`（修正）

全ルート `/(.*)`  に以下のセキュリティヘッダーを適用:

| ヘッダー | 値 |
|---|---|
| Content-Security-Policy | `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' https://*.supabase.co wss://*.supabase.co; frame-ancestors 'none'` |
| X-Frame-Options | DENY |
| X-Content-Type-Options | nosniff |
| Referrer-Policy | strict-origin-when-cross-origin |

> `unsafe-inline` / `unsafe-eval` は Next.js 開発モード + Ant Design のインラインスタイルに必要。本番最適化時は nonce ベースへの移行を推奨。

---

## 検証結果

```
npm run build → Exit code: 0

Route (app)
├ ƒ /api/health          ← 新規追加
├ ƒ /api/timesheets/export
...（全19ルート正常ビルド）
```

---

## NFR リスク改善

| NFR | Before | After |
|---|---|---|
| NFR-04a（構造化ログ） | 🔴 高（console.error のみ） | 🟢 低（JSON構造化ログ実装済） |
| NFR-04b（ヘルスチェック） | 🟡 中（エンドポイント未実装） | 🟢 低（`/api/health` 実装済） |
| NFR-01f（CSP/XSS対策） | 🟡 中（Next.js 組込み依存） | 🟢 低（CSP + セキュリティヘッダー設定済） |
