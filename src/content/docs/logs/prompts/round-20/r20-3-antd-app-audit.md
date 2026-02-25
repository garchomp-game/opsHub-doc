---
title: "R20-3: Ant Design v6 App.useApp() 監査"
description: "Ant Design v6 の App.useApp() パターンがアプリ全体で正しく適用されているか監査する"
---

あなたは OpsHub のフロントエンド監査担当です。
Ant Design v6 の `App.useApp()` パターンがアプリ全体で正しく適用されているか監査してください。

## 背景

- Ant Design v6 では `message`, `notification`, `modal` の API を使うには `App.useApp()` フック経由でアクセスする必要がある
- ルート `layout.tsx` に `<App>` ラッパーが設置されているか、または各コンポーネントで個別に `<App>` を使っているかを確認する必要がある
- 前回のセッションで `login/page.tsx` に `<App>` を追加して `message.error is not a function` を修正した経緯あり

## 監査項目

### 1. グローバル `<App>` ラッパーの有無確認

- `src/app/layout.tsx` に `<App>` コンポーネントが含まれているか確認
- 含まれていない場合、各 Client Component で個別に `<App>` を使っている箇所を特定

### 2. `App.useApp()` 使用箇所の列挙

以下のパターンを `grep` で全ファイル検索:
- `App.useApp()`
- `useApp()`
- `message.` (message.success, message.error, etc.)
- `notification.` (notification.open, etc.)
- `modal.` (modal.confirm, etc.)

### 3. 不整合の修正

- `<App>` ラッパーなしで `useApp()` を使っている箇所を特定
- 修正方針を策定（グローバル `<App>` 追加 or 個別対応）

## 参照ファイル

- `/home/garchomp-game/workspace/starlight-test/OpsHub/src/app/layout.tsx`
- `/home/garchomp-game/workspace/starlight-test/OpsHub/src/app/login/page.tsx`
- 全体の `_components/` ディレクトリ内の Client Component

## 検証

- `npm run build` が成功する
- ログイン画面でエラーログインを試みて `message.error` トーストが表示される

## ウォークスルー出力先

/home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/r20-3-antd-app-audit.md
