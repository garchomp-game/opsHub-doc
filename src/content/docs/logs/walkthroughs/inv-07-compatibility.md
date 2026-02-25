---
title: "INV-07: フロントエンド互換性調査"
---

# INV-07: フロントエンド互換性調査

| 項目 | 値 |
|---|---|
| 調査日 | 2026-02-25 |
| 対象 | OpsHub フロントエンド依存パッケージ |
| Next.js | 16.1.6（Turbopack） |
| React | 19.2.3 |

---

## 1. 現在のバージョン一覧

| パッケージ | 現在 | Latest | 状態 |
|---|---|---|---|
| next | 16.1.6 | 16.1.6 | ✅ 最新 |
| react / react-dom | 19.2.3 | 19.2.4 | ⚠️ パッチ差分あり |
| antd | 6.3.0 | 6.3.1 | ⚠️ パッチ差分あり |
| @ant-design/nextjs-registry | 1.3.0 | 1.3.0 | ✅ 最新 |
| @supabase/ssr | 0.8.0 | 0.8.0 | ✅ 最新 |
| @supabase/supabase-js | 2.97.0 | 2.97.0 | ✅ 最新 |
| babel-plugin-react-compiler | 1.0.0 | 1.0.0 | ✅ 最新 |
| tailwindcss | 4.2.0 | 4.2.1 | ⚠️ パッチ差分あり |

---

## 2. 互換性マトリクス

| 組み合わせ | 判定 | 備考 |
|---|---|---|
| @supabase/ssr 0.8.0 × Next.js 16 | **⚠️ 要対応** | 動作するが、公式ドキュメントは `proxy.ts` + `getClaims()` パターンに移行済み。現在の `middleware.ts` + `getUser()` は非推奨 |
| @supabase/ssr 0.8.0 × React 19 | ✅ OK | 問題なし |
| antd 6.3.0 × Next.js 16 | ✅ OK | @ant-design/nextjs-registry 1.3.0 が antd 6.x 対応を明言 |
| antd 6.3.0 × React 19 | ✅ OK | antd v6 は React 18+ 必須、React 19 に最適化済み |
| @ant-design/nextjs-registry 1.3.0 × antd 6 | ✅ OK | v1.3.0 リリースノートで antd 6.x 互換修正済み |
| babel-plugin-react-compiler 1.0.0 × Next.js 16 | ✅ OK | `next.config.ts` の `reactCompiler: true` で有効化済み |
| babel-plugin-react-compiler 1.0.0 × antd 6 | ✅ OK | antd v6 は React 19 に最適化されており、Compiler との既知の非互換なし |
| Turbopack × antd 6 | ✅ OK | CSS-in-JS（cssinjs）ベースのため Turbopack に影響なし |

---

## 3. 各調査項目の詳細

### 3.1 @supabase/ssr × Next.js 16

#### 3.1.1 changelog での Next.js 16 対応明記

@supabase/ssr v0.8.0（2025-11-26 リリース）の changelog には Next.js 16 対応が **明示的には記載されていない**。ただしリリース内容は以下の通りで、Next.js バージョンに依存しない汎用的な SSR Cookie 管理パッケージとして設計されている：

- `cookies.encode` オプション追加（Cookie サイズ最小化）
- 非推奨 `auth-helpers` パッケージ名での SSR 公開
- `supabase-js` 最新版への追従
- Cookie 関連のコンソール警告修正

コミュニティおよびチュートリアルでは Next.js 16 + @supabase/ssr 0.8.0 の組み合わせが実際に使用されている。

#### 3.1.2 `cookies()` の async 化への影響

Next.js 15 以降、`cookies()` は **非同期 API** に変更されている。OpsHub の現在の実装はこれに **適切に対応済み**：

```typescript
// src/lib/supabase/server.ts — ✅ 正しく await している
const cookieStore = await cookies();
```

#### 3.1.3 middleware.ts → proxy.ts の移行

> [!WARNING]
> **最も重要な対応事項**

Next.js 16 では `middleware.ts` が `proxy.ts` に **リネーム**（実質的置き換え）されている：

