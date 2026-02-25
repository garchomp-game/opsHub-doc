---
title: "R20-2: Next.js 16 middleware 非推奨対応調査"
description: "middleware.ts の deprecation warning を調査し、proxy への移行可否を判断する"
---

あなたは OpsHub のインフラ担当です。
Next.js 16 の `middleware.ts` 非推奨警告を調査し、`proxy` への移行可否を判断してください。

## 現状

- Next.js 16.1.6 起動時に以下の警告が出る:
  ```
  ⚠ The "middleware" file convention is deprecated. Please use "proxy" instead.
  ```
- 現在の `src/middleware.ts` は Supabase セッションリフレッシュ（`updateSession`）を行っている
- `src/lib/supabase/middleware.ts` が `createServerClient` でセッション更新ロジックを提供

## 調査項目

### 1. Next.js 16 `proxy` の仕様調査

- Next.js 公式ドキュメントで `proxy` コンベンションの仕様を確認
- `proxy` で Supabase セッションリフレッシュ（Cookie 読み書き + `auth.getUser()`）が可能か判定
- `@supabase/ssr` の `createServerClient` との互換性を確認

### 2. `proxy` の制約調査

- `proxy` は `middleware` と同じ機能を持つか（リクエスト/レスポンスの変更、リダイレクト、Cookie操作）
- Edge Runtime の制約に変更はあるか
- 他の Next.js + Supabase プロジェクトでの対応事例を調査

### 3. 判断

以下のいずれかを推奨:
- **A. `proxy` に移行**: 移行手順と変更箇所を記載
- **B. `middleware` を維持**: Next.js 17 まで警告を無視する根拠を記載
- **C. 段階的移行**: 当面は `middleware` を使いつつ、`proxy` 対応の準備を進める

## 参照ファイル

- `/home/garchomp-game/workspace/starlight-test/OpsHub/src/middleware.ts`
- `/home/garchomp-game/workspace/starlight-test/OpsHub/src/lib/supabase/middleware.ts`

## 出力

調査結果と推奨対応を記載。移行する場合は具体的な修正コードも含む。

## ウォークスルー出力先

/home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/r20-2-middleware-investigation.md
