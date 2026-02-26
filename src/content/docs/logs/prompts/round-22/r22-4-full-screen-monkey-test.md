---
title: "R22-4: 全画面モンキー打鍵テスト"
description: "全22ルートをブラウザで開き、主要操作を行い、コンソール0エラーを確認"
---

あなたは OpsHub の QA エンジニアです。
全22画面をブラウザで開き、モンキー打鍵テストを行ってください。
目標は「全画面のブラウザコンソールに error/warning が 0 件」です。

> **前提**: R22-1（Ant Design修正）、R22-2（useForm修正）、R22-3（スキーマ監査）が完了していること。

## プロジェクトパス

- OpsHub: `/home/garchomp-game/workspace/starlight-test/OpsHub`

## テスト対象の全22ルート

ログイン情報: `admin@test-corp.example.com` / `password123`

### メイン画面

| # | パス | 画面名 | 打鍵内容 |
|---|---|---|---|
| 1 | `/` | ダッシュボード | KPIカード表示、通知ベル押下、クイックアクション |
| 2 | `/workflows` | ワークフロー一覧 | フィルタ変更、ソート、行クリック |
| 3 | `/workflows/pending` | 承認待ち一覧 | 一覧表示確認 |
| 4 | `/workflows/new` | 新規ワークフロー | 各フォーム入力、バリデーション確認（送信はしない） |
| 5 | `/workflows/[id]` | ワークフロー詳細 | 既存WFの詳細表示 |
| 6 | `/projects` | プロジェクト一覧 | 一覧表示、ステータスフィルタ |
| 7 | `/projects/new` | 新規プロジェクト | フォーム入力、バリデーション |
| 8 | `/projects/[id]` | プロジェクト詳細 | タブ切替（概要・メンバー・工数） |
| 9 | `/projects/[id]/tasks` | タスク管理 | カンバン表示、タスク作成モーダル（空のまま閉じる） |
| 10 | `/projects/[id]/documents` | ドキュメント | 一覧表示 |
| 11 | `/timesheets` | 工数入力 | 週切替、プロジェクト選択 |
| 12 | `/timesheets/reports` | 工数レポート | 期間変更、集計表示 |
| 13 | `/expenses` | 経費一覧 | フィルタ変更 |
| 14 | `/expenses/summary` | 経費集計 | 集計表示確認 |
| 15 | `/expenses/new` | 新規経費 | フォーム入力（送信しない） |
| 16 | `/invoices` | 請求一覧 | フィルタ、新規作成リンク確認 |
| 17 | `/invoices/new` | 新規請求書 | フォーム入力、明細追加・削除 |
| 18 | `/invoices/[id]` | 請求書詳細 | 詳細表示、税率変更 |
| 19 | `/search?q=test` | 全文検索 | 検索実行、カテゴリ切替 |
| 20 | `/admin/users` | ユーザー管理 | 一覧表示、招待モーダル開閉、ユーザー詳細パネル |
| 21 | `/admin/tenant` | テナント管理 | タブ切替（基本情報・設定・利用状況） |
| 22 | `/admin/audit-logs` | 監査ログ | 一覧表示、フィルタ |

## テスト手順

各画面で:

1. **ブラウザで画面を開く**（`browser_subagent` ツール使用）
2. **主要操作を実行**（上記「打鍵内容」参照）
3. **ブラウザのコンソール出力を確認**
4. **error または warning が出た場合**:
   - エラー内容とファイル名を記録
   - 可能であればその場で修正
   - 修正不可能な場合は Issue として記録

## 検証基準

- 全22画面でコンソール error が 0 件
- warning は Ant Design 関連（`[antd:` で始まるもの）が 0 件
  - ブラウザ DevTools / Next.js devtools 由来の一般的な warning は許容
- 全画面が正常にレンダリングされること（白画面やエラーバウンダリが出ないこと）

## 最終検証

全画面の確認が完了したら:

1. `npm run lint` — 0 errors, 0 warnings
2. `npm run build` — 成功
3. `npm run test:e2e` — 全テスト PASSED

## ウォークスルー出力先

/home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/r22-4-monkey-test.md
