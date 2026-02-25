---
title: "R14-1: ドキュメント管理の実装"
description: "マイグレーション + Supabase Storage + ドキュメント一覧/アップロード/ダウンロード/削除"
---

あなたは OpsHub の開発者です。ドキュメント管理機能（REQ-F01）を実装してください。

## 参照する仕様書

- SCR-F01: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/screens/SCR-F01.md
- API-F01: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/apis/API-F01.md

## 参照する既存実装（パターン参照）

- プロジェクト詳細: /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/projects/[id]/
- ナレッジ: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/knowledge.md

## 参照する DB 設計

- DB設計: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/detail/db/index.md （DD-DB-015）
- RLS設計: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/detail/rls/index.md

## 作成するファイル

### 1. マイグレーション
- `/home/garchomp-game/workspace/starlight-test/OpsHub/supabase/migrations/20260225000001_documents.sql`
  - documents テーブル
  - RLS ポリシー（select, insert, delete）
  - インデックス
  - updated_at トリガー
  - Supabase Storage バケット作成: `INSERT INTO storage.buckets (id, name, public) VALUES ('project-documents', 'project-documents', false);`
  - Storage ポリシー（テナント内ユーザーのみアクセス）

### 2. 型再生成
```bash
cd /home/garchomp-game/workspace/starlight-test/OpsHub
npx supabase db reset
npx supabase gen types typescript --local > src/types/database.ts
```

### 3. Server Actions
- `/home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/projects/[id]/documents/_actions.ts`
  - `getDocuments(projectId)` — ドキュメント一覧取得
  - `uploadDocument(projectId, formData)` — ファイルアップロード（Storage + DB INSERT）
  - `deleteDocument(id)` — ファイル削除（Storage + DB DELETE）
  - `getDownloadUrl(id)` — 署名付きURL生成（60秒有効）

### 4. ページ（Server Component）
- `/home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/projects/[id]/documents/page.tsx`

### 5. Client Component
- `/home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/projects/[id]/documents/_components/DocumentListClient.tsx`
  - Ant Design `Upload.Dragger` でドラッグ＆ドロップアップロード
  - ファイル一覧テーブル（名前, サイズ, MIME, アップロード者, 日時, 操作）
  - ダウンロードボタン / 削除ボタン（PM / TenantAdmin のみ）
  - ファイルサイズ表示（KB/MB 変換）
  - アップロード進捗表示

### 6. プロジェクト詳細からのナビゲーション
- `/home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/projects/[id]/page.tsx`
  - 「ドキュメント」タブまたはリンクを追加

## 制約

- 最大ファイルサイズ: 10MB
- 許可 MIME: `application/pdf`, `image/*`, `application/vnd.openxmlformats-officedocument.*`, `text/plain`
- Storage パス: `{tenant_id}/{project_id}/{uuid}_{filename}`

## 検証

```bash
cd /home/garchomp-game/workspace/starlight-test/OpsHub && npm run build
```

## ウォークスルー出力先

/home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/r14-1-documents.md
