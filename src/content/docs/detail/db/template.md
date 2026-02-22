---
title: DB設計テンプレ（DD-DB-XXX）
description: テーブル・制約・Index・履歴・RLS前提を明確にする
---

## 目的 / In-Out / Related
- **目的**: DB詳細を統一フォーマットで記述
- **対象範囲（In/Out）**: 物理最適化は必要な範囲のみ
- **Related**: REQ-XXX / SPEC-XXX / ADR-XXXX

## テーブル情報
- **DD ID**: DD-DB-XXX
- **テーブル名**:
- **用途**:
- **所有テナントキー**: tenant_id（必須想定）

## カラム
|列名|型|NULL|制約|備考|
|---|---|---:|---|---|

## 制約・Index
- Unique:
- FK:
- Index:

## 更新履歴/監査
- 方式: イベントログ / 履歴テーブル / updated_at等（ADR参照）

## RLS方針（要点）
- 参照条件:
- 更新条件:
- 例外（service roleなど）:

## マイグレーション方針
- 命名:
- 互換性:
