---
title: "監査01: トレーサビリティ検証"
---

> 監査実施日: 2026-02-24  
> 対象: REQ → SCR → API → DD の全層トレーサビリティ

---

## 1. REQ → SCR マッピング

### 1.1 正引き（REQ → SCR）

| REQ | REQ内 Related SCR | screens/index SCR | SCR spec ファイル | 判定 |
|---|---|---|---|---|
| REQ-A01 | SPEC-SCR-A01 | SCR-A01 | ✅ SCR-A01.md 存在 | ✅ |
| REQ-A02 | SPEC-SCR-A02 | SCR-A02 | ✅ SCR-A02.md 存在 | ✅ |
| REQ-A03 | — (ロール定義参照のみ) | SCR-A03 | ✅ SCR-A03.md 存在 | ⚠️ REQ側に SCR-A03 未記載 |
| REQ-B01 | SPEC-SCR-B01 | SCR-B02 | ✅ SCR-B02.md 存在 | ⚠️ REQ→SCR-B01、画面一覧→SCR-B02 で不一致 |
| REQ-B02 | SPEC-SCR-B02 | SCR-B03 | ✅ SCR-B03.md 存在 | ⚠️ REQ→SCR-B02、画面一覧→SCR-B03 で不一致 |
| REQ-B03 | SPEC-SCR-B03 | SCR-B01 | ✅ SCR-B01.md 存在 | ⚠️ REQ→SCR-B03、画面一覧→SCR-B01 で不一致 |
| REQ-C01 | SPEC-SCR-C01-1 / C01-2 | SCR-C01-1 / C01-2 | ✅ 両方存在 | ✅ |
| REQ-C02 | SPEC-SCR-C02 | SCR-C02 | ✅ SCR-C02.md 存在 | ✅ |
| REQ-C03 | SPEC-SCR-C03-1 / C03-2 | SCR-C03-1 / C03-2 | ✅ 両方存在 | ✅ |
| REQ-D01 | SPEC-SCR-D01 | SCR-D01 / SCR-D02 | ✅ SCR-D01.md 存在 | ⚠️ SCR-D02 ファイル無し |
| REQ-D02 | SPEC-SCR-D02 | SCR-D03 | ❌ SCR-D03.md 無し | ❌ ファイル未作成 |
| REQ-E01 | SPEC-SCR-E01 | SCR-E01 / SCR-E02 | ✅ SCR-E01.md 存在 | ⚠️ SCR-E02 ファイル無し |
| REQ-F01 | SPEC-SCR-F01 | SCR-F01 | ❌ SCR-F01.md 無し | ❌ ファイル未作成 |
| REQ-G01 | SPEC-SCR-G01 | SCR-G01 | ❌ SCR-G01.md 無し | ❌ ファイル未作成 |
| REQ-G02 | — (ADR-0005参照) | SCR-G02 | ❌ SCR-G02.md 無し | ❌ ファイル未作成 |
| REQ-G03 | SPEC-SCR-G03 | SCR-002 | ✅ SCR-002.md 存在 | ⚠️ REQ→SCR-G03、画面一覧→SCR-002 で番号不一致 |

### 1.2 逆引き（SCR → REQ）

| SCR spec | Related に REQ 記載 | 対応 REQ | 判定 |
|---|---|---|---|
| SCR-001 | — | ログイン（REQ無し） | ✅ 要件不要（共通画面） |
| SCR-002 | REQ-G03 | REQ-G03 | ✅ |
| SCR-A01 | REQ-A01 | REQ-A01 | ✅ |
| SCR-A02 | REQ-A02 | REQ-A02 | ✅ |
| SCR-A03 | — (NFR-05 のみ) | REQ-A03（画面一覧） | ⚠️ REQ-A03 未記載（SCR-A03 は画面一覧では REQ-A03 に対応） |
| SCR-B01 | REQ-B03 | REQ-B03 | ✅ |
| SCR-B02 | REQ-B01 | REQ-B01 | ✅ |
| SCR-B03 | REQ-B02 | REQ-B02 | ✅ |
| SCR-C01-1 | REQ-C01 | REQ-C01 | ✅ |
| SCR-C01-2 | REQ-C01 | REQ-C01 | ✅ |
| SCR-C02 | REQ-C02 | REQ-C02 | ✅ |
| SCR-C03-1 | REQ-C03 | REQ-C03 | ✅ |
| SCR-C03-2 | REQ-C03 | REQ-C03 | ✅ |
| SCR-D01 | REQ-D01 | REQ-D01 | ✅ |
| SCR-E01 | — | REQ-E01 / REQ-G01 | ❌ REQ未記載（通知画面は REQ-G01 が正か、実態は通知ベル） |

