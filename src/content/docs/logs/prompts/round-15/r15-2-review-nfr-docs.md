---
title: "R15-2: NFR運用ドキュメントのレビュー"
description: "運用手順書の内容正確性・網羅性のレビュー"
---

あなたは OpsHub のコードレビュアーです。以下のドキュメントをレビューしてください。

## レビュー対象

### 運用手順書
- /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/detail/operations/index.md

### ADR一覧
- /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/adr/index.md

## 参照
- NFR 要件: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/requirements/nfr/index.md
- 監査05: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/audit-05-coverage-gaps.md
- R9-4 ウォークスルー: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/r9-4-nfr-infra.md
- ヘルスチェック実装: /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/api/health/route.ts
- ロガー実装: /home/garchomp-game/workspace/starlight-test/OpsHub/src/lib/logger.ts

## レビュー観点

### バックアップ手順（NFR-03b）
- [ ] Supabase 自動バックアップの説明が正確か
- [ ] `supabase db dump` コマンドの使用方法が正しいか
- [ ] Storage バックアップについて言及されているか

### DR手順（NFR-03c）
- [ ] RPO/RTO の値が NFR 要件と整合しているか
- [ ] 復旧手順の順序が論理的か
- [ ] `/api/health` による確認手順が含まれているか

### デプロイ手順（NFR-04d）
- [ ] Vercel デプロイ手順が正確か
- [ ] ロールバック手順が明確か
- [ ] マイグレーション先行適用について言及されているか

### 構造化ログ運用（NFR-04a）
- [ ] `lib/logger.ts` の実装と一致しているか
- [ ] LOG_LEVEL 環境変数の説明が正確か
- [ ] Vercel Logs での実用的なフィルタ例があるか

### 負荷テスト計画（NFR-02c）
- [ ] テストシナリオが現実的か
- [ ] 合格基準が NFR 要件と整合しているか
- [ ] Supabase 接続プーリングについて言及されているか

### 監視設定（NFR-04b）
- [ ] `/api/health` エンドポイントの説明が実装と一致しているか
- [ ] 監視間隔・アラート先の推奨が妥当か

### ADR一覧
- [ ] ADR-0006 が一覧に含まれているか
- [ ] 他の ADR との整合性

## 修正が必要な場合

発見した問題は **その場で修正** してください。

## 検証

```bash
cd /home/garchomp-game/workspace/starlight-test/opsHub-doc && npm run build
```

## ウォークスルー出力先

/home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/r15-2-review-nfr-docs.md
