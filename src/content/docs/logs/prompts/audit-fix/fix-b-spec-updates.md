---
title: "FIX-B: 仕様書更新（古い記載の修正）"
description: "SCR-B01, SCR-C03-1, SCR-002 の実装との乖離を修正"
---

あなたは OpsHub の設計ドキュメント担当です。監査で検出された仕様書の古い記載を実装に合わせて更新してください。

## 修正1: SCR-B01 タブ構成→別ページ構成

**対象ファイル**: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/screens/SCR-B01.md

**問題**: 仕様では「自分の申請」と「承認待ち」をタブで切替する設計だが、実装では `/workflows`（自分の申請）と `/workflows/pending`（承認待ち）で別ページに分離されている。

**修正内容**: タブ構成の記述を削除し、以下の実装に合わせた記載に変更:
- `/workflows`: 自分の申請一覧ページ
- `/workflows/pending`: 承認待ち一覧ページ（サイドバーから遷移）
- 両ページの主要な違い:
  - `/workflows`: `created_by = user.id` でフィルタ
  - `/workflows/pending`: `approver_id = user.id AND status = 'submitted'` + `tenant_admin` は全件

## 修正2: SCR-C03-1 URL 修正

**対象ファイル**: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/screens/SCR-C03-1.md

**問題**: URL が `/timesheet`（単数形）だが、実装は `/timesheets`（複数形）。

**修正内容**: ファイル内の `/timesheet` を `/timesheets` に変更。

## 修正3: SCR-002 通知リンクルール修正

**対象ファイル**: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/screens/SCR-002.md

**問題**: ダッシュボードの通知リンク生成ルールが SCR-E01 の定義と不一致。

**修正内容**: 通知リンクの resource_type→URL マッピングを以下に統一（SCR-E01 に合わせる）:
- `workflow` → `/workflows/{resource_id}`
- `project` → `/projects/{resource_id}`
- `task` → `/projects`（個別タスクURLなし）
- `expense` → `/expenses`（個別経費URLなし）
- null → リンクなし

## 修正4: API-C03-2 CSV エクスポート未実装の注記

**対象ファイル**: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/apis/API-C03-2.md

**問題**: CSV エクスポート Route Handler (`GET /api/timesheets/export`) が仕様書に記載されているが未実装。

**修正内容**: 該当セクションに「**Phase 2 で実装予定**」の注記を追加。

## 検証

修正後、以下を実行:
```
cd /home/garchomp-game/workspace/starlight-test/opsHub-doc && npm run build
```
ビルドが通ること。

## 出力

成果物を以下のファイルに保存:
/home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/fix-b-spec-updates.md

frontmatter を含めること:
---
title: "FIX-B: 仕様書更新"
---
