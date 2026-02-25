---
title: "R13-1: ドキュメント管理 仕様書作成"
description: "SCR-F01 + API-F01 の仕様書を新規作成"
---

あなたは OpsHub の設計ドキュメント担当です。
ドキュメント管理機能（REQ-F01）の画面仕様書（SCR-F01）と API 仕様書（API-F01）を新規作成してください。

## 参照ファイル

### テンプレート
- /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/screens/template.md
- /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/apis/template.md

### 類似仕様
- /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/screens/SCR-C01-2.md （プロジェクト詳細 — ドキュメントはPJ配下）

### 要件
- /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/requirements/req-catalog/index.md （REQ-F01）

### DB設計メモ
- /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/plans/phase-2-4-plan.md （documents テーブル設計）

## SCR-F01 設計指針

### 画面構成
- URL: `/projects/[id]/documents`
- プロジェクト詳細の子ルート（タブまたはサブページ）
- アクセス権限: プロジェクトメンバー（閲覧）、PM / Tenant Admin（CRUD）

### 機能
1. **ファイル一覧**: テーブル（ファイル名, サイズ, MIME, アップロード者, 日時, 操作）
2. **アップロード**: Ant Design `Upload` or `Dragger` コンポーネント
   - Supabase Storage にアップロード
   - `documents` テーブルにメタデータ INSERT
   - 最大ファイルサイズ: 10MB
   - 許可 MIME: PDF, 画像(png/jpg/gif), Office文書(docx/xlsx/pptx), テキスト
3. **ダウンロード**: Supabase Storage の signedURL で一時URL生成
4. **削除**: PM / Tenant Admin のみ
5. **プレビュー**: 画像/PDF はモーダルプレビュー（将来拡張）

## API-F01 設計指針

### Server Actions
1. `getDocuments(projectId)` — プロジェクトのドキュメント一覧
2. `uploadDocument(projectId, file)` — ファイルアップロード
3. `deleteDocument(id)` — ファイル削除
4. `getDownloadUrl(id)` — 署名付きダウンロードURL取得

### ストレージ構造
- Bucket: `project-documents`
- Path: `{tenant_id}/{project_id}/{uuid}_{filename}`

## 出力ファイル

1. /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/screens/SCR-F01.md
2. /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/apis/API-F01.md

## 検証
```
cd /home/garchomp-game/workspace/starlight-test/opsHub-doc && npm run build
```

## ウォークスルー出力先
/home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/r13-1-document-spec.md
