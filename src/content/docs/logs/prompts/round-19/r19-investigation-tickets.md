---
title: "R19 調査チケット — 環境・認証基盤"
---

# Round 19: 調査チケット（環境・認証基盤）

> Phase 5「ローカル環境立ち上げ＆安定化」の調査・修正プロンプト集

---

## 実行計画（タイムライン）

```
グループ A（並列実行可能 — 全て独立）:
├─ INV-05: .env.local キー整合性       → Agent 1
├─ INV-06: シードデータ & bcrypt 検証   → Agent 2
└─ INV-07: ライブラリ互換性調査         → Agent 3

グループ B（グループ A 完了後）:
├─ INV-01 + INV-04: CSP + Auth E2E     → Agent 4
└─ INV-02: middleware 非推奨対応        → Agent 5

グループ C（グループ B 完了後）:
├─ INV-03: Ant Design v6 監査          → Agent 6
└─ INV-08: ダッシュボード表示検証       → Agent 7
```

> **グループ A の3タスクは全て並列実行OK**。相互依存なし。

---

## 🔴 INV-05: `.env.local` と Supabase キーの整合性確認

**触るファイル**: `.env.local`
**依存**: なし

```
あなたは OpsHub の環境構築担当です。Supabase のローカル環境キーと .env.local の設定値が一致しているか確認・修正してください。

## 背景
supabase db reset 実行後、.env.local のキーが現在稼働中の Supabase インスタンスと一致しない可能性がある。キーが不一致の場合、全ての API 呼び出しが 401 で失敗する。

## 確認項目
1. `npx supabase status` 出力のキー（Publishable / Secret）と `.env.local` の対応キーを比較
2. NEXT_PUBLIC_SUPABASE_URL が `http://127.0.0.1:54321` であること
3. NEXT_PUBLIC_SUPABASE_ANON_KEY が Publishable キーと一致すること
4. SUPABASE_SERVICE_ROLE_KEY が Secret キーと一致すること

## 手順
1. `npx supabase status` でキーを取得（/home/garchomp-game/workspace/starlight-test/OpsHub ディレクトリで実行）
2. `.env.local` の内容を表示: `cat /home/garchomp-game/workspace/starlight-test/OpsHub/.env.local`
3. 差分がある場合は `.env.local` を更新
4. 更新後、dev server を再起動（next.config.ts のキャッシュも含む）

## 対象ファイル
- /home/garchomp-game/workspace/starlight-test/OpsHub/.env.local

## 検証
修正後: `curl http://127.0.0.1:54321/rest/v1/ -H "apikey: <ANON_KEY>"` で 200 が返ること

## ウォークスルー出力先
/home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/inv-05-env-check.md
```

---

## 🔴 INV-06: シードデータの動作検証と bcrypt ハッシュの互換性確認

**触るファイル**: `supabase/seed.sql`（修正が必要な場合のみ）
**依存**: なし

```
あなたは OpsHub のデータベース担当です。シードデータが正しく投入され、認証に必要なデータが揃っているか検証してください。

## 背景
seed.sql を大幅に拡充した（全15テーブル対応）。profiles テーブルのトリガーとの重複問題は修正済みだが、以下の点が未確認。

## 確認項目
1. auth.users に 6 ユーザーが存在するか
2. auth.identities に 6 レコードが存在するか
3. public.profiles に 6 レコードが存在し、display_name が日本語名になっているか
4. public.user_roles に 6 レコードが存在するか
5. public.workflows に 7 レコード、public.expenses に 8 レコードが存在するか
6. bcrypt ハッシュ `$2a$10$PwGnMx5MNr7SYEyMKqp5zuOHKzFnGICfSaR8KYtwv7ORIU09n.Bxe` が GoTrue で認証可能か
7. Supabase Auth API に直接リクエストしてログイン可能か

