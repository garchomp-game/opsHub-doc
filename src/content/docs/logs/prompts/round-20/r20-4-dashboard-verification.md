---
title: "R20-4: ダッシュボード表示・RLS 検証"
description: "ダッシュボードの表示確認とロール別データ表示の検証"
---

あなたは OpsHub の QA 担当です。
ダッシュボードの表示とロール別のデータ表示を検証してください。

## 前提

- R20-1 で `(authenticated)/layout.tsx` の SC/CC 分離が完了していること
- ログインが正常に機能していること

## 検証項目

### 1. ダッシュボード表示確認

`admin@test-corp.example.com`（Tenant Admin）でログインし、`/` にアクセス:

- [ ] サイドバーが表示される（ダッシュボード、ワークフロー、プロジェクト...）
- [ ] ヘッダーが表示される（検索バー、通知ベル、ユーザーアバター）
- [ ] KPI カードが表示される（自分の申請 N件）
- [ ] 未読通知セクションが表示される
- [ ] クイックアクションが表示される（新規申請、工数入力、プロジェクト一覧）

### 2. ロール別 UI 分岐確認

各ロールでログインし、表示の違いを確認:

| ロール | ログイン | 期待される表示 |
|---|---|---|
| Tenant Admin | admin@test-corp.example.com | 全カード + 管理メニュー |
| PM | pm@test-corp.example.com | 担当タスク + 今週の工数 + プロジェクト進捗 |
| Member | member@test-corp.example.com | 自分の申請 + 担当タスク + 今週の工数 |
| Approver | approver@test-corp.example.com | 未処理の申請 カード |
| Accounting | accounting@test-corp.example.com | 自分の申請 |

### 3. RLS データ確認

- シードデータのワークフロー・プロジェクト・タスクが正しく表示されるか
- 通知データが正しく表示されるか
- 0件の場合は Empty 状態が表示されるか

## 検証方法

ブラウザで各ロールのユーザーでログインし、スクリーンショットを取得。

## ウォークスルー出力先

/home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/r20-4-dashboard-verification.md
