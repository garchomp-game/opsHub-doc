---
title: "R22-1: Ant Design v6 非推奨API全件修正"
---

## 概要

Ant Design v6 で非推奨となったプロパティを新APIに置換し、ブラウザコンソールの `[antd:` Warning を解消した。

## 変更一覧

### 1. `destroyOnClose` → `destroyOnHidden`（Modal）

| ファイル | 行 | 変更内容 |
|----------|-----|---------|
| `InviteModal.tsx` | 69 | `destroyOnClose` → `destroyOnHidden` |

### 2. `addonAfter` → `Space.Compact` パターン（InputNumber）

| ファイル | 行 | 変更内容 |
|----------|-----|---------|
| `InvoiceForm.tsx` | 485-493 | `addonAfter="%"` → `Space.Compact` + `<span>%</span>` |

### 3. `orientation` → `direction`（Space）

| ファイル | 行 | 変更内容 |
|----------|-----|---------|
| `DashboardContent.tsx` | 161, 186 | `orientation="vertical"` → `direction="vertical"` |
| `TenantManagement.tsx` | 392 | 同上 |
| `UserDetailPanel.tsx` | 259 | 同上 |
| `ProjectDetailClient.tsx` | 370, 381, 392 | 同上 (3箇所) |
| `SearchResultsWrapper.tsx` | 21 | 同上 |
| `SearchResultsClient.tsx` | 111 | 同上 |

**合計: 8ファイル / 11箇所**

### 4. 追加走査結果

以下のキーワードで `grep` した結果、追加の非推奨APIは検出されなかった:

- `addonBefore` — 該当なし
- `dropdownClassName` — 該当なし
- `visible` — 該当なし（既に `open` に移行済み）
- `bordered` (Table/Card/Descriptions) — v6でも有効、変更不要

## 検証結果

| 検証項目 | 結果 |
|----------|------|
| `npm run lint` | ✅ 0 errors, 0 warnings |
| `npm run build` | ✅ 成功 (24ページ生成) |
| `grep` 最終確認 | ✅ 非推奨API 0件 |
| ブラウザコンソール確認 | ⏳ 手動確認が必要 |
