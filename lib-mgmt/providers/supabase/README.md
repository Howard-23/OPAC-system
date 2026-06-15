# Supabase Connection Health (Legacy Monitoring)

Minimal setup for verifying the legacy Supabase database connection through the shared pooler. Note: Supabase is no longer the primary data provider; Firebase is used for active synchronization.

## Why Shared Pooler

Supabase direct database connections use IPv6 by default. This project uses the shared pooler so it works from IPv4-only networks without the paid dedicated IPv4 add-on.

## Setup

1. Copy `.env.example` to `.env`:
   ```powershell
   Copy-Item .env.example .env
   ```
2. Fill in the values in `.env`:
   ```env
   SUPABASE_PROJECT_REF=gjtgotwduereuzpjiinw
   SUPABASE_DB_POOLER_HOST=aws-1-ap-northeast-1.pooler.supabase.com
   SUPABASE_DB_POOLER_PORT=5432
   SUPABASE_DB_NAME=postgres
   SUPABASE_DB_PASSWORD=your-database-password
   SUPABASE_DB_SSL=true
   ```

## Verify Health

Run from the repository root:
```powershell
npm run health:supabase
```

Expected result:
```text
Health check OK.
```
