---
title: "R21-2: ロール別ダッシュボードE2Eテスト"
description: "シードデータを用いた全6ロールのダッシュボード表示検証のPlaywright実装"
---

あなたは OpsHub の QA エンジニア（自動テスト担当）です。
手動検証で限界が見えたダッシュボードのロール別UI表示と、RLSに紐づくデータ表示パターンの検証をPlaywrightを使って自動化してください。

## 前提

- R21-1 の Playwright 基盤セットアップが完了していること。
- `playwright.config.ts` で `baseURL` が設定されていること。

## 検証要件（テストシナリオ）

テストファイル位置: `tests/e2e/dashboard-roles.spec.ts`

各ロール（6種類）でログインし、ダッシュボード（`/`）にアクセスした際に、それぞれのロールに応じたUI（KPIカード、サイドバーメニュー、未読通知など）が正しく表示されているかを確認する強力なテストを作成してください。

### 対象ロールと期待値（`password123`）

1. **Tenant Admin** (`admin@test-corp.example.com`)
   - サイドバーに「管理」メニューが含まれること。
   - 独自のKPIカードが表示または除外されていることの確認。
2. **PM** (`pm@test-corp.example.com`)
   - スペシャルKPI「プロジェクト進捗」カードが表示されていること。
   - 「担当タスク」「今週の工数」が表示されていること。
   - 「管理」メニューが存在**しない**こと。
3. **Member** (`member@test-corp.example.com`)
   - 「自分の申請」「担当タスク」「今週の工数」が表示されていること。
   - 「プロジェクト進捗」カードが**存在しない**こと。
4. **Approver** (`approver@test-corp.example.com`)
   - 「未処理の申請」KPIカードが表示されていること（シードデータで1件あるはず）。
5. **Accounting** (`accounting@test-corp.example.com`)
   - その他の無関係なカード（プロジェクト進捗や自分の申請以外のタスク関連など）が適切に隠れており、「自分の申請」等のみが見えること。
6. **IT Admin** (`it_admin@system.example.com`)
   - テナント固有のデータではなく、システム全体に関わるメニューが見える、またはTenant Adminと類似の管理メニューが存在すること。

### 実装上の注意点

- **テストの並列性**: 同じユーザーで同時に操作すると状態が変わる可能性があるため、ユーザー単位での分離（Playwright の `test.use` や別コンテキスト発行等）を適切に設計すること。
- Playwrightの `expect` を活用し、表示されるべき要素（`.toBeVisible()`）と表示されてはならない要素（`.not.toBeVisible()` または要素数0）を明確にアサートすること。

## 検証手順

1. `npm run test:e2e tests/e2e/dashboard-roles.spec.ts` を実行し、すべてのテストがパスすることを確認。

## ウォークスルー出力先

/home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/r21-2-dashboard-e2e.md
