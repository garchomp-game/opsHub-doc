---
title: "R13-2: 全文検索 仕様書 + ADR-0006 作成"
description: "SCR-G02 + API-G01 + ADR-0006（検索方式）を新規作成"
---

あなたは OpsHub の設計ドキュメント担当です。
全文検索機能（REQ-G02）の画面仕様書、API仕様書、ADRを新規作成してください。

## 参照ファイル

### テンプレート
- /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/screens/template.md
- /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/apis/template.md

### ADR テンプレート・例
- /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/adr/ADR-0001.md

### 要件
- /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/requirements/req-catalog/index.md （REQ-G02）
- /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/requirements/nfr/index.md （NFR-02e: 検索1秒以内）

## ADR-0006: 検索方式の選定

### ステータス: Accepted

### コンテキスト
- OpsHub は申請・プロジェクト・タスク・経費を横断検索する必要がある
- 日本語対応が必須
- 10万レコード/テーブルのスケールで1秒以内のレスポンス

### 決定
- PostgreSQL の `pg_trgm` 拡張 + `GIN` インデックス を採用
- `ILIKE` による partial match を基本とし、将来的に `tsvector` + 日本語辞書への移行も視野
- 検索対象: workflows.title, projects.name, tasks.title, expenses.description

### 却下された選択肢
- Supabase Vector (embeddings): オーバーキル、コスト高
- Elasticsearch: 外部サービス依存、運用複雑
- Meilisearch: 同上

## SCR-G02 設計指針

### 画面構成
- URL: `/search?q=キーワード`
- ヘッダーの検索バーから遷移
- アクセス権限: 全ロール（自分のテナント内のみ）

### 検索結果表示
- カテゴリ別タブ: 全て / ワークフロー / プロジェクト / タスク / 経費
- 各結果カード:
  - アイコン（カテゴリ別）
  - タイトル（ハイライト付き）
  - 説明文（スニペット）
  - ステータス Tag
  - 日付
  - リンク（対象画面へ遷移）
- 結果なし: 空状態表示

## API-G01 設計指針

### Server Action
1. `searchAll(tenantId, query, category?, page?)` — 横断検索
   - workflows: title, description で `ILIKE` 検索
   - projects: name, description で `ILIKE` 検索
   - tasks: title で `ILIKE` 検索
   - expenses: description で `ILIKE` 検索
2. 各カテゴリ10件ずつ取得、全カテゴリを `Promise.all` で並列

### 権限
- テナント内データのみ（RLS で自動制御）
- 経費は自分の分のみ（Member）、全件（Accounting/TenantAdmin）

## 出力ファイル

1. /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/screens/SCR-G02.md
2. /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/apis/API-G01.md
3. /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/adr/ADR-0006.md

## 検証
```
cd /home/garchomp-game/workspace/starlight-test/opsHub-doc && npm run build
```

## ウォークスルー出力先
/home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/r13-2-search-spec.md
