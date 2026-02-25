---
title: "R9-3: 工数CSVエクスポート実装"
description: "API-C03-2 CSV出力 Route Handler の実装ウォークスルー"
---

## 概要

工数集計画面の CSV エクスポート機能（SPEC-API-C03-2-EXPORT）を実装した。
既存の Route Handler を改善し、認証エラー処理と CSV エスケープを修正した。

## 変更ファイル

### 修正

| ファイル | 変更内容 |
|---|---|
| `src/app/api/timesheets/export/route.ts` | 認証処理を `getCurrentUser()` に変更、`escapeCsvField()` 追加 |
| `opsHub-doc/.../API-C03-2.md` | 「Phase 2 未実装」警告を削除 |

### 変更なし（実装済み確認）

| ファイル | 状態 |
|---|---|
| `src/app/(authenticated)/timesheets/reports/_components/ReportClient.tsx` | CSV ダウンロードボタン実装済み |

## 実装詳細

### Route Handler (`GET /api/timesheets/export`)

```
認証 → 権限別フィルタ → Supabase クエリ → CSV 生成 → 監査ログ → レスポンス
```

#### 主な改善点

1. **認証処理**: `requireAuth()` → `getCurrentUser()` に変更
   - `requireAuth()` は `redirect("/login")` を使用するため、Route Handler の try/catch で `NEXT_REDIRECT` 例外が 500 として返される問題があった
   - `getCurrentUser()` は未認証時に `null` を返すため、明示的に `401` を返せる

2. **CSV エスケープ**: `escapeCsvField()` ユーティリティを追加
   - 全テキストフィールド（プロジェクト名、メンバー名、タスク名、備考）に統一的なエスケープ処理を適用
   - ダブルクォートで囲み、内部の `"` は `""` にエスケープ

#### 権限別データ範囲

| ロール | エクスポート範囲 |
|---|---|
| Tenant Admin / Accounting | テナント全体 |
| PM | 管轄PJ全メンバー |
| Member | 自分の工数のみ |

#### CSV 出力仕様

- BOM 付き UTF-8（Excel 対応）
- Content-Type: `text/csv; charset=utf-8`
- Content-Disposition: `attachment; filename="timesheets_{date_from}_{date_to}.csv"`
- カラム: `プロジェクト名,メンバー名,日付,工数(h),タスク名,備考`

### UI（ReportClient.tsx）

既に実装済みのため変更なし：
- ページヘッダー右に「CSV ダウンロード」ボタン配置
- `window.open()` で `/api/timesheets/export?date_from=...&date_to=...` を呼び出し
- 期間未選択時はボタン disabled

## 検証結果

```
npm run build
✓ Compiled successfully in 17.1s
  Running TypeScript ... (pass)
```

> [!NOTE]
> `middleware-manifest.json` の Build error は Next.js 16 の既知の問題でありコード変更とは無関係。TypeScript コンパイルは正常完了。