| 項目 | Next.js 15 | Next.js 16 |
|---|---|---|
| ファイル名 | `middleware.ts` | `proxy.ts` |
| エクスポート関数 | `middleware()` | `proxy()` |
| ランタイム | Edge / Node.js | **Node.js のみ**（Edge 廃止） |
| レスポンスボディ | 生成可能 | 不可（リダイレクト/リライトのみ） |

Next.js 16 では `middleware.ts` はまだ動作するが **非推奨**であり、将来のバージョンで削除される予定。

**OpsHub の現状と対応：**

| ファイル | 現状 | 推奨 |
|---|---|---|
| `src/middleware.ts` | `middleware()` をエクスポート | → `proxy.ts` にリネーム、`proxy()` をエクスポート |
| `src/lib/supabase/middleware.ts` | `updateSession()` を提供 | → `src/lib/supabase/proxy.ts` にリネーム（任意） |

Supabase 公式ドキュメント（[nextjs ガイド](https://supabase.com/docs/guides/auth/server-side/nextjs)）も既に `proxy.ts` + `proxy()` パターンに更新済み。

#### 3.1.4 `getUser()` → `getClaims()` の移行

Supabase 公式ドキュメントでは Proxy 内のセッション検証に `supabase.auth.getClaims()` の使用を推奨している：

| メソッド | 特徴 |
|---|---|
| `getUser()` | Supabase Auth サーバーに毎回リクエストを送信（レイテンシ大） |
| `getClaims()` | JWT 署名をプロジェクトの公開鍵で検証（ローカル、高速） |

**OpsHub での使用箇所：**

- `src/lib/supabase/middleware.ts:34` — `await supabase.auth.getUser()` ← **要対応**
- `src/lib/auth.ts:25, 93` — `await supabase.auth.getUser()` ← Server Action 内では `getUser()` でも可（ただし `getClaims()` のほうが高速）

> [!NOTE]
> `getUser()` は引き続き動作するため、**機能的な破壊は発生しない**。ただしパフォーマンスとセキュリティのベストプラクティスとして `getClaims()` への移行を推奨。

---

### 3.2 Ant Design v6 × Next.js 16

#### 3.2.1 App コンポーネントの変更点（v5 → v6）

antd v6 の主な Breaking Changes：

| 項目 | v5 | v6 |
|---|---|---|
| React 最低要件 | React 16+ | **React 18+** |
| Less 依存 | あり | **完全廃止** |
| テーマ | ConfigProvider + token | ConfigProvider + **改良 token システム** |
| 非推奨 API | 警告表示 | **完全削除** |
| TypeScript | 緩い | **より厳格な型検証** |
| DOM 構造 | 従来 | **最適化済み** |

OpsHub では Less を使用しておらず、ConfigProvider のトークンシステムも v5 後期の構成を採用しているため、**v6 への移行に伴う Breaking Change の影響は最小限**。

#### 3.2.2 @ant-design/nextjs-registry 1.3.0 の対応状況

v1.3.0 のリリースノートに **antd 6.x との互換性修正が明記**されている。OpsHub の `layout.tsx` では以下のように正しく使用されている：

```tsx
// src/app/layout.tsx
import { AntdRegistry } from "@ant-design/nextjs-registry";
// ...
<AntdRegistry>
  {children}
</AntdRegistry>
```

✅ SSR 初回描画時のスタイル抽出・注入が正常に動作。

#### 3.2.3 Server Components との互換性

antd コンポーネントはクライアント側の Context に依存するため、Server Component として直接使用される場合は `'use client'` ディレクティブが必要。OpsHub ではこのパターンが適切に適用されている（`_components/` 配下のクライアントコンポーネントで antd を使用）。

---

### 3.3 React 19 との互換性

#### 3.3.1 React Compiler（babel-plugin-react-compiler 1.0.0）

| 項目 | 状態 |
|---|---|
| React 19 対応 | ✅ 完全対応（React 17/18 にも後方互換あり） |
| Next.js 16 統合 | ✅ ビルトインサポート（`reactCompiler: true`） |
| antd 6 との互換性 | ✅ 既知の問題なし（v5 にあった Wave エフェクト等の問題は v6 で解消） |

OpsHub の `next.config.ts` で `reactCompiler: true` が正しく設定されている。

#### 3.3.2 Server Components でのライブラリ使用パターン

| パターン | 状態 |
|---|---|
| antd コンポーネント → Client Component 内で使用 | ✅ 適切 |
| Supabase クライアント → Server Component で `createClient()` 使用 | ✅ 適切 |
| Supabase クライアント → Client Component で `createBrowserClient()` 使用 | ✅ 適切 |

---

## 4. 推奨バージョンと推奨アップグレード

| パッケージ | 現在 | 推奨 | 緊急度 |
|---|---|---|---|
| next | 16.1.6 | 16.1.6 | — |
| react / react-dom | 19.2.3 | 19.2.4 | 低（パッチ更新のみ） |
| antd | 6.3.0 | 6.3.1 | 低（パッチ更新のみ） |
| @ant-design/nextjs-registry | 1.3.0 | 1.3.0 | — |
| @supabase/ssr | 0.8.0 | 0.8.0 | — |
| @supabase/supabase-js | 2.97.0 | 2.97.0 | — |
| tailwindcss | 4.2.0 | 4.2.1 | 低 |

---

## 5. 必要な対応事項（優先度順）

### 5.1 ⚠️ Priority: HIGH — middleware.ts → proxy.ts 移行

**影響範囲：** `src/middleware.ts`, `src/lib/supabase/middleware.ts`

```diff
- // src/middleware.ts
- export async function middleware(request: NextRequest) {
-     const response = await updateSession(request);
+ // src/proxy.ts
+ export async function proxy(request: NextRequest) {
+     const response = await updateSession(request);
```

**手順：**
1. `src/middleware.ts` → `src/proxy.ts` にリネーム
2. エクスポート関数名を `middleware` → `proxy` に変更
3. `src/lib/supabase/middleware.ts` → `src/lib/supabase/proxy.ts` にリネーム（任意、インポートパス調整）
4. 動作確認

> [!IMPORTANT]
> 自動マイグレーションツール: `npx @next/codemod@canary upgrade latest` でも対応可能。

### 5.2 ⚠️ Priority: MEDIUM — getUser() → getClaims() 移行

**影響範囲：** `src/lib/supabase/middleware.ts`（→ proxy.ts）

```diff
  // Proxy 内のセッションリフレッシュ
- await supabase.auth.getUser();
+ await supabase.auth.getClaims();
```

Server Action 内（`src/lib/auth.ts`）の `getUser()` は引き続き動作するが、`getClaims()` への移行でレイテンシ改善が見込める。

### 5.3 ℹ️ Priority: LOW — パッチバージョン更新

```bash
npm update react react-dom antd tailwindcss @tailwindcss/postcss
```

---

## 6. Breaking Changes 一覧

| 変更元 | Breaking Change | OpsHub への影響 |
|---|---|---|
| Next.js 16 | `middleware.ts` → `proxy.ts`（関数名も変更） | **あり** — 現在 `middleware.ts` を使用中 |
| Next.js 16 | Proxy は Node.js ランタイムのみ（Edge 廃止） | なし — Edge 未使用 |
| Next.js 16 | Proxy でレスポンスボディ生成不可 | なし — 現在リダイレクト/リライトのみ |
| Next.js 15+ | `cookies()` が async に変更 | なし — 既に `await` 対応済み |
| antd v6 | Less サポート廃止 | なし — Less 未使用 |
| antd v6 | v5 非推奨 API の完全削除 | 未確認 — 個別コンポーネント単位の確認が必要 |
| antd v6 | TypeScript 型がより厳格に | なし — ビルド成功済み |
| Supabase | `getUser()` → `getClaims()` 推奨 | **あり** — Proxy 内で `getUser()` 使用中 |

---

## 7. 結論

OpsHub のフロントエンド依存パッケージは全体として **概ね互換性あり** の状態。ただし以下の 2 点について対応を推奨する：

1. **`middleware.ts` → `proxy.ts` へのリネーム**（Next.js 16 推奨パターン）
2. **Proxy 内の `getUser()` → `getClaims()` への変更**（パフォーマンス・セキュリティ向上）

いずれも機能的な破壊は発生しておらず、現在の実装のまま動作するが、Next.js の将来バージョンで `middleware.ts` サポートが廃止される可能性があるため、早期の対応が望ましい。
