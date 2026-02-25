---
title: "R17-2: 仕様書 vs 実装 最終検証"
description: "Phase 2-3 の新規仕様書と実装コードの整合性を検証"
---

あなたは OpsHub の品質監査担当です。
Phase 2-3 で追加された仕様書と実装の整合性を検証してください。

## 検証対象

### 経費集計
- 仕様: SCR-D03, API-D02
- 実装: `expenses/summary/`

### 請求
- 仕様: SCR-H01, SCR-H02, API-H01
- 実装: `invoices/`

### ドキュメント管理
- 仕様: SCR-F01, API-F01
- 実装: `projects/[id]/documents/`

### 全文検索
- 仕様: SCR-G02, API-G01
- 実装: `search/`

### NFR
- 仕様: NFR要件
- 実装: `lib/logger.ts`, `api/health/route.ts`, `next.config.ts`

## 仕様書ディレクトリ
/home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/

## 実装ディレクトリ
/home/garchomp-game/workspace/starlight-test/OpsHub/src/app/

## 検証項目

各仕様書に対して:
1. 画面URL が実装のルーティングと一致するか
2. テーブル列/フィルタが仕様通りか
3. Server Action の入出力型が仕様通りか
4. 権限チェックが仕様通りか
5. エラーコードが仕様で定義されたものと一致するか
6. 監査ログポイントが仕様通り実装されているか

## 出力

各機能の検証結果を表形式で報告。不一致があればその場で修正（コード or 仕様書）。

## ウォークスルー出力先

/home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/r17-2-final-spec-vs-code.md
