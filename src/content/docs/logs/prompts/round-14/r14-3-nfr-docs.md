---
title: "R14-3: NFRドキュメント作成（DR手順書・バックアップ・性能計画）"
description: "NFR高リスク項目の運用ドキュメント作成"
---

あなたは OpsHub の設計ドキュメント担当です。
監査で指摘された NFR 高リスク項目に対する運用ドキュメントを作成してください。

## 背景

監査05で以下が🔴高リスクと判定されています:
- NFR-02c: 同時接続（負荷テスト未実施）
- NFR-03c: リカバリ（DR手順未文書化）
- NFR-04a: 構造化ログ（✅ 実装済、ドキュメントのみ）

また以下が🟡中リスク:
- NFR-03b: バックアップ
- NFR-04d: ゼロダウンタイムデプロイ

## 参照

- NFR 要件: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/requirements/nfr/index.md
- 監査05: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/audit-05-coverage-gaps.md
- R9-4 ウォークスルー: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/r9-4-nfr-infra.md
- 既存設計書: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/detail/setup/index.md

## 作成するファイル

### 1. 運用手順書
- `/home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/detail/operations/index.md`

以下のセクションを含む:

#### バックアップ手順（NFR-03b）
- Supabase の日次バックアップ（自動）
- 手動バックアップ: `supabase db dump` コマンド
- 保持期間: 7日分
- バックアップ対象: データベース + Storage

#### DR（災害復旧）手順（NFR-03c）
- RPO: 24時間、RTO: 4時間
- 復旧手順:
  1. Supabase プロジェクトの復元
  2. `supabase db push` でマイグレーション再適用
  3. バックアップデータのリストア
  4. アプリケーションの再デプロイ
  5. `/api/health` でヘルスチェック
- エスカレーションフロー

#### デプロイ手順（NFR-04d）
- Vercel での 自動デプロイ（main ブランチ push）
- ゼロダウンタイム: Vercel の Immutable Deployments
- ロールバック: Vercel ダッシュボードから前バージョンに即切替
- マイグレーション: デプロイ前に `supabase db push` で適用

#### 構造化ログ運用（NFR-04a）
- ログ形式: JSON（`lib/logger.ts` で実装済）
- ログレベル: `LOG_LEVEL` 環境変数で制御
- Vercel Logs でのフィルタ方法
- アラート設定案

#### 負荷テスト計画（NFR-02c）
- 対象: 同時100ユーザー
- ツール: k6 or Artillery
- テストシナリオ:
  1. ログイン → ダッシュボード表示
  2. 申請作成 → 承認
  3. 工数入力 → 集計表示
- 合格基準: TTFB 200ms以下、エラー率 0.1%以下
- Supabase 接続プーリング設定確認

#### 監視設定（NFR-04b）
- `/api/health` の外部監視（UptimeRobot 等）
- ヘルスチェック間隔: 5分
- アラート通知先: Slack / メール

### 2. ADR 一覧更新
- `/home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/adr/index.md`
  - ADR-0006 を一覧に追加（もし未追加なら）

## 検証

```
cd /home/garchomp-game/workspace/starlight-test/opsHub-doc && npm run build
```

## ウォークスルー出力先

/home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/r14-3-nfr-docs.md