### 1.3 REQ-B 系の番号ズレ問題

> [!WARNING]
> REQ-B01〜B03 と SCR-B01〜B03 の対応関係が **req-catalog** と **screens/index** で一貫していますが、SCR 番号が 機能名と直感に反する対応になっています：
>
> | 機能 | REQ | 画面一覧 SCR | 実際の SCR spec |
> |---|---|---|---|
> | 申請一覧（履歴追跡） | REQ-B03 | SCR-B01 | SCR-B01 → REQ-B03 ✅ |
> | 申請作成 | REQ-B01 | SCR-B02 | SCR-B02 → REQ-B01 ✅ |
> | 承認/差戻し | REQ-B02 | SCR-B03 | SCR-B03 → REQ-B02 ✅ |
>
> **結論**: 各文書間の対応は**整合**している。ただし REQ の Related 欄が古い命名規則（SPEC-SCR-B01 = 申請作成）を使っており、最終的な SCR 番号と一致していない。

---

## 2. SCR → API マッピング

### 2.1 各 SCR が参照している API の存在確認

| SCR | Related 内の API 参照 | API spec 存在 | 判定 |
|---|---|---|---|
| SCR-001 | — | — | ✅ ログインは Supabase Auth 直接 |
| SCR-002 | — (API参照なし) | — | ⚠️ ダッシュボードにAPI参照なし（Server Component 直接取得のため妥当） |
| SCR-A01 | — (API参照なし) | API-A01.md 存在 | ⚠️ SCR→API の参照が未記載 |
| SCR-A02 | — (API参照なし) | API-A02.md 存在 | ⚠️ SCR→API の参照が未記載 |
| SCR-A03 | — (API参照なし) | — | ⚠️ 監査ログ閲覧用 API spec なし（Server Component 直接取得のため妥当） |
| SCR-B01 | SPEC-API-B01 | ✅ API-B01.md | ✅ |
| SCR-B02 | SPEC-API-B02 | ✅ API-B02.md | ✅ |
| SCR-B03 | SPEC-API-B03 | ✅ API-B03.md | ✅ |
| SCR-C01-1 | SPEC-API-C01 | ✅ API-C01.md | ✅ |
| SCR-C01-2 | — (API参照なし) | API-C01 が両方カバー | ⚠️ SCR-C01-2 に API 参照なし |
| SCR-C02 | — (API参照なし) | ✅ API-C02.md | ⚠️ SCR→API の参照が未記載 |
| SCR-C03-1 | SPEC-API-C03-1 | ✅ API-C03-1.md | ✅ |
| SCR-C03-2 | — (API参照なし) | ✅ API-C03-2.md | ⚠️ SCR→API の参照が未記載 |
| SCR-D01 | SPEC-API-D01 | ✅ API-D01.md | ✅ |
| SCR-E01 | API-E01 | ✅ API-E01.md | ✅ |

### 2.2 逆引き（API → SCR）

| API | Related 内の SCR 参照 | 判定 |
|---|---|---|
| API-A01 | SCR-A01 | ✅ |
| API-A02 | SCR-A02 | ✅ |
| API-B01 | SPEC-SCR-B01 | ✅ |
| API-B02 | SPEC-SCR-B02 | ✅ |
| API-B03 | SPEC-SCR-B03 | ✅ |
| API-C01 | SCR-C01-1 / SCR-C01-2 | ✅ |
| API-C02 | SCR-C02 | ✅ |
| API-C03-1 | SCR-C03-1 | ✅ |
| API-C03-2 | SCR-C03-2 | ✅ |
| API-D01 | SPEC-SCR-D01 | ✅ |
| API-E01 | SCR-E01 | ✅ |

### 2.3 ヌケモレ

| 対象 | 内容 | 判定 |
|---|---|---|
| SCR-D02（経費申請） | 画面一覧に記載あり、spec ファイル無し → API も無し | ❌ 未作成 |
| SCR-D03（経費集計） | 画面一覧に記載あり、spec ファイル無し → API も無し | ❌ 未作成 |
| SCR-E02（請求書編集） | 画面一覧に記載あり、spec ファイル無し → API も無し | ❌ 未作成 |
| SCR-A01 / A02 | SCR 側に API 参照がないが API-A01 / A02 は存在 | ⚠️ 片方向リンク |
| SCR-C01-2 / C02 / C03-2 | SCR 側に API 参照がないが対応 API は存在 | ⚠️ 片方向リンク |

---

## 3. 画面一覧の整合性

### 3.1 画面一覧 vs spec/screens/ ファイル差分

