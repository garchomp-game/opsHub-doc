---
title: "R14-2: 全文検索の実装"
description: "pg_trgm マイグレーション + 検索API + 検索結果画面 + ヘッダー検索バー"
---

あなたは OpsHub の開発者です。全文検索機能（REQ-G02）を実装してください。

## 参照する仕様書

- SCR-G02: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/screens/SCR-G02.md
- API-G01: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/apis/API-G01.md
- ADR-0006: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/adr/ADR-0006.md

## 参照する既存実装

- ナレッジ: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/knowledge.md
- レイアウト: /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/layout.tsx

## 作成するファイル

### 1. マイグレーション
- `/home/garchomp-game/workspace/starlight-test/OpsHub/supabase/migrations/20260225000002_search_indexes.sql`
  - `CREATE EXTENSION IF NOT EXISTS pg_trgm;`
  - workflows.title に GIN インデックス
  - projects.name に GIN インデックス
  - tasks.title に GIN インデックス
  - expenses.description に GIN インデックス

### 2. Server Actions
- `/home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/search/_actions.ts`
  - `searchAll(query, category?, page?)` — 横断検索
    - workflows: `.ilike('title', '%query%')` — タイトル、ステータス、作成日
    - projects: `.ilike('name', '%query%')` — 名前、ステータス
    - tasks: `.ilike('title', '%query%')` — タイトル、ステータス、担当者
    - expenses: `.ilike('description', '%query%')` — 説明、金額、カテゴリ
  - 各カテゴリ10件ずつ、`Promise.all` で並列取得
  - テナント内のみ（RLS 自動制御）

### 3. 検索結果ページ（Server Component）
- `/home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/search/page.tsx`
  - `searchParams.q` からクエリ取得
  - 空クエリ時は入力案内を表示

### 4. Client Component
- `/home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/search/_components/SearchResultsClient.tsx`
  - カテゴリ別タブ: 全て / ワークフロー / プロジェクト / タスク / 経費
  - 結果カード: アイコン + タイトル + ステータスTag + 日付 + リンク
  - 結果なし: Ant Design `Empty` コンポーネント
  - 件数バッジ（タブに表示）

### 5. ヘッダー検索バー
- `/home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/layout.tsx`
  - ヘッダー領域に Ant Design `Input.Search` を追加
  - Enter キーで `/search?q=入力値` へ遷移
  - `useRouter().push()` で遷移

## 検索クエリのセキュリティ

- `%` や `_` のエスケープ処理（SQL LIKE のメタ文字）
- クエリの最小長: 2文字以上
- クエリの最大長: 100文字以内

## 検証

```bash
cd /home/garchomp-game/workspace/starlight-test/OpsHub
npx supabase db reset  # pg_trgm 拡張適用
npm run build
```

## ウォークスルー出力先

/home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/r14-2-search.md
