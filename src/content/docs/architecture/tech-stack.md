---
title: 技術スタック
description: 使用技術の一覧と選定理由
---

## スタック一覧

| カテゴリ | 技術 | バージョン |
|---|---|---|
| フレームワーク | Next.js (App Router) | 16.x |
| 言語 | TypeScript | 5.x |
| UI ライブラリ | Ant Design | 5.x |
| SSR 統合 | `@ant-design/nextjs-registry` | — |
| BaaS | Supabase (Docker self-hosting) | — |
| 認証連携 | `@supabase/ssr` | — |
| データベース | PostgreSQL | 15.x |
| ドキュメント | Astro Starlight | — |

## 選定ポイント

### Next.js (App Router)

- React Server Components による効率的なサーバーサイドレンダリング
- Server Actions でフォーム処理などのバックエンド処理をシンプルに記述
- ファイルベースルーティングによる直感的なページ管理

### Ant Design

- エンタープライズ向けの豊富な UI コンポーネント
- `@ant-design/nextjs-registry` により SSR / CSS-in-JS の問題を解消
- `ConfigProvider` でテーマの一元管理が可能

### Supabase (Self-hosting)

- PostgreSQL ベースで RLS（Row Level Security）による強力なアクセス制御
- 認証・ストレージ・リアルタイム機能を統合的に提供
- Docker Compose で完全なローカル環境を再現可能
- `@supabase/ssr` による Cookie ベース認証で Next.js Server Components と自然に統合
