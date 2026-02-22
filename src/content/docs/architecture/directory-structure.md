---
title: ディレクトリ構成
description: プロジェクトのディレクトリ構成と各ファイルの役割
---

## 全体構成

```
starlight-test/
├── app/                          # Next.js アプリケーション
│   ├── src/
│   │   ├── app/                  # App Router ページ
│   │   ├── lib/                  # ユーティリティ・クライアント
│   │   └── middleware.ts         # Next.js Middleware
│   ├── supabase/                 # Supabase Docker 環境
│   ├── .env.local                # 環境変数（git 管理外）
│   └── package.json
└── docs/                         # Astro Starlight ドキュメント
    ├── src/content/docs/         # ドキュメントコンテンツ
    ├── astro.config.mjs
    └── package.json
```

## `app/src/` の詳細

### `app/` — ページとレイアウト

```
src/app/
├── layout.tsx          # ルートレイアウト（AntdRegistry + ConfigProvider）
├── page.tsx            # トップページ
└── globals.css         # グローバルスタイル
```

- `layout.tsx` で `AntdRegistry`（SSR 対応）と `ConfigProvider`（テーマ設定）をラップ
- 新しいページは `src/app/` 以下にディレクトリ・ファイルを追加

### `lib/supabase/` — Supabase クライアント

```
src/lib/supabase/
├── client.ts           # Client Components 用（ブラウザ側）
├── server.ts           # Server Components / Server Actions 用
└── middleware.ts        # セッションリフレッシュヘルパー
```

| ファイル | 用途 | `createClient()` の呼び方 |
|---|---|---|
| `client.ts` | Client Components | `const supabase = createClient()` |
| `server.ts` | Server Components / Actions | `const supabase = await createClient()` |
| `middleware.ts` | Middleware 内部 | `updateSession(request)` |

### `middleware.ts` — Next.js Middleware

- 全リクエストで Supabase の認証セッションを自動リフレッシュ
- 静的アセット（`_next/static`, 画像等）はスキップ

## `app/supabase/` の詳細

```
supabase/
├── docker-compose.yml    # サービス定義
├── .env                  # 環境変数テンプレート
└── volumes/
    ├── api/
    │   └── kong.yml      # API Gateway ルーティング設定
    └── db/
        ├── roles.sql     # DB ロール・スキーマ初期化
        ├── jwt.sql       # JWT 設定
        ├── realtime.sql  # Realtime 機能初期化
        └── webhooks.sql  # Webhooks 初期化
```
