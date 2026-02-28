# Supabase Setup Execution (2026-02-28)

## Completed

1. Created branch from `main` for this work:
- `codex/supabase-health-doc-setup`

2. Provisioned new Supabase project in org `Health Doc`:
- Organization ID: `fxtcymypwjgnlvibjsra`
- Project name: `yourdoc-india`
- Project ref: `hlbladmznieyknvayvct`
- Region: `ap-south-1` (India)
- Status: `ACTIVE_HEALTHY`

3. Applied SQL migrations to the new project database:
- `supabase/migrations/20260228143000_init_yourdoc.sql`
- `supabase/migrations/20260228162000_consultations_ml_ops.sql`

4. Verified public schema tables created:
- `profiles`
- `notification_preferences`
- `triage_sessions`
- `chat_threads`
- `chat_messages`
- `consultations`
- `consultation_messages`
- `prescriptions`
- `audit_events`
- `health_records`
- `subscriptions`

5. Updated Supabase Auth config via Management API:
- `site_url`: `http://localhost:3000`
- `uri_allow_list`: `http://localhost:3000/auth/callback,http://localhost:3000/**`

6. Local environment configured:
- `.env.local` created with Supabase URL + anon key + service role key.

7. Google OAuth provider configured in Supabase Auth:
- `external_google_enabled = true`
- Google client id set from provided JSON credentials
- Google secret stored in Supabase Auth config

## Pending (needs your input)

1. Google Console redirect verification:
- Ensure authorized redirect URI includes:
  - `https://hlbladmznieyknvayvct.supabase.co/auth/v1/callback`
- The shared JSON currently includes `https://hlbladmznieyknvayvct.supabase.co`; callback path must be allowed in Google OAuth settings.

2. Production environment setup:
- Add Supabase env vars in deployment platform (Vercel/other)
- Set production `site_url` and redirect allow list

3. Non-Supabase blockers still pending:
- Stripe keys and webhook config
- Legal/compliance final text and approvals

## Notes

- Supabase MCP server was unavailable due missing server-level auth in this session; setup was completed directly through Supabase Management API using your provided access token.
- No secrets were written into tracked docs; sensitive values were written only to local `.env.local`.
