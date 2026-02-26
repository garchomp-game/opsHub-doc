---
title: "R22-2: Form.useForm() 未接続警告の調査・修正"
description: "Ant Design の useForm が Form 要素に接続されていない警告を全件解消"
---

あなたは OpsHub のフロントエンドエンジニアです。
ブラウザコンソールに以下の Ant Design 警告が表示されます:

```
Warning: Instance created by `useForm` is not connected to any Form element. Forget to pass `form` prop?
```

## プロジェクトパス

- OpsHub: `/home/garchomp-game/workspace/starlight-test/OpsHub`

## 問題の説明

`Form.useForm()` で取得したフォームインスタンスが、対応する `<Form form={form}>` に接続されていない場合にこの警告が出ます。主な原因:

1. `useForm()` で作成したインスタンスを `<Form form={...}>` に渡し忘れ
2. 条件分岐により `<Form>` がレンダリングされていないのに `form.setFieldsValue()` 等を呼んでいる
3. Modal内のFormで、Modal が閉じている（DOMにない）状態で `form.resetFields()` を呼んでいる

## 対象ファイル

以下の10ファイルで `Form.useForm()` が使われています。全てを確認してください:

1. `src/app/(authenticated)/admin/tenant/_components/TenantManagement.tsx` (2つ: basicForm, settingsForm)
2. `src/app/(authenticated)/invoices/_components/InvoiceForm.tsx` (form)
3. `src/app/(authenticated)/admin/users/_components/InviteModal.tsx` (form)
4. `src/app/(authenticated)/workflows/[id]/_components/WorkflowDetailClient.tsx` (form)
5. `src/app/(authenticated)/projects/new/page.tsx` (form)
6. `src/app/(authenticated)/workflows/new/page.tsx` (form)
7. `src/app/(authenticated)/expenses/new/page.tsx` (form)
8. `src/app/(authenticated)/projects/[id]/tasks/_components/KanbanBoard.tsx` (2つ: createForm, editForm)

## 調査・修正手順

各ファイルで以下を確認:

1. **`<Form form={formInstance}>` が正しく設定されているか**
   - `form` prop が渡されていなければ追加
2. **条件付きレンダリングの確認**
   - Modal 内の Form の場合、Modal が `destroyOnHidden` (旧 `destroyOnClose`) の場合には、
     Modal が閉じている間は `form` メソッドを呼ばないようにする
3. **`TenantManagement.tsx`の Tabs ケース**
   - `basicForm` と `settingsForm` が Tabs 内で使われている場合、
     非アクティブタブの Form は DOM にないため `setFieldsValue` でこの警告が出る可能性がある
   - 対策: `Tabs` の `destroyInactiveTabPane={false}` を設定するか、
     `form.setFieldsValue` を Form レンダリング後に呼ぶ

## 検証手順

1. `npm run build` — 成功
2. 対象の全画面をブラウザで開き、コンソールに `useForm` 関連の Warning が表示されないこと
3. `npm run test:e2e` — 全テスト PASSED

## ウォークスルー出力先

/home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/r22-2-useform-audit.md