画面一覧（`requirements/screens/index.md`）に **21画面** 記載。  
`spec/screens/` に **15 SCR ファイル**（template.md, index.md 除く）。

| SCR | 画面名 | ファイル存在 | 状態 |
|---|---|---|---|
| SCR-001 | ログイン | ✅ | — |
| SCR-002 | ダッシュボード | ✅ | — |
| SCR-A01 | テナント管理 | ✅ | — |
| SCR-A02 | ユーザー管理 | ✅ | — |
| SCR-A03 | ロール管理 → 監査ログビューア | ✅ | ⚠️ 画面一覧では「ロール管理」だが、spec 実態は「監査ログビューア」 |
| SCR-B01 | 申請一覧 | ✅ | — |
| SCR-B02 | 申請作成 | ✅ | — |
| SCR-B03 | 申請詳細/承認 | ✅ | — |
| SCR-C01-1 | プロジェクト一覧 | ✅ | — |
| SCR-C01-2 | プロジェクト詳細 | ✅ | — |
| SCR-C02 | タスク管理 | ✅ | — |
| SCR-C03-1 | 工数入力 | ✅ | — |
| SCR-C03-2 | 工数集計 | ✅ | — |
| SCR-D01 | 経費一覧 | ✅ | — |
| SCR-D02 | 経費申請 | ❌ | 未実装の将来機能 |
| SCR-D03 | 経費集計 | ❌ | 未実装の将来機能（REQ-D02 に対応） |
| SCR-E01 | 請求一覧 → 通知 | ✅ | ⚠️ 画面一覧では「請求一覧」だが、実態は「通知機能」として作成 |
| SCR-E02 | 請求書作成/編集 | ❌ | 未実装の将来機能 |
| SCR-F01 | ドキュメント一覧 | ❌ | Could 優先度のため未定義 |
| SCR-G01 | 通知一覧 | ❌ | ⚠️ SCR-E01 が通知機能を実装しているが、番号が異なる |
| SCR-G02 | 検索結果 | ❌ | Could 優先度のため未定義 |

### 3.2 未存在ファイルの判断

| SCR | 判断 | 理由 |
|---|---|---|
| SCR-D02 | **定義漏れ（低優先度）** | 経費登録画面 `expenses/new/page.tsx` は実装済み。spec 未作成 |
| SCR-D03 | **未実装の将来機能** | 経費集計機能は未実装。REQ-D02（Should）の対応 |
| SCR-E02 | **未実装の将来機能** | 請求書編集は未実装。REQ-E01（Should）の対応 |
| SCR-F01 | **未実装の将来機能** | ドキュメント管理は未実装。REQ-F01（Could）の対応 |
| SCR-G01 | **SCR-E01 で代替** | 通知機能は SCR-E01 として実装済み。画面一覧の番号体系と不一致 |
| SCR-G02 | **未実装の将来機能** | 全文検索は未実装。REQ-G02（Could）の対応 |

> [!IMPORTANT]
> **SCR-E01 の ID 衝突問題**: 画面一覧では SCR-E01 = 「請求一覧」だが、spec ファイル SCR-E01.md は「通知機能」として作成されている。将来的に請求機能を実装する際に ID の衝突が発生する。SCR-G01 として通知を再番号付けするか、請求機能に別の ID を割り当てる必要がある。

> [!IMPORTANT]
> **SCR-A03 の用途変更**: 画面一覧では SCR-A03 = 「ロール管理」（`/settings/users/[id]/roles`）だが、spec ファイル SCR-A03.md は「監査ログビューア」として作成されている。ロール管理画面（REQ-A03）の spec が事実上存在しない状態。ユーザー管理画面 SCR-A02 にロール変更機能が含まれているため、SCR-A03 の再整理が必要。

---

## 4. API → DD マッピング

### 4.1 API → テーブル参照

| API | Related 内の DD 参照 | DD-DB 定義存在 | 判定 |
|---|---|---|---|
| API-A01 | DD-DB-001 tenants | ✅ | ✅ |
| API-A02 | DD-DB-002 user_roles | ✅ | ✅ |
| API-B01 | DD-DB-workflows | ✅ DD-DB-006 | ✅ |
| API-B02 | DD-DB-workflows | ✅ DD-DB-006 | ✅ |
| API-B03 | DD-DB-workflows | ✅ DD-DB-006 | ✅ |
| API-C01 | DD-DB-003 projects | ✅ | ✅ |
| API-C02 | DD-DB-005 tasks | ✅ | ✅ |
| API-C03-1 | DD-DB-007 timesheets | ✅ | ✅ |
| API-C03-2 | DD-DB-007 timesheets | ✅ | ✅ |
| API-D01 | DD-DB-expenses / DD-DB-workflows | ✅ DD-DB-008 / DD-DB-006 | ✅ |
| API-E01 | DD-DB-010 notifications | ✅ | ✅ |

