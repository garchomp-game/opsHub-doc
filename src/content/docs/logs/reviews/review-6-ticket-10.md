---
title: "TICKET-10 経費管理 コードレビュー結果"
---

# TICKET-10 経費管理 コードレビュー結果

## レビュー対象ファイル

| ファイル | 種類 |
|---|---|
| [_actions.ts](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/expenses/_actions.ts) | Server Actions |
| [page.tsx](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/expenses/page.tsx) | 一覧ページ (Server Component) |
| [new/page.tsx](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/expenses/new/page.tsx) | 作成ページ (Client Component) |

> [!NOTE]
> `_components/` や `[id]/` ディレクトリは存在しませんでした。

---

## ✅ 合格項目

### 機能要件
| # | チェック | 結果 |
|---|---|---|
| 1 | 経費一覧: 自分の経費のみ表示 (`created_by = auth.uid()`) | ✅ `_actions.ts` L163, `page.tsx` L49 で `!isAdmin` 時にフィルタ |
| 2 | Accounting / Tenant Admin は全件閲覧可能 | ✅ `hasRole(user, tenantId, ["accounting", "tenant_admin"])` で判定 |
| 3 | 経費作成フォーム: 必須項目の入力 | ✅ category, amount, expense_date, project_id, approver_id |
| 5 | ワークフロー連動 | ✅ `createExpense` で `workflows` テーブルに `type=expense` を自動作成し `expenses.workflow_id` に紐付け |

### 共通インフラ
| # | チェック | 結果 |
|---|---|---|
| 7 | `withAuth()` ラッパー使用 | ✅ 全4 Server Action で使用 |
| 8 | `writeAuditLog()` で監査ログ記録 | ✅ `createExpense` で記録（action: `expense.create` / `expense.submit`） |
| 9 | `hasRole()` で権限判定 | ✅ `_actions.ts` L151, L198 / `page.tsx` L36 |
| 15 | `ActionResult<T>` レスポンス | ✅ `withAuth()` が自動的にラップ |

### コード品質
| # | チェック | 結果 |
|---|---|---|
| 12 | Server/Client Component 分離 | ✅ 一覧=Server Component, 作成=Client Component |
| 13 | `any` の使用 | ✅ なし（`Record<string, unknown>` / `unknown` を適切に使用） |
| 14 | Ant Design コンポーネント | ✅ Table, Form, InputNumber, Select, DatePicker, Card, Tag, Button, Space |

### セキュリティ
| # | チェック | 結果 |
|---|---|---|
| 16 | `created_by` をサーバー側で強制 | ✅ `_actions.ts` L99, L119 で `user.id` を使用 |
| 17 | `tenant_id` の検証 | ✅ `user.tenantIds[0]` からサーバー側で取得 + プロジェクト存在確認時に `tenant_id` 検証 |

---

## ❌ 重大な問題（修正済み）

### 1. カテゴリ不足（「会議費」「通信費」の欠落）

レビュープロンプト指定のカテゴリ6種に対し、実装は4種のみでした。

```diff
-const EXPENSE_CATEGORIES = ["交通費", "宿泊費", "消耗品費", "その他"] as const;
+const EXPENSE_CATEGORIES = ["交通費", "宿泊費", "会議費", "消耗品費", "通信費", "その他"] as const;
```

**修正範囲**: `_actions.ts`, `page.tsx`（色マップ・フィルタ）, `new/page.tsx`（Select・型アサーション）の3ファイル

---

## ⚠️ 軽微な指摘（修正済み）

### 2. 金額の上限チェック未実装

下限（0超）のみで上限がありませんでした。10,000,000円の上限を追加。

```diff
 if (!input.amount || input.amount <= 0) {
     throw new Error("ERR-VAL-002: 金額は1円以上で入力してください");
 }
+if (input.amount > 10_000_000) {
+    throw new Error("ERR-VAL-002: 金額は10,000,000円以下で入力してください");
+}
```

### 3. 申請者名が表示されない（profiles JOIN 未実装）

一覧・詳細クエリに `profiles` JOIN がなく、申請者がUUID表示になる問題を修正。

```diff
 .select(`
     *,
     projects ( id, name ),
-    workflows ( id, status, workflow_number )
+    workflows ( id, status, workflow_number ),
+    profiles!expenses_created_by_fkey ( display_name )
 `)
```

一覧テーブルに「申請者」列も追加しました。

---

## ⚠️ 軽微な指摘（未修正 — 今後の改善候補）

### 4. プロジェクト別経費集計が未実装
チェックポイント #6 の「プロジェクト別経費集計」は未実装です。Public Docs には「プロジェクト詳細の経費タブ」と記載されており、`/projects/[id]` ページに経費タブを追加する形が望ましいです。

### 5. RLS ドキュメントに expenses ポリシーの定義なし
RLS設計ドキュメントに `expenses` テーブルのポリシーが未定義です。DB側でRLSが有効になっているか確認が必要です。アプリ層では `hasRole()` で出し分けしていますが、DB層のRLS設定も追加すべきです。

### 6. `ROLE_LABELS` のローカル定義
`new/page.tsx` L35-39 で `ROLE_LABELS` をローカルに定義しています。FIX-06 で `types/index.ts` に集約済みの共通定数をインポートすべきです。ただし、この定義は承認者ロールのラベルのみ（`approver`, `accounting`, `tenant_admin`）で差分があるため、影響は軽微です。

### 7. `database.ts` の expenses 型未使用
`_actions.ts` でローカルに `CreateExpenseInput` 型を定義しています。`src/types/database.ts` の `TablesInsert<"expenses">` を使うとDB変更に追従しやすくなります。

### 8. Public Docs にもカテゴリ追加が必要
Public Docs の経費ガイドにも「会議費」「通信費」が記載されていません。ドキュメントの更新を推奨します。

---

## ビルド検証

```
✓ Compiled successfully
✓ TypeScript — 型エラー 0 件
✓ Exit code: 0
```

---

## 修正ファイルサマリ

| ファイル | 修正内容 |
|---|---|
| [_actions.ts](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/expenses/_actions.ts) | 6カテゴリ追加、金額上限バリデーション、profiles JOIN |
| [page.tsx](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/expenses/page.tsx) | カテゴリ色マップ・フィルタ更新、申請者列追加 |
| [new/page.tsx](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/expenses/new/page.tsx) | カテゴリ2種追加、型アサーション更新 |
