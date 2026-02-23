---
title: SPEC-API-A02 ユーザー招待/管理
description: ユーザーの招待・ロール変更・無効化の仕様
---

## 目的 / In-Out / Related
- **目的**: テナント内ユーザーの招待・管理操作の仕様を定める
- **対象範囲（In/Out）**: 招待、ロール変更、有効/無効化、一覧取得
- **Related**: REQ-A02 / [SCR-A02 ユーザー管理](../../spec/screens/scr-a02/) / DD-DB-002 user_roles / [ADR-0001 RBAC](../../adr/adr-0001/)

---

## ユーザー一覧取得（Server Component）

### API情報
- **API ID**: SPEC-API-A02-LIST
- **用途**: ユーザー管理画面のテーブルデータ
- **種別**: Server Component 内の直接クエリ

### Request（クエリ条件）
- **フィルタ**: role（enum[]）、status（`active`/`invited`/`disabled`）
- **検索**: name / email の部分一致
- **ソート**: name ASC（デフォルト）、last_sign_in_at DESC
- **ページネーション**: page、per_page（デフォルト25）

### Response
- 200: `{ data: TenantUser[], count: number }`
  ```typescript
  type TenantUser = {
    id: string;
    email: string;
    name: string | null;
    roles: string[];           // ["pm", "approver"]
    status: "active" | "invited" | "disabled";
    last_sign_in_at: string | null;
    created_at: string;
  };
  ```

### RLS制御
- Tenant Admin / IT Admin のみアクセス可
- テナント分離: `user_roles.tenant_id` でフィルタ

---

## ユーザー招待（Server Action）

### API情報
- **API ID**: SPEC-API-A02-INVITE
- **種別**: Server Action

### Request
```typescript
type InviteUserInput = {
  email: string;             // 必須, メール形式
  roles: string[];           // 必須, 1つ以上
};
```

### 処理フロー
1. メール重複チェック（テナント内）
2. `supabase.auth.admin.inviteUserByEmail(email)` — Supabase Auth で招待メール送信
3. `user_roles` に指定ロールを INSERT
4. 招待メールにテナント名・招待者名を含める

### バリデーション
| ルール | エラーメッセージ |
|---|---|
| email が不正 | 有効なメールアドレスを入力してください |
| email がテナント内で既存 | このメールアドレスは既に登録されています |
| roles に `it_admin` を含む | IT Admin ロールはこの画面から付与できません |
| テナントのメンバー上限到達 | メンバー数の上限に達しています |

### Response
- 201: `{ data: TenantUser }`
- 400: バリデーションエラー
- 403: 権限なし

### 権限
| ロール | 許可 |
|---|---|
| Tenant Admin | ✅（`it_admin` 付与は不可） |
| IT Admin | ✅（全ロール付与可） |
| その他 | ❌ |

### 監査ログ
- action: `user.invite`
- metadata: `{ email, roles }`

---

## ロール変更（Server Action）

### API情報
- **API ID**: SPEC-API-A02-ROLE
- **種別**: Server Action

### Request
```typescript
type ChangeRoleInput = {
  user_id: string;
  roles: string[];           // 新しいロール一覧（全量置換）
};
```

### バリデーション
| ルール | エラーメッセージ |
|---|---|
| 自分自身のロール変更 | 自分のロールは変更できません |
| 最後のTenant Admin削除 | テナントには最低1人のTenant Adminが必要です |
| `it_admin` の付与/剥奪（Tenant Adminが実行） | IT Admin ロールの変更権限がありません |
| roles が空配列 | 最低1つのロールを指定してください |

### Response
- 200: `{ data: TenantUser }`
- 400 / 403

### 監査ログ
- action: `user.role_change`
- before/after: `{ roles: ["member"] }` → `{ roles: ["member", "approver"] }`
- **重要度: 最高**（DBトリガ対象）

---

## 無効化/再有効化（Server Action）

### API情報
- **API ID**: SPEC-API-A02-STATUS
- **種別**: Server Action

### Request
```typescript
type ChangeUserStatusInput = {
  user_id: string;
  action: "disable" | "enable";
};
```

### 処理フロー
#### 無効化
1. `supabase.auth.admin.updateUserById(user_id, { banned: true })`
2. 既存セッションを無効化（次回リクエスト時にログアウト）

#### 再有効化
1. `supabase.auth.admin.updateUserById(user_id, { banned: false })`

### バリデーション
| ルール | エラーメッセージ |
|---|---|
| 自分自身を無効化 | 自分のアカウントは無効化できません |
| 最後のTenant Adminを無効化 | テナントには最低1人の有効なTenant Adminが必要です |

### 監査ログ
- action: `user.deactivate` / `user.reactivate`
- **重要度: 高**

---

## パスワードリセット（Server Action）

### API情報
- **API ID**: SPEC-API-A02-RESET
- **種別**: Server Action

### Request
```typescript
type ResetPasswordInput = {
  user_id: string;
};
```

### 処理
1. `supabase.auth.admin.generateLink({ type: 'recovery', email })` でリセットリンク生成
2. ユーザーにメール送信

### 権限
| ロール | 許可 |
|---|---|
| Tenant Admin / IT Admin | ✅ |

### 監査ログ
- action: `user.password_reset`
