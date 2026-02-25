---
title: "R17-1: トレーサビリティ最終検証"
description: "要件→仕様書→詳細設計→実装の追跡可能性を全体再検証"
---

あなたは OpsHub の品質監査担当です。
Phase 1 の audit-01 と同じ観点で、Phase 2-3 の追加分を含むトレーサビリティの最終検証を行ってください。

## 参照

### Phase 1 の監査結果
- /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/audit-01-traceability.md

### 要件
- /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/requirements/req-catalog/index.md
- /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/requirements/screens/index.md

### 仕様書一覧
- /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/screens/index.md
- /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/apis/index.md

### 詳細設計
- /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/detail/db/index.md
- /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/detail/rls/index.md
- /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/detail/modules/index.md

## 検証項目

1. **REQ → SCR/API マッピング**: 全REQ（A〜G + H）に対応する SCR/API が存在するか
2. **SCR → Related リンク**: 各 SCR に REQ/API/DD の Related リンクがあるか
3. **API → Related リンク**: 各 API に REQ/SCR/DD の Related リンクがあるか
4. **DD → 実テーブル**: DD-DB-001〜015 が全て定義されているか
5. **ADR 一覧の完全性**: ADR-0001〜0006 が全て一覧に記載されているか

## 出力

マトリクス表と課題リストを作成。修正が必要な場合はその場で修正。

## ウォークスルー出力先

/home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/r17-1-final-traceability.md
