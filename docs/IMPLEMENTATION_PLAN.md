# YourDoc Feature-Equivalent Build Plan

## Scope Guardrails
- Build feature-equivalent behavior from scratch.
- Do not copy proprietary source code or protected third-party assets.
- Temporary copy can mimic structure for internal validation, then replace with original brand voice.

## Product Modules (V1 India)
1. Identity and Access
- Email OTP login
- Social login
- Session timeout and secure logout

2. Patient Core
- Dashboard with quick actions
- Profile and preferences
- Notifications for summaries and follow-ups

3. AI Care Layer
- Symptom intake form
- Structured AI response with red-flag safety checks
- Hand-off to doctor consult when risk or uncertainty is high

4. Doctor Consult Layer
- Secure patient-doctor messaging
- Visit summary and follow-up notes
- Prescription and referral hooks (policy constrained)

5. Health Records Platform
- Import external records (FHIR-like normalization)
- Wearable sync and trend views
- Timeline view and export

6. Billing
- Subscription plans
- Per-visit payments
- Cancellation/reactivation and billing history

7. Growth Content Surface
- Conditions pages
- Services pages
- Compare pages
- Blog templates

## Technical Architecture
- Frontend: Next.js App Router + TypeScript + Tailwind
- Backend: Next.js route handlers + Supabase (Auth, Postgres, Storage, Realtime)
- Payments: Stripe
- Data connectors: staged adapters for EHR and wearable providers
- Observability: PostHog/Amplitude + server logs + Sentry

## Build Sequence
1. Foundation
- Finalize design tokens and layout
- Set up environment config and secrets management
- Set up lint, formatting, CI checks

2. Auth and Patient Profile
- OTP + social auth
- Route protection
- Profile CRUD

3. AI + Chat
- Symptom intake schema
- AI response contract and safeguards
- Chat room and transcript persistence

4. Records and Integrations
- Base FHIR mapping tables
- File import and parsing
- Wearable ingestion and daily sync jobs

5. Billing
- Product/price setup
- Webhooks and subscription sync
- Access controls by plan

6. India Production Readiness
- Legal text from counsel
- Incident response and audit logging
- Medical escalation SOPs

7. EU Expansion
- GDPR controls and retention policies
- Country/provider matrix
- Localization and legal variants

## Current Repository Status
- Core routes and navigation scaffolded
- India-first branding applied
- Auth + protected routing implemented
- Patient consultation lifecycle implemented
- Doctor queue/assignment/completion + prescription flow implemented
- Health records CRUD + CSV export implemented
- Stripe checkout/portal/webhook APIs implemented
- Python ML triage service integrated as optional primary triage provider
- Docs for roadmap, compliance, blockers, and deployment created
