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
- Run both SQL migrations in order:
  - `supabase/migrations/20260228143000_init_yourdoc.sql`
  - `supabase/migrations/20260228162000_consultations_ml_ops.sql`
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

## 6) OpenAI (optional fallback/secondary)
- Add `OPENAI_API_KEY`
- Triage routing order:
  1. Python ML service (if configured)
  2. OpenAI (if configured)
  3. Built-in heuristic fallback

## 7) Setup health check
Run:
```bash
npm run setup:check
```

## 8) Doctor workspace enablement
- Update doctor users in Supabase:
```sql
update public.profiles
set role = 'doctor'
where id = '<user-uuid>';
```
