# Local Setup and Integrations

## 1) Install and run web app
```bash
npm install
npm run dev
```

## 2) Environment variables
Copy `.env.example` to `.env.local` and fill values.

## 3) Supabase setup
- Create Supabase project
- Run all SQL migrations in order:
  - `supabase/migrations/20260228143000_init_yourdoc.sql`
  - `supabase/migrations/20260228162000_consultations_ml_ops.sql`
  - `supabase/migrations/20260301101500_india_mvp_navigation.sql`
- Configure redirect URL:
  - `http://localhost:3000/auth/callback`
- Enable Google OAuth provider if needed.

## 4) Python ML triage service (optional but supported)
```bash
cd ml/triage_service
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python train_model.py
uvicorn app:app --reload --port 8000
```
Set in `.env.local`:
```bash
TRIAGE_ML_SERVICE_URL=http://localhost:8000
```

## 5) Stripe setup
- Create monthly INR price in Stripe and copy price id into `NEXT_PUBLIC_STRIPE_PRICE_MONTHLY_INR`
- Configure webhook endpoint:
  - URL: `http://localhost:3000/api/billing/webhook`
  - Events:
    - `checkout.session.completed`
    - `customer.subscription.created`
    - `customer.subscription.updated`
    - `customer.subscription.deleted`

## 6) External LLM (optional fallback/secondary)
- Option A: OpenAI
  - Add `OPENAI_API_KEY`
  - Optional: set `OPENAI_MODEL` (default `gpt-4.1-mini`)
- Option B: Hugging Face Inference Router
  - Add `HUGGINGFACE_API_KEY`
  - Optional: set `HUGGINGFACE_MODEL` (default `openai/gpt-oss-120b:cerebras`)
- Triage routing order:
  1. Python ML service (if configured)
  2. External LLM (OpenAI first, then Hugging Face if configured)
  3. Built-in heuristic fallback

## 7) Wearables and EHR integrations (optional for live mode)
- Default mode is mock fallback for both connectors.
- To enable live connectors, set optional vars in `.env.local`:
```bash
WEARABLE_PROVIDER=terra # or junction
WEARABLE_API_KEY=...
WEARABLE_SYNC_URL=...

EHR_PROVIDER=fasten # or particle or medplum
EHR_API_KEY=...
EHR_SYNC_URL=...
```
- Test from UI:
  - `/integrations` -> `Sync wearables`
  - `/integrations` -> `Sync EHR`

## 8) RAG retrieval (optional live vector mode)
- Local lexical retrieval is active by default.
- For vector-backed retrieval, set:
```bash
VECTOR_DB_PROVIDER=qdrant # or chroma
VECTOR_DB_URL=...
VECTOR_DB_API_KEY=...
```
- Triage responses include `rationale` + `citations` in `/ai-doctor`.
- Knowledge search UI:
  - `/knowledge-base`

## 9) Drift monitoring
- Trigger from UI:
  - `/monitoring` -> `Run drift analysis`
- API endpoint:
  - `POST /api/monitoring/drift/run`
- Alerts are written into `health_records` as `record_type='clinical_alert'`.

## 10) Report scanning (optional AI-enhanced)
- Endpoint:
  - `POST /api/reports/scan`
- UI:
  - `/health-records` -> `Report scanning (optional)`
- Behavior:
  - Uses external LLM parsing when `OPENAI_API_KEY` or `HUGGINGFACE_API_KEY` is configured.
  - Falls back to deterministic heuristic extraction when no external LLM key is configured.

## 11) Setup health check
Run:
```bash
npm run setup:check
```

## 12) Doctor workspace enablement
- Update doctor users in Supabase:
```sql
update public.profiles
set role = 'doctor'
where id = '<user-uuid>';
```