### 4.2 RLS ポリシー定義確認

| テーブル | DD-DB | RLS ポリシー定義 | 判定 |
|---|---|---|---|
| tenants | DD-DB-001 | ✅ SELECT / UPDATE | ✅ |
| user_roles | DD-DB-002 | ✅ SELECT / INSERT / DELETE | ✅ |
| projects | DD-DB-003 | ✅ SELECT / INSERT / UPDATE | ✅ |
| project_members | DD-DB-004 | ❌ 未定義 | ⚠️ RLS 定義なし |
| tasks | DD-DB-005 | ❌ 未定義 | ⚠️ RLS 定義なし |
| workflows | DD-DB-006 | ✅ SELECT / INSERT / UPDATE | ✅ |
| timesheets | DD-DB-007 | ✅ SELECT / INSERT / UPDATE | ✅ |
| expenses | DD-DB-008 | ✅ SELECT / INSERT / UPDATE | ✅ |
| audit_logs | DD-DB-009 | ✅ SELECT / INSERT（UPDATE/DELETE禁止） | ✅ |
| notifications | DD-DB-010 | ✅ SELECT / UPDATE / INSERT | ✅ |
| workflow_attachments | DD-DB-011 | ✅ SELECT / INSERT | ✅ |
| profiles | DD-DB-012 | ✅ SELECT / UPDATE / INSERT | ✅ |

### 4.3 RLS ヌケ

| テーブル | 問題 | 影響度 |
|---|---|---|
| project_members (DD-DB-004) | RLS ポリシー未定義 | ⚠️ Medium — `tenant_id` カラムはあるが RLS 定義漏れ |
| tasks (DD-DB-005) | RLS ポリシー未定義 | ⚠️ Medium — プロジェクト経由のアクセス制御が明示されていない |

---

## 5. トレーサビリティ・マトリクス

### 5.1 Epic A: テナント/組織/権限

| REQ | SCR (画面一覧) | SCR spec | API | DD-DB | RLS |
|---|---|---|---|---|---|
| REQ-A01 | SCR-A01 ✅ | SCR-A01.md ✅ | API-A01 ✅ | DD-DB-001 ✅ | tenants ✅ |
| REQ-A02 | SCR-A02 ✅ | SCR-A02.md ✅ | API-A02 ✅ | DD-DB-002 ✅ | user_roles ✅ |
| REQ-A03 | SCR-A03 ⚠️¹ | SCR-A03.md ⚠️² | — ³ | DD-DB-002 ✅ | user_roles ✅ |

¹ 画面一覧はロール管理だが spec は監査ログ  
² spec の実態は監査ログビューア（REQ-A03 との対応がずれている）  
³ ロール管理用 API は API-A02 に包含

### 5.2 Epic B: ワークフロー

| REQ | SCR (画面一覧) | SCR spec | API | DD-DB | RLS |
|---|---|---|---|---|---|
| REQ-B01 | SCR-B02 ✅ | SCR-B02.md ✅ | API-B02 ✅ | DD-DB-006 ✅ | workflows ✅ |
| REQ-B02 | SCR-B03 ✅ | SCR-B03.md ✅ | API-B03 ✅ | DD-DB-006 ✅ | workflows ✅ |
| REQ-B03 | SCR-B01 ✅ | SCR-B01.md ✅ | API-B01 ✅ | DD-DB-006 ✅ | workflows ✅ |

### 5.3 Epic C: 案件/タスク/工数

| REQ | SCR (画面一覧) | SCR spec | API | DD-DB | RLS |
|---|---|---|---|---|---|
| REQ-C01 | SCR-C01-1/C01-2 ✅ | ✅ 両方 | API-C01 ✅ | DD-DB-003/004 ✅ | projects ✅ / project_members ⚠️ |
| REQ-C02 | SCR-C02 ✅ | ✅ | API-C02 ✅ | DD-DB-005 ✅ | tasks ⚠️ |
| REQ-C03 | SCR-C03-1/C03-2 ✅ | ✅ 両方 | API-C03-1/C03-2 ✅ | DD-DB-007 ✅ | timesheets ✅ |

### 5.4 Epic D: 経費

