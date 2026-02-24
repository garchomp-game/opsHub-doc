---
title: "監査03: 詳細設計と実装の整合性"
---

あなたは OpsHub 開発ドキュメントの品質監査担当です。
詳細設計ドキュメント（DB設計、RLS設計、モジュール設計）が実装と整合しているかを検証してください。

## 調査対象

### 詳細設計
- /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/detail/db/index.md
- /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/detail/rls/index.md
- /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/detail/modules/index.md
- /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/detail/sequences/index.md

### 実装
- マイグレーション: /home/garchomp-game/workspace/starlight-test/OpsHub/supabase/migrations/ （全ファイル）
- 型定義: /home/garchomp-game/workspace/starlight-test/OpsHub/src/types/database.ts
- 認証: /home/garchomp-game/workspace/starlight-test/OpsHub/src/lib/auth.ts
- 通知: /home/garchomp-game/workspace/starlight-test/OpsHub/src/lib/notifications.ts
- Supabaseクライアント: /home/garchomp-game/workspace/starlight-test/OpsHub/src/lib/supabase/

## 確認項目

### DB設計 vs マイグレーション
1. detail/db に記載された全テーブル（DD-DB-001〜012）がマイグレーションSQL に存在するか
2. カラム名・型・制約が一致するか
3. Index が記載通りに作成されているか
4. トリガー/関数が記載通りに存在するか

### RLS設計 vs マイグレーション
1. detail/rls に記載された全ポリシーがマイグレーション SQL に存在するか
2. ポリシーの条件（USING句、WITH CHECK句）が一致するか
3. ヘルパー関数（get_user_tenant_ids, has_role 等）が一致するか

### モジュール設計 vs 実装
1. detail/modules に記載されたディレクトリ構成が実際と一致するか
2. 共通ユーティリティの関数シグネチャが一致するか
3. Server/Client Component の分類が正しいか

### 状態遷移 vs 実装
1. detail/sequences に記載された状態遷移図が実装の TRANSITIONS 定数と一致するか

## 出力
調査結果を以下のファイルに保存:
/home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/audit-03-detail-vs-code.md

frontmatter を含めること:
---
title: "監査03: 詳細設計と実装の整合性"
---
