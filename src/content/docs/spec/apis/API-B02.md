---
title: SPEC-API-B02 申請作成/更新
description: ワークフロー申請の作成・下書き保存・送信の Server Action 仕様
---

## 目的 / In-Out / Related
- **目的**: 申請の作成（下書き保存）と送信を処理する
- **対象範囲（In/Out）**: バリデーション、DB操作、通知トリガー、監査ログ
- **Related**: REQ-B01 / SPEC-SCR-B02 / DD-DB-workflows

## API情報
- **API ID**: SPEC-API-B02
- **用途**: 申請作成/更新
- **認可**: Member, PM, Accounting
- **種別**: Server Action

## Request（FormData）
```typescript
{
  type: "expense" | "leave" | "purchase" | "other";  // 必須
  title: string;        // 必須、1-100文字
  description?: string; // 最大2000文字
  amount?: number;      // 経費申請時のみ
  date_from?: string;   // 休暇申請時のみ
  date_to?: string;     // 休暇申請時のみ
  approver_id: string;  // 必須（Approverロールのユーザー）
  attachments?: File[];  // 最大5ファイル、10MB/ファイル
  action: "draft" | "submit";  // 下書き or 送信
}
```

## Response
- 成功: `{ success: true, data: { id: string, workflow_number: string } }`
- 失敗: `{ success: false, error: { code: string, message: string, fields?: Record<string, string> } }`

## 処理フロー
1. **認証確認**: `auth.getUser()` → 未認証なら `ERR-AUTH-001`
2. **バリデーション**: 入力値検証 → 失敗なら `ERR-VAL-xxx`
3. **承認者検証**: approver_id が Approver ロールを持つか確認
4. **ファイルアップロード**: Supabase Storage にアップロード（あれば）
5. **DB操作**: `workflows` テーブルに INSERT / UPDATE
6. **監査ログ**: `audit_logs` に記録
7. **通知**: action=submit の場合、承認者に通知を作成
8. **キャッシュ無効化**: `revalidatePath("/workflows")`

## エラー設計
| コード | 内容 |
|---|---|
| ERR-AUTH-001 | 未認証 |
| ERR-VAL-001 | タイトル未入力 |
| ERR-VAL-002 | 承認者未選択 |
| ERR-VAL-003 | ファイルサイズ超過 |
| ERR-WF-001 | 不正な状態遷移（例: 承認済みの下書き保存） |

## 監査ログポイント
- `workflow.create`: 新規作成時
- `workflow.submit`: 送信時（status: draft → submitted）

## Related
- REQ-B01 / SPEC-SCR-B02 / DD-DB-workflows / SPEC-API-B01
