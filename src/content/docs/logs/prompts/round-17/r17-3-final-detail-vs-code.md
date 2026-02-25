---
title: "R17-3: 詳細設計 vs 実装 最終検証"
description: "DB設計・RLS・モジュール設計と実装の整合性を検証"
---

あなたは OpsHub の品質監査担当です。
Phase 2-3 で拡張された詳細設計と実装の整合性を検証してください。

## 検証対象

### DB設計 (detail/db/index.md)
- DD-DB-013 invoices
- DD-DB-014 invoice_items
- DD-DB-015 documents
- 全文検索インデックス（pg_trgm）

### RLS設計 (detail/rls/index.md)
- invoices ポリシー（4本）
- invoice_items ポリシー（4本）
- documents ポリシー（3本）

### マイグレーションファイル
/home/garchomp-game/workspace/starlight-test/OpsHub/supabase/migrations/

## 検証項目

1. **DB設計 vs マイグレーション**: カラム名・型・制約・デフォルト値・FK が一致するか
2. **RLS設計 vs マイグレーション**: ポリシー名・条件・対象操作が一致するか
3. **インデックス設計 vs マイグレーション**: インデックス名・対象カラム・種別が一致するか
4. **トリガー**: `updated_at` トリガーが必要なテーブルに設定されているか
5. **RPC関数**: `next_invoice_number` が設計通りか

## 出力

検証結果をテーブル形式で報告。不一致があればその場で修正。

## ウォークスルー出力先

/home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/r17-3-final-detail-vs-code.md
