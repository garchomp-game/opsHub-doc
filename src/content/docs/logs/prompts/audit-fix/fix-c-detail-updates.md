---
title: "FIX-C: 詳細設計書の修正"
description: "DB設計のカラム名修正、RLS追記、タスク遷移追記、getCurrentUser追記"
---

あなたは OpsHub の設計ドキュメント担当です。監査で検出された詳細設計書の記載漏れ・不一致を修正してください。

## 修正1: audit_logs カラム名の修正

**対象ファイル**: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/detail/db/index.md

**問題**: 設計書では `before` / `after` だが、マイグレーション・実装では `before_data` / `after_data`。

**修正内容**: DD-DB-009 audit_logs のカラム定義で `before` → `before_data`、`after` → `after_data` に修正。

## 修正2: project_members の RLS ポリシー追記

**対象ファイル**: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/detail/rls/index.md

**問題**: `project_members` テーブルの RLS ポリシーが設計書に未記載だが、マイグレーションでは select/insert/delete の3ポリシーが存在。

**参照**: /home/garchomp-game/workspace/starlight-test/OpsHub/supabase/migrations/20260223_000001_initial_schema.sql で定義されたポリシーを確認して正確に記載

**追記内容**: project_members セクションを追加（既存テーブルのフォーマットに合わせる）

## 修正3: tasks の RLS ポリシー追記

**対象ファイル**: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/detail/rls/index.md

**問題**: `tasks` テーブルの RLS ポリシーが設計書に未記載だが、マイグレーションでは select/insert/update の3ポリシーが存在。

**参照**: 同上のマイグレーションファイル

## 修正4: timesheets_select に tenant_admin 条件追記

**対象ファイル**: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/detail/rls/index.md

**問題**: `timesheets_select` ポリシーにマイグレーションでは `OR has_role(tenant_id, 'tenant_admin')` が含まれるが設計書に未記載。

**修正内容**: 条件に `OR has_role(tenant_id, 'tenant_admin')` を追加。

## 修正5: timesheets_delete ポリシー追記

**対象ファイル**: 同上

**問題**: `timesheets_delete` ポリシーがマイグレーションに存在するが設計書に未記載。

## 修正6: タスク状態遷移図の追記

**対象ファイル**: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/detail/sequences/index.md

**問題**: タスクの状態遷移が設計書に未記載（実装では `TASK_TRANSITIONS` 定数で定義済み）。

**追記内容**:
```
todo → in_progress
in_progress → todo, done
done → in_progress
```

Mermaid の stateDiagram-v2 形式で図を追加。

## 修正7: getCurrentUser() の追記

**対象ファイル**: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/detail/modules/index.md

**問題**: `getCurrentUser()` 関数が実装に存在するが設計書に未記載。

**参照**: /home/garchomp-game/workspace/starlight-test/OpsHub/src/lib/auth.ts

**追記内容**: 認証ヘルパー一覧に `getCurrentUser(): Promise<CurrentUser | null>` を追加。未認証でも null を返す（エラーを投げない）点を明記。

## 修正8: getNotificationLink() の追記

**対象ファイル**: 同上

**問題**: `getNotificationLink()` が実装に存在するが設計書に未記載。

**参照**: /home/garchomp-game/workspace/starlight-test/OpsHub/src/lib/notifications.ts

## 検証

修正後、以下を実行:
```
cd /home/garchomp-game/workspace/starlight-test/opsHub-doc && npm run build
```
ビルドが通ること。

## 出力

成果物を以下のファイルに保存:
/home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/fix-c-detail-updates.md

frontmatter を含めること:
---
title: "FIX-C: 詳細設計書修正"
---
