---
title: 画面仕様一覧
description: SPEC-SCR の目次と画面仕様のステータス管理
---

## 目的 / In-Out / Related
- **目的**: 画面仕様の一覧管理と進捗追跡
- **対象範囲（In）**: 各画面の仕様ページへのリンクとステータス
- **対象範囲（Out）**: 画面仕様の個別内容（→ 各SPEC-SCR）
- **Related**: [画面一覧（要件）](../../requirements/screens/) / [権限/認可](../authz/)

---

## 採番ルール

- `SCR-{Epic}-{REQ番号}` で REQ と 1:1 対応
- 同一 REQ に複数画面がある場合: `-1`, `-2` のサブ番号を付与（単独画面はサブ番号なし）

## Must 画面仕様

| SPEC-SCR | 画面名 | REQ | ステータス |
|---|---|---|---|
| [SCR-001](/spec/screens/scr-001/) | ログイン | — | Draft |
| [SCR-002](/spec/screens/scr-002/) | ダッシュボード | REQ-G03 | Draft |
| [SCR-A01](/spec/screens/scr-a01/) | テナント管理 | REQ-A01 | Draft |
| [SCR-A02](/spec/screens/scr-a02/) | ユーザー管理 | REQ-A02 | Draft |
| [SCR-B01](/spec/screens/scr-b01/) | 申請一覧 | REQ-B03 | Draft |
| [SCR-B02](/spec/screens/scr-b02/) | 申請作成 | REQ-B01 | Draft |
| [SCR-B03](/spec/screens/scr-b03/) | 申請詳細/承認 | REQ-B02 | Draft |
| [SCR-C01-1](/spec/screens/scr-c01-1/) | プロジェクト一覧 | REQ-C01 | Draft |
| [SCR-C01-2](/spec/screens/scr-c01-2/) | プロジェクト詳細 | REQ-C01 | Draft |
| [SCR-C02](/spec/screens/scr-c02/) | タスク管理 | REQ-C02 | Draft |
| [SCR-C03-1](/spec/screens/scr-c03-1/) | 工数入力 | REQ-C03 | Draft |
| [SCR-C03-2](/spec/screens/scr-c03-2/) | 工数集計 | REQ-C03 | Draft |

## 追加画面仕様

| SPEC-SCR | 画面名 | REQ | ステータス |
|---|---|---|---|
| [SCR-A03](/spec/screens/scr-a03/) | 監査ログビューア（`/admin/audit-logs`） | REQ-A03 | Draft |
| [SCR-D01](/spec/screens/scr-d01/) | 経費管理（`/expenses`, `/expenses/new`） | REQ-D01 | Draft |
| [SCR-D03](/spec/screens/scr-d03/) | 経費集計 | REQ-D02 | Draft |
| [SCR-E01](/spec/screens/scr-e01/) | 通知システム（ヘッダー組込 NotificationBell） | REQ-G01 | Draft |
| [SCR-F01](/spec/screens/scr-f01/) | ドキュメント管理 | REQ-F01 | Draft |
| [SCR-G02](/spec/screens/scr-g02/) | 全文検索 | REQ-G02 | Draft |
| [SCR-H01](/spec/screens/scr-h01/) | 請求一覧 | REQ-E01 | Draft |
| [SCR-H02](/spec/screens/scr-h02/) | 請求書詳細/編集 | REQ-E01 | Draft |

## Should / Could 画面仕様

Must 完了後に着手。概要は [画面テンプレ](/spec/screens/template/) に従って作成する。
