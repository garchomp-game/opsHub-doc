---
title: "R16-3: modules/index.md の最終更新"
description: "Phase 2-3 で追加したコードの反映"
---

あなたは OpsHub の設計ドキュメント担当です。
Phase 2-3 で追加されたモジュール・ディレクトリ・ユーティリティ関数を modules/index.md に反映してください。

## 対象ファイル

/home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/detail/modules/index.md

## 参照（最新のディレクトリ構造を取得）

以下のコマンドを実行して最新構造を確認:
```bash
cd /home/garchomp-game/workspace/starlight-test/OpsHub && find src/app -type f -name "*.ts" -o -name "*.tsx" | sort
cd /home/garchomp-game/workspace/starlight-test/OpsHub && find src/lib -type f | sort
```

## 追記すべき内容

### 新規ディレクトリ
1. `expenses/summary/` — 経費集計画面（Server Component + Client Component + Server Actions）
2. `invoices/` — 請求一覧（_constants, _actions, _components, page）
3. `invoices/new/` — 請求書作成
4. `invoices/[id]/` — 請求書詳細/編集
5. `invoices/[id]/_components/` — InvoicePrintView
6. `projects/[id]/documents/` — ドキュメント管理
7. `search/` — 全文検索
8. `_components/HeaderSearchBar.tsx` — ヘッダー検索バー（共通）

### 新規ライブラリ
1. `lib/logger.ts` — 構造化ロガー

### 新規 Route Handler
1. `api/health/route.ts` — ヘルスチェック

### 新規ユーティリティ関数
- `INVOICE_STATUS_LABELS`, `INVOICE_STATUS_COLORS`, `INVOICE_STATUS_TRANSITIONS` — 請求書定数
- `ALLOWED_MIME_TYPES` — ドキュメント管理の許可MIMEタイプ
- `formatFileSize()` — ファイルサイズの人間可読変換
- `escapeCsvField()` — CSVフィールドエスケープ
- `escapeLikePattern()` — SQLのLIKEメタ文字エスケープ
- `highlightText()` — 検索キーワードハイライト

## 手順

1. 現在の modules/index.md を読む
2. 最新のディレクトリ構造と比較
3. 不足しているモジュール・関数を追記
4. 既存の記述を更新（もし古い情報があれば）

## 検証

```
cd /home/garchomp-game/workspace/starlight-test/opsHub-doc && npm run build
```

## ウォークスルー出力先

/home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/r16-3-modules-update.md
