---
title: "R20-2: Next.js 16 middleware 非推奨対応調査"
---

## 概要

Next.js 16.1.6 起動時に表示される以下の警告について調査し、`proxy` への移行可否を判断する。

```
⚠ The "middleware" file convention is deprecated. Please use "proxy" instead.
```

## 1. Next.js 16 `proxy` の仕様

### 1.1 変更の背景

Next.js 16 で `middleware.ts` が非推奨となり、`proxy.ts` に置き換えられた。主な理由は以下の通り：

| 理由 | 詳細 |
|------|------|
| 名称の誤解 | Express.js の middleware と混同され、重い処理や認証ロジックが実装される傾向があった |
| セキュリティ脆弱性 | CVE-2025-29927 で middleware ベースの認証バイパスが発覚 |
| 役割の明確化 | 「ネットワーク境界のプロキシ」であることを名称で明示 |

### 1.2 API の変更点

`proxy.ts` は `middleware.ts` の**リネーム**であり、API は本質的に同一。

```diff
- // src/middleware.ts
- import { type NextRequest, NextResponse } from "next/server";
- export async function middleware(request: NextRequest) {
+ // src/proxy.ts
+ import { type NextRequest, NextResponse } from "next/server";
+ export async function proxy(request: NextRequest) {
    // 同じロジック
    return NextResponse.next();
  }

  export const config = {
    matcher: [/* 同じ matcher 設定 */],
  };
```

| 項目 | middleware.ts | proxy.ts |
|------|-------------|----------|
| ファイル名 | `middleware.ts` | `proxy.ts` |
| エクスポート関数名 | `middleware` | `proxy` (または default export) |
| 引数 | `NextRequest` | `NextRequest` (同一) |
| 戻り値 | `NextResponse` | `NextResponse` (同一) |
| `config.matcher` | ✅ | ✅ (同一) |
| 配置場所 | プロジェクトルート or `src/` | プロジェクトルート or `src/` (同一) |
| デフォルトランタイム | Edge Runtime | **Node.js Runtime** (変更) |

> [!IMPORTANT]
> **ランタイムの変更**: `proxy.ts` は Node.js ランタイムがデフォルトとなった。これにより Node.js API へのフルアクセスが可能になり、Edge Runtime の制約（メモリ 1-4MB 制限、一部 npm パッケージ非対応）が解消されるため、OpsHub にとっては**改善**となる。

### 1.3 機能の互換性

| 機能 | middleware | proxy | 備考 |
|------|-----------|-------|------|
| URL リライト | ✅ | ✅ | |
| リダイレクト | ✅ | ✅ | |
| リクエストヘッダー変更 | ✅ | ✅ | |
| レスポンスヘッダー変更 | ✅ | ✅ | |
| Cookie 読み取り | ✅ | ✅ | |
| Cookie 書き込み | ✅ | ✅ | |
| `NextResponse.next()` | ✅ | ✅ | |

## 2. Supabase セッションリフレッシュとの互換性

### 2.1 現在の実装

OpsHub の middleware は以下の処理を行っている：

1. **`updateSession(request)`** — `@supabase/ssr` の `createServerClient` で Supabase クライアントを生成
2. **Cookie 読み書き** — `request.cookies.getAll()` / `supabaseResponse.cookies.set()` でセッショントークンを管理
3. **`supabase.auth.getUser()`** — 期限切れトークンの自動リフレッシュ

### 2.2 `proxy.ts` での動作可否

**結論: 完全に互換性あり。**

- `proxy.ts` は `NextRequest` / `NextResponse` を同一 API で扱うため、`updateSession()` のロジックはそのまま動作する
- `@supabase/ssr` v0.8.0 の `createServerClient` は `NextRequest` / `NextResponse` に依存しており、これらは `proxy.ts` でも同一
- Cookie 操作（`getAll`/`setAll`）に変更なし
- `supabase.auth.getUser()` は内部的に HTTP リクエストを行うが、Node.js ランタイムでは問題なし（むしろ Edge 制約がなくなりプラス）

### 2.3 `@supabase/ssr` 側の対応状況

`@supabase/ssr` は middleware / proxy というファイル配置規約に依存していない。`createServerClient` に渡す cookies オブジェクトが `NextRequest` / `NextResponse` 由来であれば動作するため、**ファイル名のリネームのみで対応可能**。

## 3. 推奨対応

### 判定: **A. `proxy` に移行**

> [!TIP]
> 移行は **ファイルリネーム＋関数名変更のみ** で完了する低リスクな変更です。

#### 移行理由

1. **API 完全互換** — ロジック変更不要
2. **codemod 提供あり** — 自動変換可能
3. **ランタイム改善** — Node.js デフォルトで Edge 制約が解消
4. **セキュリティ方針との整合** — Next.js が推奨するアーキテクチャに準拠
5. **将来の互換性** — Next.js 17 で `middleware.ts` が完全削除される可能性

#### 移行手順

**方法 1: codemod（推奨）**

```bash
npx @next/codemod@canary middleware-to-proxy
```

これにより以下が自動で行われる：
- `src/middleware.ts` → `src/proxy.ts` にリネーム
- `export async function middleware` → `export async function proxy` に変更

**方法 2: 手動変更**

##### Step 1: ファイルリネーム

```bash
mv src/middleware.ts src/proxy.ts
```

##### Step 2: 関数名変更

```typescript
// src/proxy.ts
import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
    // セッションリフレッシュ
    const response = await updateSession(request);

    // 認証不要パス
    const publicPaths = ["/login", "/auth/callback"];
    const isPublicPath = publicPaths.some((path) =>
        request.nextUrl.pathname.startsWith(path)
    );

    if (isPublicPath) {
        return response;
    }

    // 認証チェック：Supabaseのセッションcookieの有無で判定
    // 詳細な認証チェックはServer Component/Action側で行う
    return response;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
```

> [!NOTE]
> `src/lib/supabase/middleware.ts` は変更不要。このファイルは Next.js のファイル規約とは無関係で、Supabase クライアント生成ロジックを提供するユーティリティモジュールです。ファイル名に `middleware` が含まれていますが、紛らわしいため将来的に `session.ts` 等へのリネームを検討しても良いでしょう。

#### 変更対象ファイル一覧

| ファイル | 変更内容 |
|----------|----------|
| `src/middleware.ts` → `src/proxy.ts` | リネーム + 関数名 `middleware` → `proxy` |
| `src/lib/supabase/middleware.ts` | **変更不要** |

#### 検証手順

1. `npm run dev` で起動し、警告が消えることを確認
2. ログインフローが正常に動作することを確認（セッション Cookie が発行される）
3. セッションリフレッシュが動作することを確認（`getUser()` 呼び出し）
4. `npm run build` が成功することを確認

## 4. リスク評価

| リスク項目 | レベル | 理由 |
|-----------|--------|------|
| 機能的な破壊 | 🟢 低 | API 完全互換、ロジック変更なし |
| Supabase 互換性 | 🟢 低 | `@supabase/ssr` はファイル規約に依存しない |
| ランタイム差異 | 🟢 低 | Node.js ランタイムは Edge の上位互換 |
| ロールバック | 🟢 低 | リネームを戻すだけで切り戻し可能 |

## 調査日

2026-02-25
