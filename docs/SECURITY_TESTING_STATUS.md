# Security and Testing Status

## Security hardening completed
- Added origin validation for mutating APIs to reduce CSRF risk:
  - `/api/ai/triage` POST
  - `/api/chat/messages` POST
  - `/api/health-records` POST
  - `/api/profile` PUT
  - `/api/billing/checkout` POST
  - `/api/billing/portal` POST
  - `/api/consultations` POST
  - `/api/consultations/[id]/messages` POST
  - `/api/consultations/[id]/status` PATCH
  - `/api/doctor/consultations/[id]/assign` POST
  - `/api/doctor/consultations/[id]/complete` POST
- Stripe webhook remains signature-verified (not origin-gated).
- RLS policies exist in Supabase migrations.

## Automated tests added
- Framework: Vitest
- Tests:
  - `src/lib/server/triage.test.ts`
  - `src/lib/server/csrf.test.ts`
- Current result:
  - `npm run test` passes

## Build quality checks
- `npm run lint` passes
- `npm run build` passes

## Pending for production security completion (requires founder input)
- Production secrets setup
- Security headers / WAF decisions at deploy layer
- Legal text finalization and compliance sign-off
- Incident monitoring keys and alert routing
