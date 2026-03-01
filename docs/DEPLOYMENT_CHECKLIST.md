# Deployment Checklist

## Infrastructure
- [ ] Production domain configured
- [ ] HTTPS certificates active
- [ ] Vercel project connected to repo
- [ ] Environment variables set in production

## Supabase
- [ ] All migrations executed in production project (including `20260301101500_india_mvp_navigation.sql`)
- [ ] RLS policies verified
- [ ] OAuth providers configured
- [ ] Doctor/admin roles seeded in `profiles`

## Stripe
- [ ] Live product and INR monthly price configured
- [ ] Webhook endpoint configured to production domain
- [ ] Webhook signing secret set

## AI and ML
- [ ] `TRIAGE_ML_SERVICE_URL` deployed and reachable (or OpenAI fallback configured)
- [ ] `OPENAI_API_KEY` configured if using OpenAI fallback
- [ ] Triage outputs tested for emergency red-flag scenarios

## Legal and Clinical
- [ ] India terms and privacy reviewed by counsel
- [ ] Emergency escalation copy finalized
- [ ] Doctor SOP for consultation closure and prescriptions documented
- [ ] Data retention and incident response policy approved

## Verification
- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] Auth flow test (email OTP + Google)
- [ ] Consultation lifecycle test (create -> assign -> message -> complete)
- [ ] Billing test (checkout + portal + webhook sync)
