---
title: Supabase 構成
description: Supabase Docker 環境のサービス構成と設定
---

## サービス構成

Docker Compose で以下のサービスが起動します。

| サービス | イメージ | ポート | 役割 |
|---|---|---|---|
| **Kong** | `kong:2.8.1` | `8000`, `8443` | API Gateway — 全リクエストの認証・ルーティング |
| **GoTrue** | `supabase/gotrue` | internal | 認証（サインアップ、ログイン、OAuth） |
| **PostgREST** | `postgrest/postgrest` | internal | PostgreSQL の RESTful API 自動生成 |
| **Realtime** | `supabase/realtime` | internal | WebSocket によるリアルタイムデータ配信 |
| **Storage** | `supabase/storage-api` | internal | ファイルストレージ（S3 互換 API） |
| **Studio** | `supabase/studio` | `3100` | 管理ダッシュボード UI |
| **pg_meta** | `supabase/postgres-meta` | internal | PostgreSQL メタデータ API（Studio 用） |
| **PostgreSQL** | `supabase/postgres:15.8` | `5432` | メインデータベース |
| **Inbucket** | `inbucket/inbucket` | `9000`, `2500` | ローカルメールサーバー（テスト用） |

## リクエストフロー

```
クライアント (Next.js)
    ↓
Kong (:8000)  ─── API Key 認証
    ├── /auth/v1/*     → GoTrue (:9999)
    ├── /rest/v1/*     → PostgREST (:3000)
    ├── /realtime/v1/* → Realtime (:4000)
    ├── /storage/v1/*  → Storage (:5000)
    └── /pg/*          → pg_meta (:8080)
```

## 環境変数

主要な環境変数（`supabase/.env`）:

| 変数 | 説明 | デフォルト |
|---|---|---|
| `POSTGRES_PASSWORD` | DB パスワード | デモ値（要変更） |
| `JWT_SECRET` | JWT 署名キー（32文字以上） | デモ値（要変更） |
| `ANON_KEY` | 匿名ユーザー用 API キー | Supabase デモキー |
| `SERVICE_ROLE_KEY` | 管理者用 API キー（RLS バイパス） | Supabase デモキー |
| `SITE_URL` | アプリケーションの URL | `http://localhost:3000` |
| `STUDIO_PORT` | Studio のポート | `3100` |

## 操作コマンド

```bash
# 起動
cd app/supabase && docker compose up -d

# 停止
docker compose down

# ログ確認
docker compose logs -f [サービス名]

# DB に直接接続
docker compose exec db psql -U postgres
```
