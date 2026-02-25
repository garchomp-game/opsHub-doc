---
title: "R15-2: NFR運用ドキュメントのレビュー"
---

# R15-2: NFR運用ドキュメントのレビュー

> **実施日**: 2026-02-25
> **対象**: 運用手順書 (`detail/operations/index.md`)、ADR一覧 (`adr/index.md`)

---

## レビュー結果サマリ

| 観点 | 結果 | 備考 |
|---|---|---|
| バックアップ手順（NFR-03b） | ✅ OK | 自動/手動/Storage 全て正確 |
| DR手順（NFR-03c） | ✅ OK（修正あり） | RPO/RTO 整合、復旧順序論理的、ヘルスチェック含む |
| デプロイ手順（NFR-04d） | ✅ OK | Vercel デプロイ/ロールバック/マイグレーション戦略完備 |
| 構造化ログ運用（NFR-04a） | ✅ OK（改善あり） | logger.ts と一致、LOG_LEVEL 正確、フィルタ例追加 |
| 負荷テスト計画（NFR-02c） | ✅ OK | シナリオ現実的、基準 NFR 整合、接続プーリング言及あり |
| 監視設定（NFR-04b） | ✅ OK（修正あり） | レスポンス形式を実装と一致させた |
| ADR一覧 | ✅ OK（修正あり） | ADR-0006 含む、リンクパス修正 |

---

## 検出した問題と修正内容

### 問題1: ヘルスチェックレスポンス形式の不一致（重大度: 🟡 中）

**箇所**: `detail/operations/index.md` — 監視設定セクション + DR手順セクション

**問題**: 正常レスポンスに `version` と `timestamp` フィールドが記載されておらず、異常レスポンスにも `timestamp` が未記載。実際の `route.ts` 実装では以下を返す:

```json
// 正常時 (200)
{ "status": "healthy", "timestamp": "...", "version": "...", "database": "healthy" }

// 異常時 (503)
{ "status": "unhealthy", "timestamp": "..." }
```

**修正**: 監視設定テーブルと DR 手順のヘルスチェック期待値を実装に合わせて更新。

### 問題2: Vercel Logs フィルタ例の不足（重大度: 🟢 低）

**箇所**: `detail/operations/index.md` — 構造化ログ運用セクション

**問題**: フィルタ方法の説明が概念的で、実用的なフィルタクエリ例がなかった。

**修正**: 「実用的なフィルタ例」セクションを追加:
- Vercel CLI での `jq` を使ったフィルタコマンド例
- ダッシュボードでの検索クエリ例テーブル

### 問題3: ADR-0006 リンクパスの大文字/小文字不統一（重大度: 🟢 低）

**箇所**: `adr/index.md` — ADR一覧

**問題**: ADR-0001〜0005 は `./adr-000X/` （小文字）だが、ADR-0006 のみ `./ADR-0006/`（大文字）。

**修正**: `./adr-0006/` に統一。

---

## 問題なし（良好な点）

### バックアップ手順（NFR-03b）
- Supabase Pro Plan 日次自動バックアップの説明が正確
- `supabase db dump` コマンドが正しい（`-f`, `--schema-only`, `--data-only` の各パターン）
- Storage バックアップ（`supabase storage ls` / `supabase storage cp`）について適切に言及

### DR手順（NFR-03c）
- **RPO 24時間 / RTO 4時間** → NFR-03c と整合
- 復旧手順が 5 Step の論理的な順序: 状況把握 → プロジェクト復元 → マイグレーション → データリストア → 再デプロイ
- エスカレーションフロー（Mermaid 図）が明確
- 復旧確認チェックリストに `/api/health` 確認を含む

### デプロイ手順（NFR-04d）
- Vercel の Immutable Deployments による ZDT デプロイの説明が正確
- ロールバック手順が「Promote to Production」で明確
- マイグレーション先行適用パターンテーブル（カラム追加/削除/テーブル追加/破壊的変更）が実用的
- DB マイグレーションのロールバック注意事項を含む

### 構造化ログ運用（NFR-04a）
- ログ形式（JSON）が `logger.ts` の `LogEntry` 型と一致
- ログレベル（error/warn → `console.error`、info/debug → `console.log`）が実装と一致
- `LOG_LEVEL` 環境変数の説明が正確（デフォルト `info`）

### 負荷テスト計画（NFR-02c）
- TTFB 200ms / API 500ms の合格基準が NFR-02a / NFR-02b と整合
- Supabase 接続プーリング設定（pgBouncer, Transaction mode, ポート 6543）が実用的
- k6 / Artillery の選定が妥当

### 監視設定（NFR-04b）
- 監視間隔 5分 / タイムアウト 30秒 / 2回連続失敗でアラートが妥当
- UptimeRobot 無料プランの提案が現実的

---

## 補足: NFR-04d 要件との不整合

NFR 要件 (`requirements/nfr/index.md`) では NFR-04d の基準が **「ゼロダウンタイムデプロイ（Docker rollout）」** と記載されているが、実際のインフラは **Vercel** を使用している。運用手順書側は正しく Vercel のデプロイ方式を記述しているため、**NFR 要件本文の方を修正すべき**（今回のスコープ外）。

---

## 検証結果

```
npm run build → Exit code: 0
170 page(s) built in 17.60s
```

---

## 変更ファイル一覧

| ファイル | 変更内容 |
|---|---|
| `detail/operations/index.md` | ヘルスチェックレスポンス形式修正、Vercel Logs フィルタ例追加、DR ヘルスチェック期待値修正 |
| `adr/index.md` | ADR-0006 リンクパスの小文字統一 |
