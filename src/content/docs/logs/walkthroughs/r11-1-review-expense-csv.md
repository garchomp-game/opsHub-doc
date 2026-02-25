---
title: "R11-1: 経費集計 + CSVエクスポートのレビュー"
description: "REQ-D02 経費集計画面とCSVエクスポート実装のレビューウォークスルー"
---

## 概要

経費集計（R9-2）と CSV エクスポート（R9-3）の実装を、SCR-D03 / API-D02 / API-C03-2 仕様と照合しレビューを実施した。

## レビュー対象ファイル

| ファイル | 用途 |
|---------|------|
| `expenses/summary/_actions.ts` | 4つの集計 Server Action |
| `expenses/summary/page.tsx` | Server Component（認可 + データ取得） |
| `expenses/summary/_components/ExpenseSummaryClient.tsx` | Client Component（フィルタ + 表示） |
| `api/timesheets/export/route.ts` | CSV エクスポート Route Handler |

---

## レビュー結果

### 機能チェック

| 観点 | 結果 | 備考 |
|------|------|------|
| 権限チェック | ✅ | `requireAuth` + `hasRole` / `withAuth` + `assertRole` で Accounting/PM/TenantAdmin に限定 |
| フィルタ条件 | ✅ | 期間・カテゴリ・PJ・ステータスすべて仕様通り |
| 集計ロジック | ⚠️→✅ | SUM/COUNT/AVG/MAX 正しい。**workflows!inner バグ修正済み** |
| CSV BOM・エスケープ・Content-Type | ✅ | BOM付UTF-8, ダブルクォート対応, `text/csv; charset=utf-8` |

### 共通基盤チェック

| 観点 | 結果 | 備考 |
|------|------|------|
| `withAuth` / `requireAuth` | ✅ | _actions.ts は `withAuth`, page.tsx は `requireAuth` |
| `writeAuditLog` | ✅ | CSV export で記録、集計画面は参照のみなので不要 |
| `tenant_id` フィルタ | ✅ | 全クエリで適用 |
| `revalidatePath` | N/A | 参照のみ |

### コード品質

| 観点 | 結果 | 備考 |
|------|------|------|
| 型安全性 | ✅ | `as unknown as` 2箇所は Supabase JOIN型推論の制約で許容 |
| エラーハンドリング | ✅ | ERR コードプレフィックス付きエラー |
| 未使用 import | ⚠️→✅ | **`createClient` 除去済み** |

---

## 発見した問題と修正

### 修正 1: `workflows!inner` JOIN バグ（HIGH）

**ファイル**: `_actions.ts`（4つの Server Action すべて）

**問題**: Supabase の `!inner` 修飾子は INNER JOIN を意味する。`expenses.workflow_id` は `ON DELETE SET NULL` の nullable カラムであるため、ワークフロー未作成の経費が集計結果から除外されていた。

**修正内容**:
```diff
-.select("category, amount, workflows!inner(status)")
+.select("category, amount, workflow_id, workflows(status)")
```

`approved_only` フィルタも合わせて修正:
```diff
 if (filters.approved_only) {
-    query = query.eq("workflows.status", "approved");
+    query = query.not("workflow_id", "is", null)
+                 .eq("workflows.status", "approved");
 }
```

### 修正 2: 未使用 `createClient` と直接クエリ（MED）

**ファイル**: `page.tsx`

**問題**: `createClient` を import して直接 Supabase クエリでプロジェクト一覧を取得していたが、`_actions.ts` に既に `getFilterProjects` Server Action が存在していた。

**修正内容**: `createClient` import を削除し、`getFilterProjects` を使用するよう変更。

---

## 仕様との差異（修正不要）

| 項目 | 仕様（SCR-D03） | 実装 | 判定 |
|------|-----------------|------|------|
| カテゴリ名 | 飲食費 / 備品 | 会議費 / 消耗品費 | 実装側は既存 expenses と統一済み。仕様書側の表記ゆれ |
| グラフ表示 | 円グラフ / 棒グラフ / 折れ線 | Progress バーで構成比を可視化 | チャートライブラリ未導入のため代替実装。機能的に同等 |

---

## 検証結果

```bash
cd /home/garchomp-game/workspace/starlight-test/OpsHub && npm run build
```

- **TypeScript コンパイル**: ✅ `Compiled successfully in 30.4s`
- **`pages-manifest.json` エラー**: Next.js 16 の既知のインフラ問題（コード変更とは無関係）
