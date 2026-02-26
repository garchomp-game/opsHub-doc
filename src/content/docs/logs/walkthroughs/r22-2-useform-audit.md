---
title: "R22-2: Form.useForm() 未接続警告の全件修正"
---

# R22-2: Form.useForm() 未接続警告の全件修正

## 概要

Ant Design の `useForm` インスタンスが `<Form>` 要素に接続されていない警告を全件調査・修正した。

## 調査結果

8ファイル/10インスタンスを調査し、4ファイルに問題を発見、修正した。

| # | ファイル | useForm | 結果 |
|---|---------|---------|------|
| 1 | `TenantManagement.tsx` | `basicForm`, `settingsForm` | **修正** |
| 2 | `InvoiceForm.tsx` | `form` | 問題なし |
| 3 | `InviteModal.tsx` | `form` | **修正** |
| 4 | `WorkflowDetailClient.tsx` | `form` | **修正** |
| 5 | `projects/new/page.tsx` | `form` | 問題なし |
| 6 | `workflows/new/page.tsx` | `form` | 問題なし |
| 7 | `expenses/new/page.tsx` | `form` | 問題なし |
| 8 | `KanbanBoard.tsx` | `createForm`, `editForm` | **修正** |

## 修正内容

### 1. TenantManagement.tsx — Tabs 非アクティブタブの DOM 破棄

`Tabs` はデフォルトで非アクティブなタブの DOM を破棄する。`fetchTenant()` が両タブの `setFieldsValue()` を同時に呼ぶため、非アクティブ側で警告が出ていた。

```diff
-<Tabs items={tabItems} />
+<Tabs items={tabItems} destroyInactiveTabPane={false} />
```

### 2. InviteModal.tsx — destroyOnHidden による Form 破棄

`destroyOnHidden` (旧 `destroyOnClose`) が有効な場合、Modal が閉じると Form の DOM が破棄され `form.resetFields()` が無効になる。

```diff
-destroyOnHidden
+destroyOnHidden={false}
```

### 3. WorkflowDetailClient.tsx — 条件付きレンダリング

`useForm()` はコンポーネントトップで呼ばれるが `<Form form={form}>` は `isEditing=true` 時のみレンダリングされていた。`form` propを外部で使用していないため、 `useForm()` 自体を削除し、Form に内部管理させた。

```diff
-const [form] = Form.useForm();
 ...
-<Form form={form} layout="vertical" ...>
+<Form layout="vertical" ...>
```

### 4. KanbanBoard.tsx — Modal 内 Form の先行マウント

`createForm` / `editForm` の `setFieldsValue()` や `resetFields()` が Modal 非表示時に呼ばれていた。両 Modal に `forceRender` を追加して Form を常時 DOM に保持。

```diff
 <Modal title="新規タスク作成" open={createModalOpen}
+    forceRender
     onCancel={...}>
 ...
 <Modal title="タスク編集" open={!!editingTask}
+    forceRender
     onCancel={...}>
```

## 検証結果

| チェック | 結果 |
|---------|------|
| `npx tsc --noEmit` | ✅ PASS (exit 0) |
| `npm run build` | ✅ PASS (24/24 routes) |
