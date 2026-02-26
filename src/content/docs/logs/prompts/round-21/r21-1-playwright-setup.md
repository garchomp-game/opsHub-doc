---
title: "R21-1: Playwright基盤セットアップ"
description: "E2Eテストフレームワーク（Playwright）のインストールと認証基盤の設定"
---

あなたは OpsHub の QA エンジニア（自動化基盤担当）です。
今後の機能改修によるデグレを防ぐため、PlaywrightによるE2Eテスト基盤を構築してください。

## 参照ドキュメント

- テスト方針: `/home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/detail/testing/index.md`

## 要件

### 1. Playwright のインストール

OpsHub プロジェクト直下（`/home/garchomp-game/workspace/starlight-test/OpsHub`）にて、`@playwright/test` をインストールしてください。
（必要であれば `@playwright/test init` を使用し、ブラウザをダウンロードしてください）

### 2. `playwright.config.ts` の設定

- **テストディレクトリ**: `tests/e2e/`
- **対象URL**: `http://localhost:3000` (`baseURL`)
- **ブラウザ**: Chromium をデフォルト（必要に応じて拡張可）
- **リトライ**: CI環境では2回、ローカルでは0回
- **トレース/スクリーンショット**: テスト失敗時に保持

### 3. npm scripts の追加

`package.json` に E2E 実行用のスクリプトを追加してください。
```json
"test:e2e": "playwright test",
"test:e2e:ui": "playwright test --ui"
```

### 4. 認証の共通化（Global Setup or Fixtures）

毎回ゼロからログインフォームを入力するのは遅いため、Playwrightの「認証状態の保存（Storage State）」パターン、または `auth.setup.ts` などのGlobal Setupを構築し、複数ロールでのテストを効率化する仕組みを検討・実装してください。
ローカルのシードデータにはすでに以下のユーザーが含まれています（パスワードは全て `password123`）：
- `admin@test-corp.example.com` (Tenant Admin)
- `it_admin@system.example.com` (IT Admin)
- `pm@test-corp.example.com` (PM)
- `accounting@test-corp.example.com` (Accounting)
- `approver@test-corp.example.com` (Approver)
- `member@test-corp.example.com` (Member)

### 5. 動作確認用サニティテスト

`tests/e2e/sanity.spec.ts` を作成し、トップページ（`/login`）へアクセスしてタイトルが正常に表示されるかを確認するだけの簡単なテストを記述して実行してください。

## 検証手順

1. `npm run test:e2e tests/e2e/sanity.spec.ts` を実行し、Passedになること。

## ウォークスルー出力先

/home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/r21-1-playwright-setup.md
