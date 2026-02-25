---
title: "R9-3: 工数CSVエクスポート実装"
description: "API-C03-2 の CSV エクスポート Route Handler を実装"
---

あなたは OpsHub の開発者です。工数集計のCSVエクスポート機能を実装してください。

## 参照する仕様書

- API-C03-2: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/apis/API-C03-2.md

## 参照する既存実装

- 工数集計: /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/timesheets/reports/
- Route Handler ディレクトリ（既存）: /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/api/timesheets/export/

## 作成/修正するファイル

### Route Handler
- `/home/garchomp-game/workspace/starlight-test/OpsHub/src/app/api/timesheets/export/route.ts`

### 実装内容

1. `GET /api/timesheets/export` Route Handler
2. Query Parameters:
   - `date_from` (ISO8601, 必須)
   - `date_to` (ISO8601, 必須)
   - `project_id` (UUID, オプション)
   - `unit` (`month` | `week` | `day`, デフォルト: `day`)
3. 認証: `requireAuth()` でユーザー取得
4. 権限: PM / Tenant Admin のみエクスポート可能
5. CSV 生成:
   - BOM 付き UTF-8（Excel 対応）
   - ヘッダー行: 日付, プロジェクト, タスク, メンバー, 時間(h)
   - Content-Type: `text/csv; charset=utf-8`
   - Content-Disposition: `attachment; filename="timesheets_{date_from}_{date_to}.csv"`
6. データ取得: Supabase クエリで timesheets + projects + tasks + profiles を JOIN
7. エラー時: 適切な HTTP ステータスコード（401, 403, 400, 500）

### UI 側の修正

- `/home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/timesheets/reports/_components/ReportClient.tsx`
  - 「CSVダウンロード」ボタンを追加
  - クリック時に `/api/timesheets/export?date_from=...&date_to=...` を `window.open()` or `fetch` + `blob` でダウンロード

## 検証

```bash
cd /home/garchomp-game/workspace/starlight-test/OpsHub && npm run build
```

## ウォークスルー出力先

/home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/r9-3-csv-export.md
