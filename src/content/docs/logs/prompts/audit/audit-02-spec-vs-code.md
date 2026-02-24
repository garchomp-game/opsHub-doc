---
title: "監査02: 仕様書と実装の整合性"
---

あなたは OpsHub 開発ドキュメントの品質監査担当です。
基本設計の仕様書（画面仕様・API仕様）が実装コードと整合しているかを検証してください。

## 調査対象

### 仕様書（opsHub-doc）
- /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/screens/ （全ファイル）
- /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/apis/ （全ファイル）

### 実装コード（OpsHub）
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/ （全ディレクトリ）
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/lib/ （共通ユーティリティ）
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/types/ （型定義）

## 確認項目

### 画面仕様 vs 実装
各 SCR-xxx について:
1. 記載されている画面要素（テーブル列、フォーム項目、ボタン）が実装に存在するか
2. 権限チェック（アクセス可能ロール）が一致するか
3. ページ URL / ルーティングが一致するか

### API仕様 vs 実装
各 API-xxx について:
1. 記載されている Server Action 名が実装に存在するか
2. 入出力パラメータが一致するか
3. バリデーションルールが一致するか
4. エラーコードが一致するか

### 重点チェック
- SCR-D01 / API-D01（経費）: 逆引きで作成したため特に注意
- SCR-E01 / API-E01（通知）: 同上
- SCR-A03（監査ログ）: 同上
- SCR-002（ダッシュボード）: 更新したため確認

## 出力
調査結果を以下のファイルに保存:
/home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/audit-02-spec-vs-code.md

frontmatter を含めること:
---
title: "監査02: 仕様書と実装の整合性"
---

以下の形式で報告:
- 各 SCR/API ごとに ✅/⚠️/❌ で判定
- 差分がある場合は具体的な箇所と内容を記載
- 「仕様が古い」か「実装が間違い」かの判断も添える
