---
title: "R11-2: 請求機能のレビュー"
description: "REQ-E01 請求一覧・詳細/編集・PDF出力の実装レビュー"
---

あなたは OpsHub のコードレビュアーです。以下の実装をレビューしてください。

## レビュー対象

### 請求一覧（R10-1）
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/invoices/_constants.ts
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/invoices/_actions.ts
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/invoices/_components/InvoiceListClient.tsx
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/invoices/page.tsx

### 請求書詳細/編集（R10-2）
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/invoices/new/page.tsx
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/invoices/[id]/page.tsx
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/invoices/_components/InvoiceForm.tsx

### 印刷（R10-2）
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/invoices/[id]/_components/InvoicePrintView.tsx

### マイグレーション（R9-1）
- /home/garchomp-game/workspace/starlight-test/OpsHub/supabase/migrations/20260224090000_invoices.sql

## 仕様書
- SCR-H01: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/screens/SCR-H01.md
- SCR-H02: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/screens/SCR-H02.md
- API-H01: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/apis/API-H01.md

## レビュー観点

### 機能チェック
- [ ] CRUD 操作が仕様通りか
- [ ] ステータス遷移ルール（draft→sent→paid, draft/sent→cancelled）が正しいか
- [ ] 請求書番号の採番（next_invoice_number RPC）が正しいか
- [ ] 明細の合計計算（小計、税額、合計）が正しいか
- [ ] PDF 出力レイアウトが妥当か
- [ ] RLS ポリシーが設計書通りか
- [ ] 権限チェック（Accounting/TenantAdmin: 全操作、PM: 自PJ閲覧のみ）

### 共通基盤チェック
- [ ] `withAuth` パターン使用
- [ ] `writeAuditLog` 呼び出し（create, update, status_change, delete）
- [ ] `revalidatePath` 呼び出し
- [ ] profiles JOIN（作成者名表示）
- [ ] `createNotification`（請求書作成時の通知 — 不要であればスキップ）

### コード品質
- [ ] 型安全性
- [ ] `ON DELETE CASCADE` の動作確認
- [ ] エラーハンドリング

## 修正が必要な場合

発見した問題は **その場で修正** してください。

## 検証

```bash
cd /home/garchomp-game/workspace/starlight-test/OpsHub && npm run build
```

## ウォークスルー出力先

/home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/r11-2-review-invoices.md