## 手順
1. DB 内容確認:
   ```bash
   cd /home/garchomp-game/workspace/starlight-test/OpsHub
   npx supabase db execute "SELECT id, email, email_confirmed_at FROM auth.users" --local
   npx supabase db execute "SELECT user_id, provider FROM auth.identities" --local
   npx supabase db execute "SELECT id, display_name FROM public.profiles" --local
   npx supabase db execute "SELECT user_id, role FROM public.user_roles" --local
   npx supabase db execute "SELECT count(*) as cnt, 'workflows' as tbl FROM workflows UNION ALL SELECT count(*), 'expenses' FROM expenses UNION ALL SELECT count(*), 'timesheets' FROM timesheets UNION ALL SELECT count(*), 'invoices' FROM invoices UNION ALL SELECT count(*), 'invoice_items' FROM invoice_items UNION ALL SELECT count(*), 'notifications' FROM notifications UNION ALL SELECT count(*), 'audit_logs' FROM audit_logs" --local
   ```

2. Supabase Auth API 直接テスト:
   ```bash
   curl -s -X POST http://127.0.0.1:54321/auth/v1/token?grant_type=password \
     -H "apikey: $(grep NEXT_PUBLIC_SUPABASE_ANON_KEY .env.local | cut -d= -f2)" \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@test-corp.example.com","password":"password123"}' | head -c 500
   ```
   → `access_token` が返れば認証成功、`invalid_grant` 等なら bcrypt/identities 問題

3. 失敗した場合の切り分け:
   - bcrypt ハッシュの形式問題 → `$2a$` を `$2b$` に変更して再投入
   - identities 不足 → `identity_data` に `email_verified: true` を追加
   - email_confirmed_at が NULL → seed.sql を修正して再投入

## 対象ファイル
- /home/garchomp-game/workspace/starlight-test/OpsHub/supabase/seed.sql
- /home/garchomp-game/workspace/starlight-test/OpsHub/supabase/migrations/20260224070000_profiles_table.sql

## 検証
Auth API 直接テストで access_token が返ること

## ウォークスルー出力先
/home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/inv-06-seed-verify.md
```

---

## 🟡 INV-07: Next.js 16 + @supabase/ssr + Ant Design v6 互換性調査

**触るファイル**: `package.json`（アップグレードが必要な場合）
**依存**: なし

```
あなたは OpsHub のフロントエンド技術調査担当です。現在使用しているライブラリの互換性を調査してください。

## 背景
OpsHub は以下のバージョンを使用:
- Next.js 16.1.6（Turbopack）
- React 19.2.3
- Ant Design (antd) 6.3.0
- @ant-design/nextjs-registry 1.3.0
- @supabase/ssr 0.8.0
- @supabase/supabase-js 2.97.0

Next.js 16 は比較的新しく、以下の互換性が不明。

## 調査項目

### 1. @supabase/ssr と Next.js 16
- @supabase/ssr v0.8.0 の changelog で Next.js 16 対応が明記されているか確認
- `cookies()` が async になったことへの影響確認（v15 からの変更）
- middleware.ts の非推奨化が @supabase/ssr のドキュメントに反映されているか
- 公式ドキュメント: https://supabase.com/docs/guides/auth/server-side/nextjs を確認

### 2. Ant Design v6 と Next.js 16
- antd v6 の App コンポーネントの使い方が v5 から変更されているか
- @ant-design/nextjs-registry v1.3.0 が antd v6 に対応しているか
- SSR / Server Components との互換性

### 3. React 19 との互換性
- React Compiler（babel-plugin-react-compiler 1.0.0）が全ライブラリと互換性あるか
- Server Components でのライブラリ使用パターンに問題がないか

## 手順
```bash
cd /home/garchomp-game/workspace/starlight-test/OpsHub

# 1. 現在のバージョン確認
npm ls next react antd @supabase/ssr @supabase/supabase-js @ant-design/nextjs-registry

# 2. 最新バージョンとの差分確認
npm outdated

# 3. 各パッケージのリリースノート確認（Web検索）
```

## 出力形式
以下のセクションを含む調査レポートを作成:
1. 互換性マトリクス（OK / 要対応 / 未確認）
2. 各パッケージの推奨バージョン
3. 必要なアップグレード手順（あれば）
4. Breaking Changes の一覧

## ウォークスルー出力先
/home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/inv-07-compatibility.md
```

---

## 🔴 INV-01 + INV-04: CSP 修正確認 + Supabase Auth E2E 検証

**触るファイル**: `next.config.ts`（修正が必要な場合）
**依存**: INV-05, INV-06 が完了していること

```
あなたは OpsHub のフロントエンド担当です。CSP 設定を修正し、ローカル Supabase への接続を許可した上で、ログインフロー全体を E2E で検証してください。

