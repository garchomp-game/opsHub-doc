---
title: "R22-1: Ant Design v6 非推奨API全件修正"
description: "destroyOnClose, addonAfter, orientation 等の非推奨プロパティを新APIに置換"
---

あなたは OpsHub のフロントエンドエンジニアです。
Ant Design v6 で非推奨となったプロパティが残っており、ブラウザコンソールに Warning が出力されています。
全ファイルを走査し、非推奨APIを新APIに置換してください。

## プロジェクトパス

- OpsHub: `/home/garchomp-game/workspace/starlight-test/OpsHub`

## 対象（既知）

以下は既に確認済みの非推奨APIです。これら以外にも存在する可能性があるため、全ソースを走査してください。

### 1. `destroyOnClose` → `destroyOnHidden`（Modal）

- `src/app/(authenticated)/admin/users/_components/InviteModal.tsx` (行 69)

### 2. `addonAfter` → `Space.Compact` パターン（InputNumber）

- `src/app/(authenticated)/invoices/_components/InvoiceForm.tsx` (行 490)

`addonAfter` は Ant Design v6 で非推奨です。代替パターン:
```tsx
<Space.Compact>
    <InputNumber value={val} min={0} max={100} onChange={...} />
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0 8px' }}>%</span>
</Space.Compact>
```

### 3. `orientation` → `direction`（Space コンポーネント）

以下のファイルで `<Space orientation="vertical">` を `<Space direction="vertical">` に変更してください:

- `src/app/(authenticated)/search/_components/SearchResultsWrapper.tsx` (行 21)
- `src/app/(authenticated)/search/_components/SearchResultsClient.tsx` (行 111)
- `src/app/(authenticated)/admin/users/_components/UserDetailPanel.tsx` (行 259)
- `src/app/(authenticated)/admin/tenant/_components/TenantManagement.tsx` (行 392)
- `src/app/(authenticated)/_components/DashboardContent.tsx` (行 161, 186)
- `src/app/(authenticated)/projects/[id]/_components/ProjectDetailClient.tsx` (行 370, 381, 392)

### 4. 追加走査

以下のキーワードで全ソースを `grep` し、漏れがないか確認すること:
```bash
grep -rn "destroyOnClose\|addonAfter\|addonBefore\|orientation=" src/
```

Ant Design v6 の Migration Guide を参照し、他にも非推奨APIがあれば修正してください:
- https://ant.design/docs/react/migration-v5

## 検証手順

1. `npm run lint` — 0 errors, 0 warnings
2. `npm run build` — 成功
3. `npm run test:e2e` — 全テスト PASSED
4. 修正した画面をブラウザで開き、コンソールに `[antd:` から始まる Warning が0件であること

## ウォークスルー出力先

/home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/r22-1-antd-deprecations.md
