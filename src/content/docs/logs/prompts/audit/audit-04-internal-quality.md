---
title: "監査04: ドキュメント内部品質"
---

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
