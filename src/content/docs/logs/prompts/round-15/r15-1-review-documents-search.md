---
title: "R15-1: ドキュメント管理 + 全文検索のレビュー"
description: "REQ-F01 ドキュメント管理と REQ-G02 全文検索の実装レビュー"
---

あなたは OpsHub のコードレビュアーです。以下の実装をレビューしてください。

## レビュー対象

### ドキュメント管理（R14-1）
- /home/garchomp-game/workspace/starlight-test/OpsHub/supabase/migrations/20260225000001_documents.sql
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/projects/[id]/documents/_actions.ts
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/projects/[id]/documents/page.tsx
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/projects/[id]/documents/_components/DocumentListClient.tsx

### 全文検索（R14-2）
- /home/garchomp-game/workspace/starlight-test/OpsHub/supabase/migrations/20260225000002_search_indexes.sql
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/search/_actions.ts
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/search/page.tsx
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/search/_components/SearchResultsClient.tsx
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/_components/HeaderSearchBar.tsx

## 仕様書
- SCR-F01: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/screens/SCR-F01.md
- API-F01: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/apis/API-F01.md
- SCR-G02: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/screens/SCR-G02.md
- API-G01: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/apis/API-G01.md
- ADR-0006: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/adr/ADR-0006.md

## レビュー観点

### ドキュメント管理
- [ ] Supabase Storage バケット設定（public: false）
- [ ] Storage パス構造（{tenant_id}/{project_id}/{uuid}_{filename}）
- [ ] Storage RLS ポリシー（テナント分離）
- [ ] uploadDocument: ファイルサイズ/MIME バリデーション
- [ ] uploadDocument: DB INSERT 失敗時の Storage ロールバック
- [ ] deleteDocument: Storage + DB 両方の削除
- [ ] getDownloadUrl: signedURL 有効期限（60秒）
- [ ] 権限チェック（Member=閲覧DL, PM/Admin=CRUD）
- [ ] 監査ログ（document.upload, document.delete, document.download）

### 全文検索
- [ ] pg_trgm 拡張の有効化
- [ ] GIN インデックス（4テーブル）
- [ ] SQL LIKE メタ文字エスケープ（%, _, \）
- [ ] Promise.all 4並列検索
- [ ] 経費のロール別データ範囲
- [ ] キーワードハイライト（mark タグ or 同等）
- [ ] ヘッダー検索バーの遷移（/search?q=）

### 共通
- [ ] `withAuth` パターン使用
- [ ] `writeAuditLog` 呼び出し
- [ ] `tenant_id` フィルタ
- [ ] 型安全性
- [ ] エラーハンドリング

## 修正が必要な場合

発見した問題は **その場で修正** してください。

## 検証

```bash
cd /home/garchomp-game/workspace/starlight-test/OpsHub && npm run build
```

## ウォークスルー出力先

/home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/r15-1-review-documents-search.md
