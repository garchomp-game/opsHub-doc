# OpsHub Docs — 設計ドキュメント（Docs-as-Code）

[![Built with Starlight](https://astro.badg.es/v2/built-with-starlight/tiny.svg)](https://starlight.astro.build)

OpsHub（業務統合SaaS）の **要件定義 → 基本設計 → 詳細設計** を Starlight で管理する設計ドキュメントサイトです。

## 📖 ドキュメント構成

```
src/content/docs/
├── START-HERE.mdx          # 入口（トレーサビリティルール）
├── conventions/            # 命名規約・用語集
├── requirements/           # 要件定義
│   ├── project-brief/      #   プロジェクト概要
│   ├── roles/              #   ロール/権限（6ロール）
│   ├── req-catalog/        #   機能要件（15 REQ / 7 Epic）
│   ├── nfr/                #   非機能要件（25+項目）
│   └── screens/            #   画面一覧（21画面）
├── spec/                   # 基本設計
│   ├── architecture/       #   アーキテクチャ概要
│   ├── authz/              #   権限と認可（2層モデル）
│   ├── screens/            #   画面仕様（SCR-B01〜C04）
│   ├── apis/               #   API仕様（API-B01〜B03）
│   ├── errors/             #   例外・エラー方針
│   ├── audit-logging/      #   監査ログ方針
│   └── supabase-client/    #   Supabase クライアント運用規約
├── detail/                 # 詳細設計
│   ├── db/                 #   DB設計（10テーブル + ER図）
│   ├── rls/                #   RLS設計（ポリシーSQL）
│   ├── modules/            #   モジュール設計
│   ├── sequences/          #   状態遷移 / シーケンス図
│   └── testing/            #   テスト方針（4層ピラミッド）
├── adr/                    # ADR（意思決定ログ）
│   ├── ADR-0001.md         #   RBAC/RLS 方式の選定
│   └── ADR-0003.md         #   マルチテナント分離戦略
└── plans/                  # 計画
    └── PLAN-2026-02-22.md  #   WBS / マイルストーン
```

## 🛠 技術スタック

| 項目 | 技術 |
|---|---|
| フロントエンド | Next.js (App Router) + Ant Design |
| バックエンド | Supabase (Self-hosting / Docker) |
| 認証 | Supabase Auth (GoTrue) |
| 認可 | RBAC (`user_roles`) + PostgreSQL RLS |
| テナント分離 | `tenant_id` + RLS |
| ドキュメント | Astro Starlight |

## 🚀 クイックスタート

```bash
# 依存インストール
npm install

# 開発サーバー起動
npm run dev
# → http://localhost:4321

# ビルド（静的サイト生成）
npm run build
```

## 📏 ドキュメント規約

- **ファイル形式**: `.md`（設計文書）/ `.mdx`（手順・導線ページのみ）
- **ページ冒頭**: 必ず **目的 / In-Out / Related** を記載
- **ID体系**:
  - `REQ-xxx` — 機能要件
  - `SPEC-SCR-xxx` — 画面仕様
  - `SPEC-API-xxx` — API仕様
  - `DD-DB-xxx` / `DD-MOD-xxx` — 詳細設計
  - `ADR-xxxx` — 意思決定ログ
- **追跡性**: REQ → SPEC → DD の Related リンクを全ページに配置

## 🧞 コマンド一覧

| コマンド | 動作 |
|---|---|
| `npm install` | 依存インストール |
| `npm run dev` | 開発サーバー起動（`localhost:4321`） |
| `npm run build` | 本番ビルド（`./dist/`） |
| `npm run preview` | ビルド結果のプレビュー |
