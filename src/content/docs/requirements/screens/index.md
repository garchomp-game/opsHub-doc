---
title: 画面一覧
description: OpsHub の全画面とURL・ロール・対応REQのマッピング
---

## 目的 / In-Out / Related
- **目的**: システムの全画面を一覧化し、設計の網羅性を確保する
- **対象範囲（In）**: 画面名・URL・対象ロール・対応REQ
- **対象範囲（Out）**: 画面の詳細仕様（→ SPEC-SCR）
- **Related**: [REQカタログ](../req-catalog/) / [ロール定義](../roles/) / [画面仕様](../../spec/screens/)

---

## 共通画面

| # | 画面名 | URL（案） | 対象ロール | REQ | SPEC-SCR | 優先度 |
|---|---|---|---|---|---|---|
| 01 | ログイン | `/login` | 全員 | — | SCR-001 | Must |
| 02 | ダッシュボード | `/dashboard` | 全員 | REQ-G03 | SCR-002 | Must |

## Epic A: テナント/組織/権限

| # | 画面名 | URL（案） | 対象ロール | REQ | SPEC-SCR | 優先度 |
|---|---|---|---|---|---|---|
| 03 | テナント管理 | `/admin/tenants` | IT Admin | REQ-A01 | SCR-A01 | Must |
| 04 | ユーザー管理 | `/settings/users` | Tenant Admin | REQ-A02 | SCR-A02 | Must |
| 05 | ロール管理 | `/settings/users/[id]/roles` | Tenant Admin | REQ-A03 | SCR-A03 | Must |

## Epic B: ワークフロー

| # | 画面名 | URL（案） | 対象ロール | REQ | SPEC-SCR | 優先度 |
|---|---|---|---|---|---|---|
| 06 | 申請一覧 | `/workflows` | 全員 | REQ-B03 | SCR-B01 | Must |
| 07 | 申請作成 | `/workflows/new` | Member,PM,Accounting | REQ-B01 | SCR-B02 | Must |
| 08 | 申請詳細/承認 | `/workflows/[id]` | 全員（権限で制御） | REQ-B02 | SCR-B03 | Must |

## Epic C: 案件/タスク/工数

| # | 画面名 | URL（案） | 対象ロール | REQ | SPEC-SCR | 優先度 |
|---|---|---|---|---|---|---|
| 09 | プロジェクト一覧 | `/projects` | 全員 | REQ-C01 | SCR-C01-1 | Must |
| 10 | プロジェクト詳細 | `/projects/[id]` | Member,PM | REQ-C01 | SCR-C01-2 | Must |
| 11 | タスク管理 | `/projects/[id]/tasks` | Member,PM | REQ-C02 | SCR-C02 | Must |
| 12 | 工数入力 | `/timesheet` | Member,PM | REQ-C03 | SCR-C03-1 | Must |
| 13 | 工数集計 | `/timesheet/summary` | PM | REQ-C03 | SCR-C03-2 | Must |

## Epic D: 経費

| # | 画面名 | URL（案） | 対象ロール | REQ | SPEC-SCR | 優先度 |
|---|---|---|---|---|---|---|
| 14 | 経費一覧 | `/expenses` | Member,Accounting | REQ-D01 | SCR-D01 | Should |
| 15 | 経費申請 | `/expenses/new` | Member | REQ-D01 | SCR-D02 | Should |
| 16 | 経費集計 | `/expenses/summary` | Accounting | REQ-D02 | SCR-D03 | Should |

## Epic E: 請求

| # | 画面名 | URL（案） | 対象ロール | REQ | SPEC-SCR | 優先度 |
|---|---|---|---|---|---|---|
| 17 | 請求一覧 | `/invoices` | Accounting,PM | REQ-E01 | SCR-E01 | Should |
| 18 | 請求書作成/編集 | `/invoices/[id]` | Accounting | REQ-E01 | SCR-E02 | Should |

## Epic F: ドキュメント

| # | 画面名 | URL（案） | 対象ロール | REQ | SPEC-SCR | 優先度 |
|---|---|---|---|---|---|---|
| 19 | ドキュメント一覧 | `/projects/[id]/docs` | Member,PM | REQ-F01 | SCR-F01 | Could |

## Epic G: 通知/検索/レポート

| # | 画面名 | URL（案） | 対象ロール | REQ | SPEC-SCR | 優先度 |
|---|---|---|---|---|---|---|
| 20 | 通知一覧 | `/notifications` | 全員 | REQ-G01 | SCR-G01 | Could |
| 21 | 検索結果 | `/search` | 全員 | REQ-G02 | SCR-G02 | Could |

## 画面設計の対象（基本設計で詳細化）

Must画面（13画面）を優先的に SPEC-SCR として詳細化する。
Should/Could 画面は概要レベルとする。

---

## 未決事項
- 設定画面（テナント設定、プロフィール設定）の追加
- 監査ログ閲覧画面（IT Admin / Tenant Admin 向け）の追加

## 次アクション
- 基本設計で主要画面（Must）の SPEC-SCR を作成
