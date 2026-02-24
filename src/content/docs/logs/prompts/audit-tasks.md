---
title: "品質監査タスク一覧"
description: "全100ページの開発ドキュメントを並列調査するための調査タスク定義"
---

# opsHub-doc 品質監査 — 調査タスク

> 全100ページの開発ドキュメントを並列調査し、矛盾・ヌケモレ・品質問題を洗い出す。
> 各調査の結果は `/logs/walkthroughs/audit-{番号}.md` に出力すること。

---

## 調査 1: トレーサビリティ検証（REQ → SCR → API → DD）

```
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
```

---

## 調査 2: 仕様書と実装の整合性（spec vs code）

```
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
```

---

## 調査 3: 詳細設計と実装の整合性（detail vs code）

```
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
```

---

## 調査 4: ドキュメント内部の整合性と品質

```
あなたは OpsHub 開発ドキュメントの品質監査担当です。
ドキュメント間の内部整合性、用語統一、リンク切れ、フォーマット品質を検証してください。

## 調査対象
/home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/ 配下の全ファイル

## 確認項目

### 1. 用語の統一
以下の用語が全ドキュメントで統一されているか:
- アプリ名: 「OpsHub」で統一されているか（「Starlight App」が残っていないか）
- ロール名: member / approver / pm / accounting / it_admin / tenant_admin が統一されているか
- テーブル名・カラム名のケース（snake_case）が統一されているか

### 2. 内部リンクの健全性
- 各ファイル内のマークダウンリンク（[text](relative/path)）が有効なファイルを指しているか
- Astro の内部リンク（/spec/xxx/）が実際に存在するページを指しているか
- 「関連（Related）」セクションのリンクが切れていないか

### 3. ドキュメント間の矛盾
- requirements/roles と spec/authz のロール定義・権限マッピングが一致するか
- requirements/nfr に記載された非機能要件が detail/ で対応されているか
- catchup/ の「混同しやすいポイント」や「用語集」が最新の仕様と一致するか
- ADR の「決定」が実際の実装方式と一致するか

### 4. フォーマット品質
- 全ファイルに frontmatter（title, description）があるか
- テンプレ（template.md）通りの構造で書かれているか
- Mermaid 図の構文が正しいか

### 5. 旧ドキュメント（Archive）の扱い
- Archive セクションの6ファイルに全て「このページは Archive（参照専用）です」の注記があるか
- 正本へのリンクが正しいか

## 出力
調査結果を以下のファイルに保存:
/home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/audit-04-internal-quality.md

frontmatter を含めること:
---
title: "監査04: ドキュメント内部品質"
---
```

---

## 調査 5: 要件カバレッジと将来機能のギャップ分析

```
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
```
