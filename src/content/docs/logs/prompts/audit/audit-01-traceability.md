---
title: "監査01: トレーサビリティ検証"
---

あなたは OpsHub 開発ドキュメントの品質監査担当です。
要件(REQ)から画面仕様(SCR)、API仕様(API)、詳細設計(DD)までのトレーサビリティを検証してください。

## 調査対象ファイル
- /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/requirements/req-catalog/index.md
- /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/requirements/screens/index.md
- /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/screens/ （全ファイル）
- /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/apis/ （全ファイル）
- /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/detail/db/index.md
- /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/detail/rls/index.md
- /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/detail/modules/index.md

## 確認項目

### 1. REQ → SCR マッピング
- requirements/req-catalog に定義された各 REQ-xxx が、どの SCR-xxx で実現されるか
- 逆方向: 各 SCR-xxx の Related に正しい REQ-xxx が記載されているか
- **ヌケ**: REQ があるのに対応する SCR がないもの

### 2. SCR → API マッピング
- 各 SCR-xxx で参照している API-xxx が実際に存在するか
- 逆方向: 各 API-xxx の Related に正しい SCR-xxx が記載されているか
- **ヌケ**: SCR があるのに対応する API がないもの

### 3. 画面一覧の整合性
- requirements/screens/index.md に記載されている画面一覧（21画面）と、spec/screens/ に実際にファイルが存在する画面（15ファイル）の差分
- 特に以下が存在しない可能性あり: SCR-D02, SCR-D03, SCR-E02, SCR-F01, SCR-G01, SCR-G02
- これらは「未実装の将来機能」か「定義漏れ」かを判断

### 4. API → DD マッピング
- 各 API-xxx が参照するテーブル（DD-DB-xxx）が detail/db に定義されているか
- RLS ポリシーが detail/rls に定義されているか

## 出力
調査結果を以下のファイルに保存:
/home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/audit-01-traceability.md

frontmatter を含めること:
---
title: "監査01: トレーサビリティ検証"
---

以下の形式で報告:
- ✅ 正常にリンクされている項目
- ⚠️ 片方向のみリンク（逆参照なし）
- ❌ ヌケモレ（REQ/SCR/API/DD が欠落）
- マトリクス表（REQ × SCR × API × DD の対応表）
