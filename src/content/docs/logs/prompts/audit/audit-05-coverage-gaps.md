---
title: "監査05: 要件カバレッジとギャップ分析"
---

あなたは OpsHub 開発ドキュメントの品質監査担当です。
要件定義で規定された全機能のうち、設計・実装済みのものと未着手のものを整理し、ギャップ分析を行ってください。

## 調査対象
- /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/requirements/ （全ファイル）
- /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/ （全ファイル）
- /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/knowledge.md

## 確認項目

### 1. 要件一覧 vs 仕様書の存在
requirements/req-catalog の全 REQ について:
- 対応する SCR/API 仕様書が存在するか
- 存在しない場合、それは「将来実装予定」か「定義漏れ」か

### 2. 画面一覧の未実装画面
requirements/screens/index.md に記載されているが spec/screens/ にファイルがない画面:
- SCR-D02, SCR-D03 → 何の画面か？
- SCR-E02 → 何の画面か？
- SCR-F01 → 何の画面か？
- SCR-G01, SCR-G02 → 何の画面か？

これらが:
a) 将来フェーズの機能で、明示的にスコープ外とされているか
b) 今回のスコープに含まれるべきなのに漏れているか

### 3. NFR のカバレッジ
requirements/nfr の各 NFR-xx について:
- 設計（spec/detail）で対応されているものはどれか
- 実装で対応されているものはどれか
- 未対応の NFR のうち、リスクの高いものはどれか

### 4. ロール要件のカバレッジ
requirements/roles に定義された6ロールについて:
- 各ロールの権限が全ての SCR/API で正しく反映されているか
- 新規追加機能（経費、通知、監査ログ）でロール制御が仕様化されているか

## 出力
調査結果を以下のファイルに保存:
/home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/audit-05-coverage-gaps.md

frontmatter を含めること:
---
title: "監査05: 要件カバレッジとギャップ分析"
---

以下の形式で報告:
- 機能カバレッジマトリクス（REQ × 仕様書有無 × 実装有無）
- 未実装画面の分類（将来機能 / 漏れ）
- NFR リスク評価表
- ロール × 機能の権限マトリクス
