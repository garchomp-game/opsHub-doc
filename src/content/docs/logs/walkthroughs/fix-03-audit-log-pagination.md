---
title: "監査ログビューア改修 — Walkthrough"
---

# 監査ログビューア改修 — Walkthrough

## 変更概要

レビュー指摘 #3（knowledge.md 即時対応）を対応。`.limit(100)` + クライアントサイドフィルタを廃止し、サーバーサイドフィルタ＋ページネーションに改修。

## 変更ファイル

| ファイル | 変更 | 概要 |
|---|---|---|
| [_actions.ts](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/audit-logs/_actions.ts) | **NEW** | `fetchAuditLogs` / `fetchFilterOptions` Server Actions |
| [page.tsx](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/audit-logs/page.tsx) | MODIFY | 初期データ取得を Server Action 経由に変更 |
| [AuditLogViewer.tsx](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/audit-logs/_components/AuditLogViewer.tsx) | MODIFY | クライアントフィルタ撤去、サーバー側取得に切替 |

## 主な設計判断

- **`select("*", { count: "exact" })`** で総件数を1クエリで取得（Supabase の count ヘッダー機能）
- **`useTransition`** でフィルタ/ページ変更中のローディング状態を管理、Table の `loading` prop に反映
- **アクション種別・リソース種別は定数リスト**を使用（全件スキャンの DISTINCT を回避）
- フィルタ変更時は必ず **page=1 にリセット**

## ビルド検証

```
✓ Compiled successfully in 13.3s
✓ Generating static pages (16/16) in 649.7ms
Exit code: 0
```

型エラー・コンパイルエラー: **0件** ✅
