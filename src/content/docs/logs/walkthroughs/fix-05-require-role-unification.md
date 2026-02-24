---
title: "Walkthrough: requireRole() 統一"
---

# Walkthrough: requireRole() 統一

## 変更概要

インラインの `roles.some()` パターンをすべて中央集約のヘルパーに置換した。

### 新設ヘルパー

[auth.ts](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/lib/auth.ts) に `hasRole()` を追加:

```typescript
export function hasRole(user: CurrentUser, tenantId: string, allowedRoles: Role[]): boolean
```

| ヘルパー | 用途 | 振る舞い |
|---|---|---|
| `requireRole()` | Server Action のアクセスゲート | 権限不足時に throw |
| `hasRole()` | UI 分岐・条件フラグ | boolean を返す |

### 修正ファイル一覧 (14ファイル)

| ファイル | 修正内容 |
|---|---|
| [auth.ts](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/lib/auth.ts) | `hasRole()` 新設 |
| [audit-logs/page.tsx](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/audit-logs/page.tsx) | `hasRole()` でアクセスゲート |
| [audit-logs/_actions.ts](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/audit-logs/_actions.ts) | `hasRole()` + throw |
| [tenant/page.tsx](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/tenant/page.tsx) | `hasRole()` でアクセスゲート |
| [users/page.tsx](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/users/page.tsx) | `hasRole()` でアクセスゲート |
| [users/_actions.ts](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/admin/users/_actions.ts) | it_admin チェックを `hasRole()` |
| [projects/_actions.ts](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/projects/_actions.ts) | 4箇所を `hasRole()` |
| [projects/page.tsx](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/projects/page.tsx) | canCreate フラグ |
| [projects/[id]/page.tsx](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/projects/[id]/page.tsx) | canEdit フラグ |
| [tasks/page.tsx](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/projects/[id]/tasks/page.tsx) | canManage フラグ |
| [tasks/_actions.ts](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/projects/[id]/tasks/_actions.ts) | 4箇所を `hasRole()` |
| [reports/page.tsx](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/timesheets/reports/page.tsx) | 3ロールチェック |
| [reports/_actions.ts](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/(authenticated)/timesheets/reports/_actions.ts) | 3ロールチェック |
| [export/route.ts](file:///home/garchomp-game/workspace/starlight-test/OpsHub/src/app/api/timesheets/export/route.ts) | 3ロールチェック |

## 検証結果

- **grep**: `roles.some` が `auth.ts` 以外に残っていないことを確認 ✅
- **`npm run build`**: 型エラー 0 件、ビルド成功 ✅
