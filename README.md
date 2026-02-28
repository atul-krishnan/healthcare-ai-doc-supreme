# YourDoc

India-first telemedicine platform with production-oriented frontend and backend scaffolding, doctor workflow, billing, records, and optional Python ML triage service.

## Implemented

### Auth and Access
- Supabase email OTP and Google OAuth login
- Auth callback route
- Protected route proxy middleware for app surfaces

### Patient Flows
- AI triage UI + API (`/ai-doctor`, `/api/ai/triage`)
- Triage rationale + source citations (retrieval-grounded)
- Consultation lifecycle (`/consultations`, `/api/consultations`)
- Consultation messaging (`/api/consultations/[id]/messages`)
- Health records CRUD and CSV export (`/api/health-records`, `/api/health-records/export`)
- Report scanning API + UI (`/api/reports/scan`, `/health-records`)
- Profile and notification preferences (`/api/profile`)

### Doctor Flows
- Doctor workspace (`/doctor`)
- Queue API (`/api/doctor/queue`)
- Assign consultation (`/api/doctor/consultations/[id]/assign`)
- Complete consultation with prescriptions (`/api/doctor/consultations/[id]/complete`)
- Patient prescription list (`/api/prescriptions`)

### Billing
- Stripe checkout (`/api/billing/checkout`)
- Stripe portal (`/api/billing/portal`)
- Stripe webhook sync (`/api/billing/webhook`)

### Data and Security
- Supabase migrations with RLS policies
- Audit event logging table + helper
- PHI de-identification utility for AI path

### Integrations and Monitoring
- Wearables sync endpoint with provider-aware mock fallback (`/api/integrations/wearables/sync`)
- EHR sync endpoint with provider-aware mock fallback (`/api/integrations/ehr/sync`)
- Integration status API (`/api/integrations/status`)
- FHIR normalization mapping layer (`src/lib/server/fhir/*`)
- Clinical drift analytics endpoint (`/api/monitoring/drift/run`)
- App surfaces for orchestration:
  - `/integrations`
  - `/monitoring`
  - `/knowledge-base`

### Knowledge Layer
- Markdown-based clinical corpus in `knowledge-base/clinical/`
- Retrieval endpoint (`/api/knowledge/search`)
- Vector-ready config (`VECTOR_DB_PROVIDER`, `VECTOR_DB_URL`, `VECTOR_DB_API_KEY`)

### ML Integration
- Python FastAPI microservice at `ml/triage_service`
- Triaging order:
  1. Python ML service (`TRIAGE_ML_SERVICE_URL`)
  2. External LLM (`OPENAI_API_KEY` or `HUGGINGFACE_API_KEY`)
  3. Heuristic fallback

## Migrations
Run in this order:
1. `supabase/migrations/20260228143000_init_yourdoc.sql`
2. `supabase/migrations/20260228162000_consultations_ml_ops.sql`

## Quick start
```bash
npm install
cp .env.example .env.local
npm run setup:check
npm run dev
```

## Scripts
- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run setup:check`
- `npm run ml:train`

## Python triage service
See [ml/triage_service/README.md](./ml/triage_service/README.md)

## Handoff docs
- [Local setup](./docs/LOCAL_SETUP.md)
- [Blockers requiring user](./docs/BLOCKERS_REQUIRING_USER.md)
- [Roadmap gap analysis](./docs/ROADMAP_GAP_ANALYSIS_PRANADOC_STACK.md)
- [Founder input tracker](./docs/FOUNDER_INPUT_TRACKER.md)
- [Knowledge base setup](./docs/KNOWLEDGE_BASE_SETUP.md)
- [Worklog](./docs/WORKLOG_2026-02-28.md)
- [Learning pack](./docs/learning/README.md)
