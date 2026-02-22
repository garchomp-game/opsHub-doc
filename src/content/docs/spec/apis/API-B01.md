---
title: SPEC-API-B01 申請一覧取得
description: ワークフロー申請一覧のデータ取得仕様
---

## 目的 / In-Out / Related
- **目的**: 申請一覧画面に表示するデータの取得仕様
- **対象範囲（In/Out）**: クエリ条件、レスポンス形式、RLS制御
- **Related**: REQ-B03 / SPEC-SCR-B01 / DD-DB-workflows

## API情報
- **API ID**: SPEC-API-B01
- **用途**: 申請一覧の取得（Server Component でのデータフェッチ）
- **認可**: ログイン必須。RLS でテナント + ロールに応じた絞り込み
- **種別**: Server Component 内の直接クエリ

## Request（クエリ条件）
- **フィルタ**: status（enum）、type（enum）、date_from/date_to（ISO8601）
- **ソート**: created_at DESC（デフォルト）
- **ページネーション**: page（1始まり）、per_page（デフォルト20、最大100）
- **タブ切替**: `mode=mine`（自分の申請）/ `mode=pending`（承認待ち）

## Response
- 200: `{ data: Workflow[], count: number }`
  ```typescript
  type Workflow = {
    id: string;
    workflow_number: string; // 表示用番号
    type: "expense" | "leave" | "purchase" | "other";
    title: string;
    status: "draft" | "submitted" | "approved" | "rejected" | "withdrawn";
    created_by: { id: string; name: string };
    approver: { id: string; name: string };
    created_at: string;
    updated_at: string;
  };
  ```

## RLS制御
- `mode=mine`: `created_by = auth.uid()` で絞り込み
- `mode=pending`: `approver_id = auth.uid() AND status = 'submitted'`
- テナント分離: 常に `tenant_id` で自動フィルタ

## Related
- REQ-B03 / SPEC-SCR-B01 / DD-DB-workflows
