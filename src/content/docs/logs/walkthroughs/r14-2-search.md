---
title: "R14-2: 全文検索の実装 ウォークスルー"
---

## 概要
全文検索機能（REQ-G02）を実装した。pg_trgm + GIN インデックスによるマイグレーション、横断検索 Server Action、検索結果画面、ヘッダー検索バーを作成。

## 作成・変更ファイル一覧

| ファイル | 種別 | 内容 |
|---|---|---|
| `supabase/migrations/20260225000002_search_indexes.sql` | 新規 | pg_trgm 拡張 + GIN インデックス 4件 |
| `src/app/(authenticated)/search/_actions.ts` | 新規 | `searchAll` Server Action（横断検索） |
| `src/app/(authenticated)/search/page.tsx` | 新規 | 検索結果ページ（Server Component） |
| `src/app/(authenticated)/search/_components/SearchResultsClient.tsx` | 新規 | 検索結果表示（Client Component） |
| `src/app/(authenticated)/_components/HeaderSearchBar.tsx` | 新規 | ヘッダー検索バー（Client Component） |
| `src/app/(authenticated)/layout.tsx` | 変更 | ヘッダーに検索バーを追加 |

## 実装詳細

### 1. マイグレーション
- `CREATE EXTENSION IF NOT EXISTS pg_trgm;` で拡張有効化
- `workflows(title, description)`, `projects(name, description)`, `tasks(title)`, `expenses(description)` に GIN インデックスを作成
- ADR-0006 に準拠

### 2. Server Action (`searchAll`)
- `withAuth` ラッパーで認証 + エラーハンドリング
- SQL LIKE メタ文字（`%`, `_`, `\`）のエスケープ処理
- `category = "all"` → 4カテゴリを `Promise.all` で並列検索（各10件）
- `category = 個別` → 指定カテゴリのみ（20件/ページ、オフセットベース）
- 経費は `hasRole` で権限チェック（Accounting/Tenant Admin はテナント内全件、それ以外は自分のみ）
- 結果を統一 `SearchResult` 型に変換（API-G01 準拠）

### 3. 検索結果ページ
- Server Component で `searchParams.q` からクエリ取得
- 空クエリ時は入力案内 UI を表示
- `searchAll` を呼び出して `SearchResultsClient` にデータを渡す

### 4. SearchResultsClient
- カテゴリ別タブ（すべて / ワークフロー / プロジェクト / タスク / 経費）
- タブにヒット件数バッジ表示
- 結果カード: カテゴリアイコン + タイトル（キーワードハイライト） + ステータス Tag + 日付 + リンク
- スニペット抽出（キーワード前後50文字）
- 結果なし時は `Empty` コンポーネント

### 5. ヘッダー検索バー
- `Input.Search` で Enter or アイコンクリックで `/search?q=` へ遷移
- `layout.tsx` のヘッダーを `space-between` レイアウトに変更

## セキュリティ対策
- SQL LIKE メタ文字のエスケープ（`%`, `_`, `\`）
- クエリ最大長: 100文字
- RLS によるテナント内データ制御
- 経費はロール別フィルタ（Member/PM は自分のみ、Accounting/Admin は全件）

## 検証結果
- `npm run build`: **成功**（TypeScript コンパイル通過）
  - 既存の `dashboard.ts` に `Tables<"notifications">` の型エラーあり（database.ts 未再生成が原因、今回の変更とは無関係）
- `npx supabase db reset`: 要実行（pg_trgm 拡張適用）

## 仕様準拠
- SCR-G02: ✅ UI 構成・タブ・カード・ステータス色定義
- API-G01: ✅ searchAll Action・バリデーション・レスポンス型
- ADR-0006: ✅ pg_trgm + GIN インデックス