| REQ | SCR (画面一覧) | SCR spec | API | DD-DB | RLS |
|---|---|---|---|---|---|
| REQ-D01 | SCR-D01/D02 ✅ | SCR-D01.md ✅ / D02 ❌ | API-D01 ✅ | DD-DB-008 ✅ | expenses ✅ |
| REQ-D02 | SCR-D03 ✅ | ❌ 未作成 | ❌ 未作成 | — | — |

### 5.5 Epic E: 請求

| REQ | SCR (画面一覧) | SCR spec | API | DD-DB | RLS |
|---|---|---|---|---|---|
| REQ-E01 | SCR-E01/E02 ✅ | ❌ 請求 spec なし¹ | ❌ 未作成 | ❌ 未定義² | — |

¹ SCR-E01.md は通知機能として流用されている  
² invoices テーブルは DB 設計の未決事項に記載

### 5.6 Epic F: ドキュメント

| REQ | SCR (画面一覧) | SCR spec | API | DD-DB | RLS |
|---|---|---|---|---|---|
| REQ-F01 | SCR-F01 ✅ | ❌ 未作成 | ❌ 未作成 | ❌ 未定義 | — |

### 5.7 Epic G: 通知/検索/レポート

| REQ | SCR (画面一覧) | SCR spec | API | DD-DB | RLS |
|---|---|---|---|---|---|
| REQ-G01 | SCR-G01 ✅ | ⚠️ SCR-E01 で代替 | API-E01 ✅ | DD-DB-010 ✅ | notifications ✅ |
| REQ-G02 | SCR-G02 ✅ | ❌ 未作成 | ❌ 未作成 | ❌ 未定義 | — |
| REQ-G03 | SCR-002 ✅ | ✅ SCR-002.md | — ¹ | — | — |

¹ ダッシュボードは Server Component 直接取得のため API spec 不要

---

## 6. 問題サマリ

### ❌ 欠落（対応必須）

| # | 問題 | 影響 |
|---|---|---|
| 1 | SCR-D02（経費申請）spec 未作成 | 実装済み画面の spec がない（定義漏れ） |
| 2 | SCR-E01 の番号衝突 | 画面一覧の SCR-E01（請求）と spec の SCR-E01（通知）が別物 |
| 3 | SCR-A03 の用途変更未反映 | 画面一覧の SCR-A03（ロール管理）と spec の SCR-A03（監査ログ）が別物 |
| 4 | project_members の RLS 定義なし | セキュリティポリシーの欠落 |
| 5 | tasks の RLS 定義なし | セキュリティポリシーの欠落 |

### ⚠️ 片方向リンク（改善推奨）

| # | 問題 | 対象 |
|---|---|---|
| 6 | SCR → API の参照未記載 | SCR-A01, SCR-A02, SCR-C01-2, SCR-C02, SCR-C03-2 |
| 7 | SCR-E01 に REQ 参照なし | REQ-G01 or REQ-E01 の明示が必要 |
| 8 | SCR-A03 に REQ 参照なし | REQ-A03（ロール管理）ではなく監査ログ用 REQ の明示が必要 |
| 9 | REQ-A03 に SCR-A03 未記載 | REQ 側 Related 欄の更新漏れ |
| 10 | REQ-B01〜B03 の Related と実際の SCR 番号の不一致 | 古い命名規則が残っている |

### 未実装（将来機能として妥当）

| SCR | 機能 | 優先度 | 判断 |
|---|---|---|---|
| SCR-D03 | 経費集計 | Should | ✅ Phase 2 以降で対応予定 |
| SCR-E02 | 請求書編集 | Should | ✅ Phase 2 以降で対応予定 |
| SCR-F01 | ドキュメント管理 | Could | ✅ 将来検討 |
| SCR-G02 | 全文検索 | Could | ✅ 将来検討 |

---

## 7. 推奨アクション

1. **SCR-E01 番号の再整理**: 通知機能を SCR-G01（もしくは新番号）に変更し、SCR-E01 を請求機能用に確保
2. **SCR-A03 の再整理**: 画面一覧で SCR-A03 を「監査ログビューア」に更新するか、新番号（例: SCR-A04）を割り当て。ロール管理は SCR-A02 に統合されている旨を明記
3. **SCR-D02 の spec 作成**: 実装済みの経費登録画面（`expenses/new/page.tsx`）の spec を作成
4. **RLS 定義の追加**: `project_members` / `tasks` テーブルの RLS ポリシーを detail/rls/index.md に追加
5. **SCR → API 参照の追加**: SCR-A01, SCR-A02, SCR-C01-2, SCR-C02, SCR-C03-2 の Related 欄に対応 API を追記
6. **REQ Related 欄の更新**: REQ-A03 に SCR 参照追加、REQ-B01〜B03 の Related 欄を最終 SCR 番号に更新
