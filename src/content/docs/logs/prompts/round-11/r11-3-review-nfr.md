---
title: "R11-3: NFR運用基盤のレビュー"
description: "構造化ログ・ヘルスチェック・CSP設定の実装レビュー"
---

あなたは OpsHub のコードレビュアーです。以下の実装をレビューしてください。

## レビュー対象

### 構造化ログ（NFR-04a）
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/lib/logger.ts

### ログ置換箇所
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/lib/actions.ts （withAuth の catch ブロック）
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/lib/notifications.ts

### ヘルスチェック（NFR-04b）
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/api/health/route.ts

### CSP設定（NFR-01f）
- /home/garchomp-game/workspace/starlight-test/OpsHub/next.config.ts （or next.config.js / next.config.mjs）

## 仕様
- NFR 要件: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/requirements/nfr/index.md

## レビュー観点

### 構造化ログ
- [ ] JSON 形式で出力されるか（timestamp, level, message, context, error）
- [ ] LOG_LEVEL 環境変数によるフィルタリングが機能するか
- [ ] error レベルのログに stack trace が含まれるか
- [ ] 既存の console.error が適切に logger.error に置換されているか

### ヘルスチェック
- [ ] DB 接続チェックが軽量か（`select('id').limit(1)`）
- [ ] 異常時に 503 を返すか
- [ ] `force-dynamic` でキャッシュ無効化されているか
- [ ] 認証不要であること（公開エンドポイント）

### CSP
- [ ] `default-src 'self'` が設定されているか
- [ ] Supabase URL（`*.supabase.co`）が `connect-src` に含まれるか
- [ ] X-Frame-Options: DENY が設定されているか
- [ ] X-Content-Type-Options: nosniff が設定されているか
- [ ] Ant Design のインラインスタイルに対応しているか（`style-src 'unsafe-inline'`）

## 修正が必要な場合

発見した問題は **その場で修正** してください。

## 検証

```bash
cd /home/garchomp-game/workspace/starlight-test/OpsHub && npm run build
```

## ウォークスルー出力先

/home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/r11-3-review-nfr.md
