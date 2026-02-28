# Data Retention Policy

**Version:** 1.0  
**Date:** February 2026  
**Status:** DRAFT — Requires legal counsel sign-off before production use

---

## 1. Purpose

This policy defines data retention, archival, and deletion practices for YourDoc, ensuring compliance with:
- **Digital Personal Data Protection Act, 2023 (DPDPA)** — Section 8(7): retain data only as long as necessary
- **Information Technology Act, 2000** — reasonable security practices
- **Telemedicine Practice Guidelines, 2020** — medical record retention
- **Income Tax Act** — financial record retention
- **CERT-In Directions** — log retention requirements

## 2. Retention Schedule

| Data Category | Retention Period | Legal Basis | Stored In | Deletion Method |
|--------------|-----------------|-------------|-----------|----------------|
| **User account data** (name, email, phone) | Active account + 30 days post-deletion request | DPDPA — contractual necessity | Supabase `profiles` | Hard delete from DB |
| **Authentication logs** (login events, sessions) | 1 year | IT Act + CERT-In log retention | Supabase `auth.sessions` | Automated purge |
| **Health records** (uploaded labs, reports, vitals) | 3 years from last consultation | Telemedicine Guidelines + patient safety | Supabase `health_records` | Soft delete → archive → hard delete |
| **Consultation records** (messages, prescriptions, notes) | 3 years from consultation closure | Telemedicine Guidelines | Supabase `consultations`, `consultation_messages` | Soft delete → archive → hard delete |
| **AI triage sessions** (symptom text, severity, recommendations) | 3 years from creation | Clinical safety and audit | Supabase `triage_sessions` | Soft delete → archive → hard delete |
| **Audit events** (data access, modifications, escalations) | 5 years | Compliance and forensic investigation | Supabase `audit_events` | Archive to cold storage → hard delete |
| **Billing and payment records** | 8 years | Income Tax Act, GST regulations | Stripe + Supabase `subscriptions` | Retain per Stripe policies; local records hard delete |
| **De-identified analytics** (aggregated usage, model metrics) | Indefinite | DPDPA — no longer personal data | PostHog / internal analytics | N/A (non-identifiable) |
| **Error and application logs** | 90 days | Operational necessity | Sentry / Vercel logs | Automated rotation |
| **Marketing consent records** | Duration of consent + 3 years | DPDPA — evidence of consent | Supabase `consent_records` | Hard delete |

## 3. Deletion Procedures

### 3.1 User-Initiated Deletion
1. User requests deletion via account settings or email to dpo@yourdoc.com
2. System confirms identity (authenticated session or email verification)
3. 14-day cooling-off period (user can cancel)
4. After cooling-off:
   - Account data: Hard deleted
   - Health records: Entered into 3-year archive (legal obligation)
   - Active subscriptions: Cancelled, billing data retained per tax law
   - Audit logs: Retained per retention schedule (not deletable by user request)
5. Confirmation email sent to user

### 3.2 Automated Retention Enforcement
- Cron job runs weekly to identify records past retention period
- Records moved to archive (encrypted, access-restricted) at end of active period
- Records hard-deleted from archive at end of full retention period
- Deletion events logged in `audit_events`

### 3.3 Legal Hold
- If data is subject to legal proceedings or regulatory investigation, retention period is extended until hold is lifted
- Legal holds are managed by legal counsel and documented in internal records
- Affected users are not notified of legal holds (per legal counsel guidance)

## 4. Data Archival

### Archive Tier (Post-Active Retention)
- Encrypted at rest (AES-256)
- Access restricted to admin role with audit logging
- No API access — manual retrieval only upon legal or regulatory request
- Stored in same region (ap-south-1) as primary data

## 5. Cross-Border Considerations

- Primary data storage: Supabase (ap-south-1 / Mumbai)
- Third-party processors: Stripe (PCI-compliant, data in India/US), OpenAI (if used — with de-identification)
- All cross-border transfers comply with DPDPA Section 16 and government notifications on permitted jurisdictions

## 6. Implementation Status

| Control | Status | Notes |
|---------|--------|-------|
| Retention schedule defined | ✅ Done | This document |
| Automated purge jobs | ⬜ Not started | Implement cron for auth logs + expired records |
| Soft-delete support in schema | ⬜ Not started | Add `deleted_at` columns to relevant tables |
| Archive tier | ⬜ Not started | Define cold storage bucket when cloud provider chosen |
| User deletion flow | ⬜ Not started | Build account deletion UI + API |
| Consent record table | ⬜ Not started | Add `consent_records` table to migration |

## 7. Review and Updates

- This policy is reviewed every 6 months or after significant regulatory changes
- Changes require legal counsel review before implementation
- All team members with data access must acknowledge this policy annually

---

**Sign-off Required:**
- [ ] Data Protection Officer
- [ ] Legal Counsel
- [ ] Technical Lead