## 背景
next.config.ts の CSP `connect-src` にローカル Supabase URL が含まれておらず、ブラウザがログインリクエストをブロックしていた。環境変数 `NEXT_PUBLIC_SUPABASE_URL` を動的に追加する修正を試みたが、反映が確認できていない。

## 現在の修正内容（next.config.ts）
```typescript
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
// ...
`connect-src 'self' ${supabaseUrl} https://*.supabase.co wss://*.supabase.co`,
```

## 手順

### Phase 1: CSP ヘッダーの確認
```bash
cd /home/garchomp-game/workspace/starlight-test/OpsHub

# 1. .next キャッシュを削除して dev server を再起動
rm -rf .next
npm run dev &

# 2. 3秒待ってから CSP ヘッダーを確認
sleep 3
curl -sI http://localhost:3000/login | grep -i content-security-policy

# 3. 出力に http://127.0.0.1:54321 が含まれることを確認
```

### Phase 2: CSP が反映されない場合の代替修正
next.config.ts の `headers()` 関数の **内側** で環境変数を参照するように変更:
```typescript
async headers() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return [
    {
      source: "/(.*)",
      headers: [
        {
          key: "Content-Security-Policy",
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: blob:",
            "font-src 'self'",
            `connect-src 'self' ${supabaseUrl} https://*.supabase.co wss://*.supabase.co`,
            "frame-ancestors 'none'",
          ].join("; "),
        },
        // ... 他のヘッダー
      ],
    },
  ];
},
```

### Phase 3: ログイン E2E テスト
```bash
# ブラウザで http://localhost:3000/login を開き:
# Email: admin@test-corp.example.com
# Password: password123
# → 「ログインしました」トースト → / にリダイレクト → ダッシュボード表示
```

### Phase 4: Cookie 検証
```bash
# ログイン後、ブラウザの DevTools > Application > Cookies で:
# - sb-xxxx-auth-token が設定されていること
# - httpOnly 属性を確認
```

## 対象ファイル
- /home/garchomp-game/workspace/starlight-test/OpsHub/next.config.ts
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/lib/supabase/client.ts
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/lib/supabase/server.ts
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/lib/supabase/middleware.ts

## 検証
1. `curl -sI http://localhost:3000/login` で CSP に `http://127.0.0.1:54321` が含まれる
2. ブラウザでログインが成功し、/ にリダイレクトされる
3. ログイン後に Cookie が正しく設定される

## ウォークスルー出力先
/home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/inv-01-04-csp-auth.md
```

---

## 🟡 INV-02: Next.js 16 middleware 非推奨化への対応

**触るファイル**: `src/middleware.ts`, `src/lib/supabase/middleware.ts`
**依存**: INV-07 の調査結果

```
あなたは OpsHub のインフラ担当です。Next.js 16 で middleware.ts が非推奨になった影響を調査し、必要に応じて対応してください。

## 背景
dev server 起動時に以下の警告が表示される:
```
⚠ The "middleware" file convention is deprecated. Please use "proxy" instead.
```

## 調査項目
1. Next.js 16 のリリースノート・ドキュメントで `middleware.ts` の代替を調査
2. `proxy` の具体的な API と使い方を理解
3. 現在の middleware が行っている処理:
   - Supabase セッションリフレッシュ（`updateSession()`）
   - 公開パスの判定（`/login`, `/auth/callback`）
   - パスマッチング（静的ファイル除外）
4. `@supabase/ssr` が `proxy` API に対応しているか
5. middleware が非推奨でも**動作するか**（非推奨 ≠ 削除の場合もある）

## 手順
```bash
# 1. Next.js 16 のドキュメントを確認
# https://nextjs.org/docs/app/api-reference/file-conventions/middleware
# https://nextjs.org/docs/messages/middleware-to-proxy

# 2. 現在の middleware の動作確認
cd /home/garchomp-game/workspace/starlight-test/OpsHub
cat src/middleware.ts
cat src/lib/supabase/middleware.ts

# 3. proxy API のサンプルを確認（Next.js 16 のドキュメント）
```

## 対象ファイル
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/middleware.ts
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/lib/supabase/middleware.ts

