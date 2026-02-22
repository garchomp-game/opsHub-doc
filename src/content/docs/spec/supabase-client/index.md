---
title: Supabaseクライアント運用規約
description: Next.js App Router での Supabase クライアントの使い分けルール
---

## 目的 / In-Out / Related
- **目的**: Supabase クライアントの利用ルールを統一し、セキュリティと一貫性を確保する
- **対象範囲（In）**: クライアント種別の使い分け、禁止事項、パターン集
- **対象範囲（Out）**: クライアントコードの実装詳細（→ app/src/lib/supabase/）
- **Related**: [アーキテクチャ概要](../architecture/) / [権限/認可](../authz/)

---

## クライアント種別

| クライアント | ファイル | 利用場所 | 認証コンテキスト |
|---|---|---|---|
| **Server** | `lib/supabase/server.ts` | Server Component, Server Action, Route Handler | Cookie ベース（ユーザー権限） |
| **Client** | `lib/supabase/client.ts` | Client Component（`"use client"`） | Cookie ベース（ユーザー権限） |
| **Middleware** | `lib/supabase/middleware.ts` | `middleware.ts` | セッションリフレッシュ専用 |

## 使い分けルール

### ✅ 推奨パターン

| ユースケース | 使用クライアント |
|---|---|
| ページのデータ取得 | Server（Server Component） |
| フォーム送信 | Server（Server Action） |
| クライアント側のリアルタイム購読 | Client |
| Webhook 受信 | Server（Route Handler） |

### ❌ 禁止パターン

| パターン | 理由 |
|---|---|
| Client Component でのデータ書き込み直接呼び出し | RLS は効くが、バリデーション・監査ログが抜ける |
| `service_role` キーのクライアント公開 | RLS バイパスで全データアクセス可能になる |
| Server Component での `.insert()` / `.update()` | Server Component は読み取り専用（書き込みは Server Action で） |

## Server Action パターン

```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createProject(formData: FormData) {
  const supabase = await createClient();

  // 1. 認証確認
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // 2. バリデーション
  const name = formData.get("name") as string;
  if (!name) return { success: false, error: { code: "ERR-VAL-001", message: "名前は必須です" } };

  // 3. DB操作（RLSが自動適用）
  const { data, error } = await supabase
    .from("projects")
    .insert({ name, tenant_id: user.user_metadata.tenant_id })
    .select()
    .single();

  if (error) return { success: false, error: { code: "ERR-SYS-001", message: "作成に失敗しました" } };

  // 4. 監査ログ
  await supabase.from("audit_logs").insert({
    action: "project.create",
    resource_type: "project",
    resource_id: data.id,
    after: data,
  });

  // 5. キャッシュ無効化
  revalidatePath("/projects");

  return { success: true, data };
}
```

---

## 未決事項
- `service_role` を使用するバッチ処理の認可ルール
- Edge Runtime 対応の要否
