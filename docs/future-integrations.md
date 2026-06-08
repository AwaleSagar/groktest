# Future Integrations

Schema and integration notes for SubVault cloud and Google services.

## Supabase sync

Mirror local tables with `user_id` on every row:

- `categories` — same fields + `user_id UUID`
- `subscriptions` — same fields + `user_id UUID`
- `settings` — per-user singleton

RLS policy: `auth.uid() = user_id` on all tables.

Sync strategy:

1. Local Dexie remains source of truth while offline.
2. On unlock, pull remote changes since `updatedAt` watermark.
3. Push local mutations after `schedulePersist`.
4. Conflict resolution: latest `updatedAt` wins per record.

## Gmail API

Scope: `https://www.googleapis.com/auth/gmail.readonly`

Flow:

1. OAuth via Supabase Edge Function or backend proxy (never store refresh token in client bundle).
2. Search query: `subject:(receipt OR invoice OR subscription OR renewal) newer_than:30d`
3. Parse amount, merchant, date → draft subscription entries.
4. User reviews and approves before insert.

## Google Sheets API

Scope: `https://www.googleapis.com/auth/spreadsheets`

Export format:

| Month | Category | Service | Amount | Currency | Payment mode | Recurring |
|-------|----------|---------|--------|----------|--------------|-----------|

One-way export from local vault on user action. No automatic write-back.