## 判断基準
- middleware が引き続き動作する → 警告を許容し、ADR に移行方針を記録
- middleware が動作しない → proxy への移行を実施
- @supabase/ssr が proxy 未対応 → proxy 移行は保留し、ワークアラウンドを文書化

## ウォークスルー出力先
/home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/inv-02-middleware.md
```

---

## 🟡 INV-03: Ant Design v6 App.useApp() パターンの全体監査

**触るファイル**: `src/app/layout.tsx`, 対象の Client Component 全体
**依存**: INV-01 + INV-04 の完了

```
あなたは OpsHub のフロントエンド品質担当です。Ant Design v6 の App.useApp() パターンが全画面で正しく使われているか監査してください。

## 背景
login/page.tsx で App.useApp() のコンテキスト問題が発覚。LoginPage コンポーネント自身が <App> を return しつつ、同コンポーネント内で App.useApp() を呼んでいた。LoginForm と LoginPage に分割して修正済み。

ルート layout.tsx には <App> ラッパーが存在しないため、認証後の画面で同様の問題が潜在している可能性がある。

## 調査項目
1. `App.useApp()` を使用している全箇所の特定
2. `message.success()`, `message.error()`, `notification.*()` の使用箇所の特定
3. 各使用箇所で、上位に `<App>` コンテキストが存在するかの確認
4. ルート `layout.tsx` に `<App>` を追加すべきかの判断

## 手順
```bash
cd /home/garchomp-game/workspace/starlight-test/OpsHub

# 1. App.useApp() の使用箇所を検索
grep -rn "App\.useApp\|useApp" src/ --include="*.tsx" --include="*.ts"

# 2. message / notification の使用箇所を検索
grep -rn "message\.\(success\|error\|warning\|info\)" src/ --include="*.tsx" --include="*.ts"
grep -rn "notification\." src/ --include="*.tsx" --include="*.ts"

# 3. <App> ラッパーの使用箇所を検索
grep -rn "<App>" src/ --include="*.tsx"
```

## 修正方針
- 方針 A: ルート `layout.tsx` の `<ConfigProvider>` を `<App>` で包む → 全画面で `App.useApp()` が利用可能に
- 方針 B: 各画面ごとにローカルで `<App>` を配置（現在の login と同じパターン）

## 対象ファイル
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/layout.tsx
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/login/page.tsx
- grep で発見された全ての App.useApp() / message.* 使用箇所

## ウォークスルー出力先
/home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/inv-03-antd-app.md
```

---

## 🟢 INV-08: 認証後の画面遷移とダッシュボード表示の確認

**触るファイル**: なし（調査のみ、問題があれば修正）
**依存**: INV-01 + INV-04 が完了し、ログインが成功すること

```
あなたは OpsHub の品質検証担当です。ログイン成功後の画面遷移とダッシュボード表示を検証してください。

## 背景
ログインが成功しても、認証後の画面（ダッシュボード）が正常に動作するか未確認。Server Component での requireAuth()、RLS 経由のデータ取得、サイドバー/ヘッダーのレンダリングが正しく動作するかを検証する。

## 検証項目
1. ログイン後に / にリダイレクトされること
2. (authenticated)/layout.tsx のサイドバー・ヘッダーが表示されること
3. (authenticated)/page.tsx のダッシュボードが表示されること
4. requireAuth() で CurrentUser が正しく取得できること（tenantIds / roles が空でないこと）
5. 各ロールでログインして、ロール別メニューが適切に表示されること
6. サイドバーのナビゲーションリンクが正しく機能すること

## テストアカウント（全パスワード: password123）
| ロール | メール |
|---|---|
| Tenant Admin | admin@test-corp.example.com |
| PM | pm@test-corp.example.com |
| Accounting | accounting@test-corp.example.com |
| Approver | approver@test-corp.example.com |
| Member | member@test-corp.example.com |
| IT Admin | itadmin@test-corp.example.com |

## 手順
1. each ロールでログインして画面を確認
2. コンソールエラーがないことを確認
3. Server Action の呼び出しが成功するか確認（例: プロジェクト一覧取得）
4. RLS がロールに応じたデータを返しているか確認

## 対象ファイル
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/page.tsx
- /home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/layout.tsx

## ウォークスルー出力先
/home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/inv-08-dashboard.md
```
