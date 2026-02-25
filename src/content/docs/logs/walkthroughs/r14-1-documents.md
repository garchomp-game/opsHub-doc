---
title: "R14-1: ドキュメント管理の実装 ウォークスルー"
---

# R14-1: ドキュメント管理の実装

> 実施日: 2026-02-25

## 概要

REQ-F01 に基づき、プロジェクト配下のドキュメント管理機能（一覧・アップロード・ダウンロード・削除）を実装した。

---

## 作成・変更ファイル一覧

| ファイル | 種別 | 内容 |
|---|---|---|
| `supabase/migrations/20260225000001_documents.sql` | NEW | documents テーブル + RLS + Storage バケット |
| `src/types/database.ts` | REGEN | 型再生成（documents 追加） |
| `src/app/(authenticated)/projects/[id]/documents/_actions.ts` | NEW | Server Actions（4 アクション） |
| `src/app/(authenticated)/projects/[id]/documents/page.tsx` | NEW | Server Component ページ |
| `src/app/(authenticated)/projects/[id]/documents/_components/DocumentListClient.tsx` | NEW | Client Component |
| `src/app/(authenticated)/projects/[id]/_components/ProjectDetailClient.tsx` | MOD | ドキュメントタブ追加 |

---

## 1. マイグレーション

**ファイル**: `20260225000001_documents.sql`

### テーブル
- `documents` テーブル（DD-DB-015 準拠）
- カラム: id, tenant_id, project_id, name, file_path, file_size(bigint), mime_type, uploaded_by, created_at, updated_at

### RLS ポリシー
| ポリシー | 対象 | ロジック |
|---|---|---|
| `documents_select` | SELECT | PJメンバー + PM + TenantAdmin |
| `documents_insert` | INSERT | PM + TenantAdmin（uploaded_by = 自分） |
| `documents_delete` | DELETE | PM + TenantAdmin |

### Storage
- バケット `project-documents`（`public: false`）
- Storage ポリシー: SELECT / INSERT / DELETE（テナントID フォルダで分離）

### その他
- インデックス: `idx_documents_tenant_project(tenant_id, project_id)`
- トリガー: `documents_updated_at`（`update_updated_at()` 再利用）

---

## 2. Server Actions

**ファイル**: `_actions.ts`

| Action | 用途 | 認可 | 監査ログ |
|---|---|---|---|
| `getDocuments` | 一覧取得 | PJメンバー / PM / Admin | — |
| `uploadDocument` | アップロード | PM / Admin | `document.upload` |
| `deleteDocument` | 削除 | PM / Admin | `document.delete` |
| `getDownloadUrl` | signedURL生成 | PJメンバー / PM / Admin | `document.download` |

### 実装パターン
- `withAuth` ラッパー使用（`getDocuments`, `deleteDocument`, `getDownloadUrl`）
- `uploadDocument` は `FormData` を受け取るためラッパー不使用、独自 try-catch
- DB INSERT 失敗時の Storage ロールバック実装
- Storage パス: `{tenant_id}/{project_id}/{uuid}_{filename}`

---

## 3. ページ・コンポーネント

### Server Component (`page.tsx`)
- `requireAuth()` → プロジェクト存在確認 → `getDocuments()` → `canManage` 判定

### Client Component (`DocumentListClient.tsx`)
- **アップロード**: `Upload.Dragger`（PM/Admin のみ表示）
- **テーブル列**: ファイル名（MIMEアイコン付き）, サイズ, 種別Tag, アップロード者, 日時, 操作
- **MIME色定義**: PDF=red, 画像=blue, DOCX=geekblue, XLSX=green, PPTX=orange, TXT=default
- **ダウンロード**: signedURL → `window.open()`
- **削除**: `Modal.confirm` → `deleteDocument()`
- **バリデーション**: クライアント側 10MB / MIME チェック

---

## 4. ナビゲーション

`ProjectDetailClient.tsx` の Tabs に「ドキュメント」タブを追加。`/projects/[id]/documents` に遷移。

---

## 検証結果

```
$ npm run build

✓ Compiled successfully in 14.8s
✓ Finished TypeScript in 7.3s
✓ Generating static pages (23/23)

Route: ƒ /projects/[id]/documents
```

**ビルド成功**: TypeScript 型チェック・Next.js ビルド ともにエラーなし。
