---
title: "R21-1: Playwright基盤セットアップ完了ログ"
description: "E2Eテストフレームワーク（Playwright）のインストールと認証状態の保存機構の構築記録"
---

# Playwright基盤セットアップ完了ログ

E2Eテスト基盤構築タスク（R21-1）が完了しました。今後の新機能開発において主要フローのデグレを防ぐための自動テスト基盤が整いました。

## 実施内容

### 1. Playwright インストールと基本設定
- 依存関係 `@playwright/test` とブラウザ（Chromium / FFmpeg / Webkit-ish tools）をインストール
- テスト実行用スクリプトの追加 (`npm run test:e2e`, `npm run test:e2e:ui`)
- `playwright.config.ts` の作成と Next.js 向けの設定
  - デフォルトブラウザ: Chromium
  - BaseURL: `http://localhost:3000`
  - サーバー自動起動: テスト実行時に `npm run dev` を通して Next.js を自動起動するように設定

### 2. 認証の共通化（Global Setup）
- **`tests/e2e/auth.setup.ts` の作成**: PlaywrightのStorage State機能を活用し、主要6ロールの認証情報をテスト前に自動生成するSetupプロジェクト (`setup`) を定義しました。
  - Tenant Admin (`admin@test-corp.example.com`)
  - IT Admin (`itadmin@test-corp.example.com` - Seedデータに合わせて修正)
  - PM (`pm@test-corp.example.com`)
  - Accounting (`accounting@test-corp.example.com`)
  - Approver (`approver@test-corp.example.com`)
  - Member (`member@test-corp.example.com`)
- 生成された認証状態は `/playwright/.auth/` 以下にJSONとして保存され、各テストがログインプロセスをスキップできるようにしました。

### 3. テストの作成と実行
- **`tests/e2e/sanity.spec.ts` の作成**: 
  1. `admin` ユーザーの Storage State を流用し、ダッシュボードメイン画面への正常なアクセスを確認するテスト。
  2. 認証なしセッションで `/` にアクセスした場合、セキュアに `/login` ページにリダイレクトされることを確認するテスト。
- 全テスト（Setupフェーズ6件 + Sanityフェーズ2件）の正常終了（PASSED）を確認しました。

## テスト実行手順

今後E2Eテストを実行する場合は以下のコマンドを使用してください（事前に `npx supabase start` によるローカルDB起動が必要です）：

```bash
# ヘッドレスモードでの実行
npm run test:e2e

# UIモードでの実行（デバッグ用）
npm run test:e2e:ui
```

## 今後の推奨事項

- `auth.setup.ts` によるログイン共通化により、ロール単位でのダッシュボード表示テストや結合テストが容易になりました。今後のMustフロー（WF申請や打刻など）を追加する際は、`test.use({ storageState: '...' })` でロール状態を適宜切り替えて活用してください。
