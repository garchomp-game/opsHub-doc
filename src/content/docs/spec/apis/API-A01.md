---
title: SPEC-API-A01 テナント管理
description: テナント情報の取得・更新・設定変更の仕様
---

## 目的 / In-Out / Related
- **目的**: テナント（組織）情報のCRUD操作仕様を定める
- **対象範囲（In/Out）**: テナント情報の閲覧・更新、設定変更、データエクスポート
- **Related**: REQ-A01 / [SCR-A01 テナント管理](../../spec/screens/scr-a01/) / DD-DB-001 tenants / [ADR-0003 マルチテナント](../../adr/adr-0003/)

---

## テナント情報取得（Server Component）

### API情報
- **API ID**: SPEC-API-A01-DETAIL
- **用途**: テナント管理画面のデータ表示
- **種別**: Server Component 内の直接クエリ
- **認可**: Tenant Admin / IT Admin のみ

### Response
```typescript
type TenantDetail = {
  id: string;
  name: string;
  slug: string;
  settings: TenantSettings;
  created_at: string;
  updated_at: string;
  stats: {
    active_users: number;
    max_users: number;        // プランに応じた上限
    project_count: number;
    monthly_workflows: number;
    storage_used_bytes: number;
    storage_max_bytes: number;
  };
};

type TenantSettings = {
  default_approval_route?: string;
  notification_email?: boolean;
  notification_in_app?: boolean;
  timezone?: string;          // デフォルト 'Asia/Tokyo'
  fiscal_year_start?: number; // 月（1-12）, デフォルト 4
};
```

### RLS制御
- `tenant_id = auth.jwt()->>'tenant_id'` で自テナントのみ
- Tenant Admin / IT Admin のみアクセス可

---

## テナント情報更新（Server Action）

### API情報
- **API ID**: SPEC-API-A01-UPDATE
- **種別**: Server Action

### Request
```typescript
type UpdateTenantInput = {
  name?: string;              // 1〜100文字
  logo_url?: string;          // Supabase Storage パス
  contact_email?: string;     // メール形式
  address?: string;
};
```

### バリデーション
| ルール | エラーメッセージ |
|---|---|
| name が空 | 組織名は必須です |
| name が100文字超過 | 組織名は100文字以内で入力してください |
| contact_email が不正 | 有効なメールアドレスを入力してください |

### 権限
| ロール | 許可 |
|---|---|
| Tenant Admin | ✅ |
| IT Admin | ✅ |
| その他 | ❌ |

### 監査ログ
- action: `tenant.update`

---

## テナント設定変更（Server Action）

### API情報
- **API ID**: SPEC-API-A01-SETTINGS
- **種別**: Server Action

### Request
```typescript
type UpdateTenantSettingsInput = {
  default_approval_route?: string;
  notification_email?: boolean;
  notification_in_app?: boolean;
  timezone?: string;
  fiscal_year_start?: number;
};
```

### バリデーション
| ルール | エラー |
|---|---|
| timezone が不正 | 有効なタイムゾーンを指定してください |
| fiscal_year_start が1〜12の範囲外 | 会計年度の開始月は1〜12で指定してください |

### 権限
- Tenant Admin / IT Admin のみ

### 監査ログ
- action: `tenant.settings_change`
- before/after: 変更前後の settings オブジェクト
- **重要度: 高**

---

## データエクスポート（Route Handler）

### API情報
- **API ID**: SPEC-API-A01-EXPORT
- **用途**: テナント全データのエクスポート（GDPR対応含む）
- **種別**: Route Handler（`POST /api/tenant/export`）
  - ※ 大量データ処理 + ファイルダウンロードのため例外的に Route Handler

### Request
```typescript
type ExportTenantInput = {
  format: "json" | "csv";
  include: ("users" | "projects" | "workflows" | "timesheets" | "expenses")[];
};
```

### 処理
1. バックグラウンドジョブとして非同期実行
2. Supabase Storage に一時ファイルとして保存
3. 完了時に通知 + ダウンロードリンク送信
4. リンクは24時間で失効

### 権限
- Tenant Admin / IT Admin のみ

### 監査ログ
- action: `tenant.export`
- metadata: `{ format, include, row_counts }`
- **重要度: 高**

---

## テナント削除（Server Action）

### API情報
- **API ID**: SPEC-API-A01-DELETE
- **種別**: Server Action

### Request
```typescript
type DeleteTenantInput = {
  tenant_id: string;
  confirmation: string;  // テナント名を入力させて確認
};
```

### 処理フロー
1. `confirmation` がテナント名と一致するか検証
2. 全リソースの論理削除（30日間復元可能）
3. 30日後に物理削除（Cronジョブ）
4. Supabase Auth のユーザーはBan状態に

### バリデーション
| ルール | エラー |
|---|---|
| confirmation がテナント名と不一致 | 確認のためテナント名を正確に入力してください |
| 未済の請求がある | 未決済の請求が残っています。先に精算してください |

### 権限
- **IT Admin のみ**（Tenant Admin は不可）

### 監査ログ
- action: `tenant.delete`
- **重要度: 最高**（別テーブルにも永続化）
