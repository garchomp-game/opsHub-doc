---
title: "INV-06: シードデータ検証 & Auth ログインテスト"
---

# INV-06: シードデータ検証 & Auth ログインテスト

**実施日**: 2026-02-25  
**対象**: `supabase/seed.sql`（全15テーブル対応版）

---

## 1. 検証結果サマリ

| # | 確認項目 | 期待値 | 結果 | 判定 |
|---|---------|--------|------|------|
| 1 | auth.users レコード数 | 6 | 6 | ✅ |
| 2 | auth.identities レコード数 | 6 | 6 | ✅ |
| 3 | profiles レコード数 & 日本語名 | 6件・日本語 | 6件（管理太郎/佐藤花子/鈴木一郎/田中次郎/高橋三郎/渡辺四郎） | ✅ |
| 4 | user_roles レコード数 | 6 | 6 | ✅ |
| 5 | workflows | 7 | 7 | ✅ |
| 5 | expenses | 8 | 8 | ✅ |
| 5 | timesheets | 15 | 15 | ✅ |
| 5 | invoices | 3 | 3 | ✅ |
| 5 | invoice_items | 8 | 8 | ✅ |
| 5 | notifications | 6 | 6 | ✅ |
| 5 | audit_logs | 8 | 8 | ✅ |
| 6 | email_confirmed_at 設定済み | 全6ユーザー非NULL | 全て `t` | ✅ |
| 7 | Auth API ログイン (admin) | access_token 取得 | 成功 | ✅ |
| 7 | Auth API ログイン (member) | access_token 取得 | 成功 | ✅ |

---

## 2. 発見した問題と修正

### 問題 A: `email_change` カラムが NULL

**症状**: Auth API が `500: Database error querying schema` を返す。

**原因**: GoTrue が `auth.users` をスキャンする際、`email_change` カラムの NULL を Go の `string` 型に変換できなかった。

```
error finding user: sql: Scan error on column index 8, name "email_change": converting NULL to string is unsupported
```

**修正**: `seed.sql` の INSERT に `email_change` カラムを追加し、空文字列 `''` を明示的にセット。

```diff
 INSERT INTO auth.users (
   id, instance_id, aud, role, email, encrypted_password,
   email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
   created_at, updated_at, confirmation_token, recovery_token,
-  email_change_token_new, email_change_token_current, is_sso_user, is_anonymous
+  email_change, email_change_token_new, email_change_token_current,
+  is_sso_user, is_anonymous
 )
```

> [!NOTE]
> `phone` カラムには unique 制約があるため NULL のまま（デフォルト）にする。空文字列にすると重複キーエラーになる。

### 問題 B: bcrypt ハッシュが不正

**症状**: Auth API が `400: Invalid login credentials` を返す。

**原因**: seed.sql に埋め込まれていた bcrypt ハッシュが `password123` の正しいハッシュではなかった。

**検証方法**:
```sql
SELECT encrypted_password = crypt('password123', encrypted_password)
  AS pw_match FROM auth.users WHERE email='admin@test-corp.example.com';
-- 結果: pw_match = f（不一致）
```

**修正**: DB の `crypt()` 関数で正しいハッシュを再生成。
```sql
SELECT crypt('password123', gen_salt('bf', 10));
-- $2a$10$qNNmydZGJxcg06XmVIRvaOuXSmv1GKm8u0IHyYuilSBZnNYwaNHca
```

---

## 3. Auth API テスト結果

```bash
curl -s -X POST 'http://127.0.0.1:54321/auth/v1/token?grant_type=password' \
  -H 'apikey: <ANON_KEY>' \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@test-corp.example.com","password":"password123"}'
```

**レスポンス**: `access_token` + `token_type: bearer` + `expires_in: 3600` ✅

6ユーザー中2ユーザー（admin, member）で疎通確認済み。全ユーザーが同一ハッシュを使用するため、他のユーザーも同様にログイン可能。

---

## 4. 修正ファイル

| ファイル | 変更内容 |
|---------|---------|
| `supabase/seed.sql` | `email_change` カラム追加 + bcrypt ハッシュ再生成 |
