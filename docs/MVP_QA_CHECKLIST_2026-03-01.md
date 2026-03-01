# YourDoc India MVP QA Checklist (March 1, 2026)

## Automated Checks
- [x] `npm run lint` passes
- [x] `npm test` passes
- [x] `npm run build` passes

## Acceptance Criteria Smoke Checklist
- [x] Anonymous intake flow exists at `/intake` and generates a brief via `/api/intake/generate`
- [x] Generated brief page at `/briefs/[id]` shows care setting, department, next steps, disclaimers
- [x] Share link supports optional PIN + expiry and revocation (`/api/briefs/[id]/share`, `/s/[token]`)
- [x] PDF export endpoint implemented (`/api/briefs/[id]/pdf`)
- [x] Post-brief login gate and claim-to-vault flow implemented (`/api/briefs/[id]/claim`, `/vault`)
- [x] Quick Check slots/bookings implemented (`/api/quickcheck/slots`, `/api/quickcheck/bookings`)
- [x] Doctor quick-check console implemented (`/doctor`, `/api/doctor/quickcheck/*`)
- [x] ER-now handling renders explicit ER-first CTA and backup-only quick check wording
- [x] Access checks enforce owner/anon-session controls and doctor-assignment scope
- [x] No secret keys exposed to client-side code paths introduced in this iteration

## Added Event Tracking
- [x] intake_started
- [x] intake_completed
- [x] brief_generated
- [x] brief_shared_link
- [x] brief_shared_pdf
- [x] quickcheck_clicked
- [x] slot_selected
- [x] booking_confirmed
- [x] doctor_call_started
- [x] doctor_call_completed
- [x] outcome_selected
- [x] refund_requested/support_ticket

## Manual UI Follow-up Recommended
- [ ] End-to-end browser run against a live Supabase project with the new migration applied
- [ ] Verify WhatsApp PDF rendering on Android + iOS share intents
- [ ] Confirm Google OAuth + email OTP redirect with `/briefs/[id]?claim=1`
- [ ] Validate doctor delay >10 min support-ticket creation in a real call simulation
