---
title: "FIX-D: 画面一覧・仕様一覧の更新"
---

## 概要

監査レポート（audit-01, audit-05）で検出された採番不整合と仕様一覧の更新漏れを修正した。

## 修正内容

### 修正1: 画面一覧（requirements/screens/index.md）

| 項目 | 修正前 | 修正後 |
|---|---|---|
| SCR-A03 | ロール管理（`/settings/users/[id]/roles`） | 監査ログビューア（`/admin/audit-logs`）。ロール管理は SCR-A02 に統合 |
| SCR-D02 | 経費申請（`/expenses/new`） | ~~取消~~ → SCR-D01 に統合（画面②として記述） |
| SCR-E01 | 請求一覧 | 請求一覧（将来フェーズ）。通知機能との採番衝突を注記 |
| SCR-G01 | 通知一覧 | 通知一覧 → spec/screens/SCR-E01.md として実装済み（ヘッダー組込 NotificationBell） |
| 未決事項 | 監査ログ閲覧画面の追加 | ~~完了~~ → SCR-A03 として正式登録済み |

### 修正2: 画面仕様一覧（spec/screens/index.md）

「追加画面仕様」セクションを新設し、以下を追加:

- **SCR-A03** 監査ログビューア（`/admin/audit-logs`）
- **SCR-D01** 経費管理（`/expenses`, `/expenses/new`）
- **SCR-E01** 通知システム（ヘッダー組込 NotificationBell）

### 修正3: API仕様一覧（spec/apis/index.md）

「追加 API仕様」セクションを新設し、以下を追加:

- **API-D01** 経費管理（Server Actions）
- **API-E01** 通知API（Server Actions + ヘルパー）

旧 Should/Could セクションの未着手エントリ（API-D01 経費申請、API-E01 請求書管理）を削除。

### 修正4: ADR一覧（adr/index.md）

確認の結果、ADR-0004 / ADR-0005 は既に登録済みのため変更不要。

## 検証

```
cd /home/garchomp-game/workspace/starlight-test/opsHub-doc && npm run build
```

**結果**: ビルド成功（exit code 0）

## 参照

- [audit-01-traceability](/logs/walkthroughs/audit-01-traceability/)
- [audit-05-coverage-gaps](/logs/walkthroughs/audit-05-coverage-gaps/)
