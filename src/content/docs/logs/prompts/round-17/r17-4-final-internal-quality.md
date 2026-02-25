---
title: "R17-4: ドキュメント内部品質 最終検証"
description: "全ドキュメントの一貫性・リンク・用語・フォーマットを最終検証"
---

あなたは OpsHub の品質監査担当です。
全ドキュメントの内部品質を最終検証してください。

## 検証対象

/home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/

## 検証項目

1. **用語の統一**: ロール名（TenantAdmin / tenant_admin）、ステータス名が統一されているか
2. **frontmatter**: 全 .md ファイルに `title` が設定されているか
3. **内部リンク**: Related セクションのリンクが有効か
4. **採番の連続性**: SCR, API, DD-DB, DD-MOD, ADR の番号が欠番なく、または意図的に欠番であることが注記されているか
5. **Mermaid 構文**: 全 Mermaid ブロックが有効な構文か（ビルドエラーなし）
6. **サイドバー vs ファイル**: サイドバーの全リンクが実ファイルに対応しているか
7. **Phase 1 audit-04 の指摘が解消されているか**

## 参照
- Phase 1 監査結果: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/audit-04-internal-quality.md

## 出力

カテゴリ別の検証結果テーブル。問題があればその場で修正。

## 検証

```
cd /home/garchomp-game/workspace/starlight-test/opsHub-doc && npm run build
```

## ウォークスルー出力先

/home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/r17-4-final-internal-quality.md
