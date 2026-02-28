# Founder Input Tracker

Use this as the single checklist of items needed from you.

Status legend:
- `pending`
- `in progress`
- `done`

## A) Credentials and Keys

| Item | Why Needed | Phase | Status |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Auth, DB, session APIs | Immediate | `pending` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client auth/session | Immediate | `pending` |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin operations, webhook sync | Immediate | `pending` |
| Supabase project provisioning (`hlbladmznieyknvayvct`) | Core backend environment | Immediate | `done` |
| `STRIPE_SECRET_KEY` | Billing checkout/portal/webhook | Immediate | `pending` |
| `STRIPE_WEBHOOK_SECRET` | Secure billing webhook verification | Immediate | `pending` |
| `NEXT_PUBLIC_STRIPE_PRICE_MONTHLY_INR` | Subscription plan checkout | Immediate | `pending` |
| `OPENAI_API_KEY` (optional) | External LLM triage path | Optional | `pending` |
| `TRIAGE_ML_SERVICE_URL` (optional) | Python triage service endpoint | Optional | `pending` |
| `WEARABLE_API_KEY` + `WEARABLE_SYNC_URL` (optional) | Move wearables sync from mock to live | Phase 2 | `pending` |
| `EHR_API_KEY` + `EHR_SYNC_URL` (optional) | Move EHR sync from mock to live | Phase 2 | `pending` |
| `VECTOR_DB_URL` + `VECTOR_DB_API_KEY` (optional) | Move evidence retrieval from local lexical to vector search | Phase 3 | `pending` |
| OCR provider credentials (optional) | Enable PDF/image report scanning beyond pasted text | Phase 3 | `pending` |

## B) Provider Decisions

| Decision | Why Needed | Phase | Status |
|---|---|---|---|
| Wearables provider (`Junction` vs `Terra`) | Connector contract and data normalization | Phase 2 | `pending` |
| EHR provider (`Fasten` vs `Particle` vs `Medplum`) | Records interoperability strategy | Phase 2 | `pending` |
| RAG vector DB (`Qdrant` vs `Chroma`) | Source-grounded medical reasoning quality | Phase 3 | `pending` |
| AI provider with BAA + zero-retention | PHI-safe external model usage | Phase 1/3 | `pending` |
| Cloud deployment model (`AWS`/`Azure` + VPC plan) | Compliance boundary and scale | Phase 1 | `pending` |

## C) Compliance and Legal

| Item | Why Needed | Phase | Status |
|---|---|---|---|
| Counsel-approved India Terms/Privacy | Production legal requirement | Immediate | `pending` |
| Clinical escalation SOP approval | Safety governance | Immediate | `pending` |
| Prescription policy boundaries | Doctor workflow constraints | Immediate | `pending` |
| BAA documentation and data retention policy | HIPAA-grade controls for AI/vendors | Phase 1 | `pending` |
| Break-the-glass policy definition | Emergency data access control | Phase 1/5 | `pending` |

## D) India-Specific Interoperability

| Item | Why Needed | Phase | Status |
|---|---|---|---|
| ABDM sandbox onboarding | India rails integration | Phase 2 | `pending` |
| ABHA ID flow requirements | Identity + consent flow alignment | Phase 2 | `pending` |
| HIP/HIU scope decision | Record sharing/requesting coverage | Phase 2 | `pending` |

## E) Role Provisioning

| Item | Why Needed | Phase | Status |
|---|---|---|---|
| Doctor account list to promote (`profiles.role='doctor'`) | Access to `/doctor` workspace | Immediate | `pending` |
| Admin account list (`profiles.role='admin'`) | Operational oversight | Immediate | `pending` |

## F) Quick Return Plan

1. Fill `.env.local` with available keys.
2. Run both Supabase migrations.
3. Run `npm run setup:check`.
4. Confirm provider choices in section B.
5. Run `/integrations` sync actions and `/monitoring` drift analysis.
6. Start live-connector wiring for chosen providers.

## G) Supabase OAuth Status

| Item | Status |
|---|---|
| Google OAuth enabled in Supabase project `hlbladmznieyknvayvct` | `done` |
| Google console callback URI `https://hlbladmznieyknvayvct.supabase.co/auth/v1/callback` verified | `pending` |
