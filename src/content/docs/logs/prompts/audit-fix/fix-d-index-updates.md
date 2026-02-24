---
title: "FIX-D: 画面一覧・仕様一覧の更新"
description: "採番不整合の整理、仕様一覧の新規ファイル追加"
---

あなたは OpsHub の設計ドキュメント担当です。監査で検出された採番不整合と仕様一覧の更新漏れを修正してください。

## 修正1: 画面一覧の更新

**対象ファイル**: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/requirements/screens/index.md

**修正内容**:

### SCR-A03 の用途更新
- 現在: 「ロール管理」(`/settings/users/[id]/roles`)
- 修正: 「監査ログビューア」(`/admin/audit-logs`)
- 注記追加: 「ロール管理機能は SCR-A02（ユーザー管理）に統合」

### SCR-D02 の統合注記
- 現在: 「経費申請」(`/expenses/new`)
- 修正: 「→ SCR-D01 に統合（経費申請フォームは SCR-D01 の画面②として記述）」

### SCR-E01 の注記
- 現在: 「請求一覧」
- 修正: 「請求一覧（将来フェーズ）」
- 注記追加: 「※ 通知機能は SCR-E01 仕様書として作成済みだが、採番が衝突している。将来的に請求機能を実装する際に再整理が必要」

### SCR-G01 の注記
- 現在: 「通知一覧」
- 修正: 「通知一覧 → spec/screens/SCR-E01.md として実装済み（ヘッダー組込 NotificationBell）」

### 監査ログビューアの追加
- 「未決事項」セクションに記載されている「監査ログ閲覧画面の追加」を本表に移動し、SCR-A03 として正式登録

## 修正2: 画面仕様一覧（spec/screens/index.md）の更新

**対象ファイル**: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/screens/index.md

**修正内容**: 以下のファイルを一覧に追加:
- SCR-A03 監査ログビューア（`/admin/audit-logs`）
- SCR-D01 経費管理（`/expenses`, `/expenses/new`）
- SCR-E01 通知システム（ヘッダー組込 NotificationBell）

## 修正3: API仕様一覧（spec/apis/index.md）の更新

**対象ファイル**: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/apis/index.md

**修正内容**: 以下のファイルを一覧に追加:
- API-D01 経費管理（Server Actions）
- API-E01 通知API（Server Actions + ヘルパー）

## 修正4: ADR 一覧の更新

**対象ファイル**: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/adr/index.md

**修正内容**: 以下を一覧に追加:
- ADR-0004: profiles テーブル導入
- ADR-0005: Supabase CLI vs Docker Compose

## 参照

- 監査01レポート: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/audit-01-traceability.md
- 監査05レポート: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/audit-05-coverage-gaps.md

## 検証

修正後、以下を実行:
```
cd /home/garchomp-game/workspace/starlight-test/opsHub-doc && npm run build
```
ビルドが通ること。

## 出力

成果物を以下のファイルに保存:
/home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/fix-d-index-updates.md

frontmatter を含めること:
---
title: "FIX-D: 画面一覧・仕様一覧の更新"
---
