---
title: "R14-3: NFRドキュメント作成（DR手順書・バックアップ・性能計画）"
---

# R14-3: NFR運用ドキュメントの作成

> **実施日**: 2026-02-25
> **対象 NFR**: NFR-02c, NFR-03b, NFR-03c, NFR-04a, NFR-04b, NFR-04d

---

## 変更サマリ

| ファイル | 変更 | 内容 |
|---|---|---|
| `detail/operations/index.md` | NEW | 運用手順書（6セクション） |
| `adr/index.md` | MODIFY | ADR-0006 を一覧に追加 |
| `astro.config.mjs` | MODIFY | サイドバーに運用手順書 + ADR-0006 を追加 |

---

## 運用手順書の構成

| セクション | 対応 NFR | 内容 |
|---|---|---|
| 1. バックアップ手順 | NFR-03b | Supabase 日次自動 + `supabase db dump` 手動、保持7日 |
| 2. DR（災害復旧）手順 | NFR-03c | RPO 24h / RTO 4h、復旧5ステップ、エスカレーションフロー（Mermaid） |
| 3. デプロイ手順 | NFR-04d | Vercel Immutable Deployments、ロールバック手順 |
| 4. 構造化ログ運用 | NFR-04a | `lib/logger.ts` 実装済の運用方法、Vercel Logs フィルタ、アラート設定案 |
| 5. 負荷テスト計画 | NFR-02c | k6/Artillery、3シナリオ、合格基準 TTFB 200ms / エラー率 0.1% |
| 6. 監視設定 | NFR-04b | `/api/health` 外部監視（UptimeRobot）、5分間隔 |

---

## NFR リスク改善

| NFR | Before | After |
|---|---|---|
| NFR-02c（同時接続） | 🔴 高（負荷テスト未計画） | 🟡 中（計画文書化済、実施待ち） |
| NFR-03b（バックアップ） | 🟡 中（手順未文書化） | 🟢 低（手順文書化済） |
| NFR-03c（リカバリ） | 🔴 高（DR手順未文書化） | 🟡 中（手順文書化済、訓練未実施） |
| NFR-04a（構造化ログ） | ✅ 実装済（ドキュメントなし） | 🟢 低（運用手順文書化済） |
| NFR-04b（監視） | ✅ 実装済（設定ガイドなし） | 🟢 低（監視設定手順文書化済） |
| NFR-04d（デプロイ） | 🟡 中（手順未文書化） | 🟢 低（手順文書化済） |

---

## ADR 一覧更新

- ADR-0006（検索方式の選定）を `adr/index.md` の一覧に追加
- サイドバーにも `ADR-0006 検索方式` を追加

---

## 検証結果

```
npm run build → Exit code: 0
165 page(s) built in 36.40s

新規追加ページ:
├ /detail/operations/index.html  ← 運用手順書
├ /adr/adr-0006/index.html      ← ADR-0006（既存ファイルのサイドバー追加）
```
