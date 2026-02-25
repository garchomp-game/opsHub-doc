---
title: "R11-1: 経費集計 + CSVエクスポートのレビュー"
description: "REQ-D02 経費集計画面とCSVエクスポートの実装レビュー"
---

あなたは OpsHub のコードレビュアーです。以下の実装をレビューしてください。

## レビュー対象

### 経費集計（R9-2）
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/expenses/summary/_actions.ts
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/expenses/summary/page.tsx
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/expenses/summary/_components/ExpenseSummaryClient.tsx

### CSVエクスポート（R9-3）
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/api/timesheets/export/route.ts

## 仕様書
- SCR-D03: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/screens/SCR-D03.md
- API-D02: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/apis/API-D02.md
- API-C03-2: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/apis/API-C03-2.md

## レビュー観点

参照: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/plans/review-template.md

### 機能チェック
- [ ] 権限チェック（requireRole / hasRole）が仕様通りか
- [ ] フィルタ条件（期間、カテゴリ、PJ、ステータス）が仕様通りか
- [ ] 集計ロジック（SUM/COUNT/AVG/MAX）が正しいか
- [ ] CSV の BOM、エスケープ、Content-Type が正しいか

### 共通基盤チェック
- [ ] `withAuth` / `requireAuth` パターン使用
- [ ] `writeAuditLog` 呼び出し（必要箇所のみ）
- [ ] Supabase クエリに `tenant_id` フィルタあり
- [ ] `revalidatePath` 呼び出し（更新系のみ）

### コード品質
- [ ] 型安全性（`as` キャストの乱用なし）
- [ ] エラーハンドリング適切
- [ ] 未使用 import なし

## 修正が必要な場合

発見した問題は **その場で修正** してください。

## 検証

```bash
cd /home/garchomp-game/workspace/starlight-test/OpsHub && npm run build
```

## ウォークスルー出力先

/home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/r11-1-review-expense-csv.md
