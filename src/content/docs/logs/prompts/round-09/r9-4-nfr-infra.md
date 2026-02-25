---
title: "R9-4: NFR運用基盤（構造化ログ + ヘルスチェック + CSP）"
description: "NFR-04a 構造化ログ、NFR-04b ヘルスチェック、NFR-01f CSP設定"
---

あなたは OpsHub の開発者です。NFR で要求されている運用基盤を実装してください。

## 参照

- NFR 要件: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/requirements/nfr/index.md
- 監査05: /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/audit-05-coverage-gaps.md

## タスク1: 構造化ログ（NFR-04a）

### 作成ファイル
- `/home/garchomp-game/workspace/starlight-test/OpsHub/src/lib/logger.ts`

### 実装内容

軽量な構造化ロガー（外部ライブラリなし）:

```typescript
type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: { name: string; message: string; stack?: string };
}

const logger = {
  error: (message: string, context?: Record<string, unknown>, error?: Error) => void,
  warn: (message: string, context?: Record<string, unknown>) => void,
  info: (message: string, context?: Record<string, unknown>) => void,
  debug: (message: string, context?: Record<string, unknown>) => void,
};
```

- JSON 形式で `console.log` / `console.error` に出力
- `LOG_LEVEL` 環境変数でフィルタリング（デフォルト: `info`）
- 既存の `console.error` 呼び出しを可能な範囲で `logger.error` に置換（最低限 `lib/actions.ts` の `withAuth` と `lib/notifications.ts`）

## タスク2: ヘルスチェック（NFR-04b）

### 作成ファイル
- `/home/garchomp-game/workspace/starlight-test/OpsHub/src/app/api/health/route.ts`

### 実装内容

```typescript
// GET /api/health
export async function GET() {
  try {
    // DB接続チェック（Supabase admin client で簡易クエリ）
    const { error } = await supabaseAdmin.from('tenants').select('id').limit(1);
    
    return Response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || 'unknown',
      database: error ? 'unhealthy' : 'healthy',
    });
  } catch {
    return Response.json({ status: 'unhealthy' }, { status: 503 });
  }
}
```

## タスク3: CSP 設定（NFR-01f）

### 修正ファイル
- `/home/garchomp-game/workspace/starlight-test/OpsHub/next.config.js` (or `.mjs` or `.ts`)

### 実装内容

```javascript
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",  // Next.js 開発用
      "style-src 'self' 'unsafe-inline'",  // Ant Design
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      "frame-ancestors 'none'",
    ].join('; '),
  },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
];
```

## 検証

```bash
cd /home/garchomp-game/workspace/starlight-test/OpsHub && npm run build
```

## ウォークスルー出力先

/home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/r9-4-nfr-infra.md
