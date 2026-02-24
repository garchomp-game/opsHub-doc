---
title: "FIX-B: 仕様書更新"
---

## 概要

監査で検出された仕様書の古い記載を、実装に合わせて 4 件修正した。

---

## 修正一覧

### 修正1: SCR-B01 タブ構成 → 別ページ構成

**ファイル**: [SCR-B01.md](file:///home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/screens/SCR-B01.md)

| 項目 | Before | After |
|---|---|---|
| UI構成 | 「自分の申請」/「承認待ち」をタブで切替 | 別ページに分離 |
| URL | `/workflows` のみ | `/workflows`（自分の申請）+ `/workflows/pending`（承認待ち） |
| フィルタ条件 | 記載なし | `/workflows`: `created_by = user.id` / `/workflows/pending`: `approver_id = user.id AND status = 'submitted'` |
| 遷移方法 | タブ切替 | サイドバーから遷移 |

---

### 修正2: SCR-C03-1 URL 修正

**ファイル**: [SCR-C03-1.md](file:///home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/screens/SCR-C03-1.md)

```diff
-- **URL**: `/timesheet`
+- **URL**: `/timesheets`
```

---

### 修正3: SCR-002 通知リンクルール修正

**ファイル**: [SCR-002.md](file:///home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/screens/SCR-002.md)

SCR-E01 の定義に統一:

| resource_type | Before | After |
|---|---|---|
| `workflow` | `/workflows/{id}` | `/workflows/{resource_id}` |
| `project` | `/projects/{id}` | `/projects/{resource_id}` |
| `task` | `/tasks/{id}` | `/projects`（個別タスクURLなし） |
| `expense` | `/expenses/{id}` | `/expenses`（個別経費URLなし） |
| `null` | 記載なし | リンクなし |

---

### 修正4: API-C03-2 CSV エクスポート未実装の注記

**ファイル**: [API-C03-2.md](file:///home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/apis/API-C03-2.md)

CSV出力（Route Handler）セクションに **Phase 2 で実装予定** の警告注記を追加。

---

## 検証結果

| ステップ | 結果 |
|---|---|
| `npm run build`（content sync） | ✅ 正常完了 |
| `npm run build`（vite build） | ✅ 正常完了 |
| `npm run build`（SSG generation） | ⚠️ `renderers.mjs` エラー（**既知の既存問題**、今回の修正とは無関係） |
