---
title: "INV-05: Supabase ローカル環境キー検証"
---

# INV-05: Supabase ローカル環境キー検証

- **実施日**: 2026-02-25
- **目的**: `supabase db reset` 後に `.env.local` のキーが稼働中 Supabase インスタンスと一致しているか確認・修正

## 確認結果

| # | 確認項目 | `supabase status` | `.env.local` | 結果 |
|---|---------|-------------------|-------------|------|
| 1 | `NEXT_PUBLIC_SUPABASE_URL` | `http://127.0.0.1:54321` | `http://127.0.0.1:54321` | ✅ 一致 |
| 2 | `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Publishable) | `***` | `***` | ✅ 一致 |
| 3 | `SUPABASE_SERVICE_ROLE_KEY` (Secret) | `***` | `***` | ✅ 一致 |

## API 疎通検証

```bash
curl -s -o /dev/null -w "%{http_code}" \
  http://127.0.0.1:54321/rest/v1/ \
  -H "apikey: ***"
```

**結果**: `200` ✅

## 結論

全キーが一致しており、`.env.local` の修正は不要。API 疎通も HTTP 200 で正常動作を確認。
