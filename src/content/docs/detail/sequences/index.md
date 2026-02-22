---
title: 状態遷移/シーケンス
description: 主要ドメインの状態遷移とシーケンス図
---

## 目的 / In-Out / Related
- **目的**: 複雑な状態遷移とコンポーネント間のやり取りを可視化する
- **対象範囲（In）**: ワークフロー状態遷移、主要操作のシーケンス
- **対象範囲（Out）**: 全画面のシーケンス（過剰にしない）
- **Related**: [API-B03](../../spec/apis/API-B03/) / [DB設計](../db/) / [モジュール設計](../modules/)

---

## ワークフロー状態遷移

```mermaid
stateDiagram-v2
    [*] --> draft : 作成（REQ-B01）

    draft --> submitted : 送信
    draft --> draft : 編集・保存

    submitted --> approved : 承認（REQ-B02）
    submitted --> rejected : 差戻し（REQ-B02）
    submitted --> withdrawn : 取下げ

    rejected --> submitted : 再申請
    rejected --> withdrawn : 取下げ

    approved --> [*]
    withdrawn --> [*]
```

### 状態遷移ルール

| 現在 | 次 | 操作者 | 条件 |
|---|---|---|---|
| — | draft | 申請者 | — |
| draft | submitted | 申請者 | 必須項目が入力済み |
| draft | draft | 申請者 | 何度でも編集可能 |
| submitted | approved | 承認者 | approver_id = 自分 |
| submitted | rejected | 承認者 | 理由必須 |
| submitted | withdrawn | 申請者 | — |
| rejected | submitted | 申請者 | 修正後に再送信 |
| rejected | withdrawn | 申請者 | — |

---

## プロジェクト状態遷移

```mermaid
stateDiagram-v2
    [*] --> planning : 作成（REQ-C01）
    planning --> active : 開始
    active --> completed : 完了
    active --> cancelled : 中止
    planning --> cancelled : 中止
    completed --> [*]
    cancelled --> [*]
```

---

## シーケンス: 申請→承認フロー

```mermaid
sequenceDiagram
    actor M as Member
    participant UI as 申請作成画面
    participant SA as Server Action
    participant DB as PostgreSQL
    participant N as 通知

    M->>UI: フォーム入力
    UI->>SA: submitWorkflow(formData)
    SA->>SA: バリデーション
    SA->>SA: requireRole(["member","pm","accounting"])
    SA->>DB: INSERT workflows (status=submitted)
    DB-->>SA: Workflow レコード
    SA->>DB: INSERT audit_logs (workflow.submit)
    SA->>N: 承認者に通知作成
    SA-->>UI: { success: true }
    UI-->>M: トースト + 一覧へ遷移

    actor A as Approver
    participant UI2 as 申請詳細画面
    participant SA2 as Server Action

    A->>UI2: 申請を開く
    UI2->>DB: SELECT workflow WHERE id=xxx
    DB-->>UI2: Workflow データ
    A->>UI2: 「承認」ボタン押下
    UI2->>SA2: approveWorkflow(id)
    SA2->>SA2: requireRole(["approver"])
    SA2->>SA2: approver_id = auth.uid() 検証
    SA2->>DB: UPDATE workflows SET status=approved
    SA2->>DB: INSERT audit_logs (workflow.approve)
    SA2->>N: 申請者に通知作成
    SA2-->>UI2: { success: true }
    UI2-->>A: トースト + 一覧へ遷移
```

## シーケンス: 工数入力

```mermaid
sequenceDiagram
    actor M as Member
    participant UI as 工数入力画面
    participant SA as Server Action
    participant DB as PostgreSQL

    M->>UI: 週表示（GET）
    UI->>DB: SELECT timesheets WHERE user_id=me AND week=current
    DB-->>UI: 既存工数データ
    UI-->>M: グリッド表示

    M->>UI: セル編集 + 保存
    UI->>SA: upsertTimesheet(entries[])
    SA->>SA: バリデーション（0-24h、0.25h単位）
    SA->>DB: UPSERT timesheets (ON CONFLICT UPDATE)
    SA->>DB: INSERT audit_logs (timesheet.update)
    SA-->>UI: { success: true }
    UI-->>M: トースト「保存しました」
```

---

## 未決事項
- 多段階承認（将来対応）の状態遷移への影響
- 通知配信のリアルタイム性（Supabase Realtime vs ポーリング）
