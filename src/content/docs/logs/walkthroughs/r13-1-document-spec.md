---
title: "R13-1: ドキュメント管理 仕様書作成 ウォークスルー"
description: SCR-F01（画面仕様）+ API-F01（API仕様）の作成結果
---

## サマリ

| 項目 | 内容 |
|---|---|
| **タスク** | R13-1: ドキュメント管理 仕様書作成 |
| **対象 REQ** | REQ-F01 ドキュメント管理 |
| **成果物** | SCR-F01.md, API-F01.md |
| **ビルド結果** | ✅ 成功（157 pages） |

---

## 作成ファイル

### SCR-F01 — ドキュメント管理画面仕様

- **パス**: [`spec/screens/SCR-F01.md`](/spec/screens/scr-f01/)
- **URL**: `/projects/[id]/documents`
- **内容**:
  - ワイヤーフレーム（アップロードエリア + ファイル一覧テーブル）
  - テーブル列定義（ファイル名, サイズ, MIME, アップロード者, 日時, 操作）
  - MIME 種別色定義（PDF=red, 画像=blue, Office各種）
  - アップロード仕様（Ant Design Dragger, 最大10MB, 許可MIME一覧）
  - ストレージパス構造（`{tenant_id}/{project_id}/{uuid}_{filename}`）
  - アップロード処理フロー（Mermaid図）
  - ダウンロード仕様（signedURL, 有効期限60秒）
  - プレビュー仕様（Phase 3 将来拡張）
  - 権限マトリクス（Member=閲覧/DL, PM/Admin=CRUD）
  - 監査ログポイント（upload, delete, download）

### API-F01 — ドキュメント管理 API 仕様

- **パス**: [`spec/apis/API-F01.md`](/spec/apis/api-f01/)
- **内容**:
  - Server Action 4本: `getDocuments`, `uploadDocument`, `deleteDocument`, `getDownloadUrl`
  - 各 Action の型定義・バリデーション・権限チェック
  - 処理フロー図（Mermaid）
  - エラーコード体系（ERR-AUTH-F01/F02, ERR-VAL-F01〜F03, ERR-DOC-001, ERR-SYS-F01/F02）
  - エラー時ロールバック仕様（Storage + DB 不整合防止）
  - 監査ログポイント一覧

---

## 参照した設計資源

| 資源 | 用途 |
|---|---|
| `spec/screens/template.md` | 画面仕様テンプレート |
| `spec/apis/template.md` | API仕様テンプレート |
| `spec/screens/SCR-C01-2.md` | 類似仕様（PJ詳細・タブ構成） |
| `spec/screens/SCR-D01.md` | 類似パターン（テーブル + フォーム） |
| `spec/apis/API-D01.md` | 類似パターン（CRUD Server Actions） |
| `spec/apis/API-H01.md` | 類似パターン（バリデーション・フロー図） |
| `requirements/req-catalog/index.md` | REQ-F01 要件定義 |
| `plans/phase-2-4-plan.md` | documents テーブル設計（DD-DB-015） |

---

## ビルド検証

```
npm run build → ✓ Completed
157 page(s) built in 18.30s
新規ページ確認:
  ├─ /spec/apis/api-f01/index.html ✅
  └─ /spec/screens/scr-f01/index.html ✅
```
