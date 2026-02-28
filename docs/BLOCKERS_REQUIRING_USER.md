# Blockers Requiring Founder Input

This file tracks tasks that cannot be completed without your intervention.

## 1) Credentials and Keys
- Supabase project credentials:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- Stripe credentials:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `NEXT_PUBLIC_STRIPE_PRICE_MONTHLY_INR`
- OpenAI key (optional if using only Python triage service):
  - `OPENAI_API_KEY`

## 2) Supabase Manual Actions
- Run both migrations in Supabase SQL editor:
  - `supabase/migrations/20260228143000_init_yourdoc.sql`
  - `supabase/migrations/20260228162000_consultations_ml_ops.sql`
- Configure Auth redirect URL:
  - `http://localhost:3000/auth/callback`
- Enable Google OAuth provider and add client credentials.

## 3) Stripe Manual Actions
- Create monthly INR subscription product/price and set `NEXT_PUBLIC_STRIPE_PRICE_MONTHLY_INR`.
- Add webhook endpoint:
  - URL: `https://<your-domain>/api/billing/webhook`
  - Events:
    - `checkout.session.completed`
    - `customer.subscription.created`
    - `customer.subscription.updated`
    - `customer.subscription.deleted`

## 4) Clinical/Legal Sign-off
- Replace placeholder terms/privacy with counsel-approved text for India.
- Confirm escalation protocol for emergency and high-risk symptom cases.
- Confirm prescription/referral policy boundaries for teleconsult workflow.

## 5) Doctor Role Provisioning
- Promote doctor accounts by setting `profiles.role = 'doctor'` in Supabase for approved users.
- Optional: create admin accounts via `profiles.role = 'admin'`.

## 6) Deployment Inputs
- Domain + SSL setup
- Secrets for production environment
- Telemetry/monitoring keys (Sentry/PostHog/Amplitude if used)

## 7) Architecture Decisions Pending
- Wearable ingestion provider decision:
  - Junction or Terra
- EHR ingestion provider decision:
  - Fasten, Particle, or Medplum-oriented architecture
- RAG vector database decision:
  - Qdrant or Chroma
- Cloud model decision:
  - AWS or Azure VPC isolation plan
- AI provider decision for BAA + zero-retention setup.

## 8) India Interoperability Inputs
- ABDM sandbox onboarding details
- ABHA flow requirements
- HIP/HIU scope decisions

See also:
- `docs/ROADMAP_GAP_ANALYSIS_PRANADOC_STACK.md`
- `docs/FOUNDER_INPUT_TRACKER.md`
