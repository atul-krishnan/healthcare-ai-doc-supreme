# Doctor Consultation SOP

**Version:** 1.0  
**Date:** February 2026  
**Status:** DRAFT — Requires clinical advisor sign-off before production use

---

## 1. Purpose

This SOP defines the standard operating procedures for doctor teleconsultations on the YourDoc platform, including consultation lifecycle, prescription boundaries, emergency escalation, and documentation requirements.

## 2. Scope

Applies to all licensed medical practitioners providing teleconsultations via YourDoc, in accordance with the **Telemedicine Practice Guidelines, 2020** (Board of Governors, MCI superseding body).

## 3. Doctor Eligibility

- Must hold a valid MBBS or higher medical degree from a recognized Indian institution
- Must be registered with the relevant State Medical Council (SMC) or National Medical Commission (NMC)
- Must provide verified registration number during onboarding
- Must complete YourDoc platform orientation (telemedicine protocol + tech walkthrough)

## 4. Consultation Lifecycle

### 4.1 Assignment
1. Patient creates a consultation request (may include AI triage data)
2. System routes to available doctor based on specialization and priority
3. Doctor accepts assignment within the doctor dashboard (`/doctor`)
4. Patient is notified that a doctor has been assigned

### 4.2 Active Consultation
1. Doctor reviews AI triage summary, patient history, and uploaded records
2. Doctor conducts consultation via secure messaging
3. Doctor may request additional information, labs, or records
4. Consultation messages are encrypted and audit-logged

### 4.3 Closure
1. Doctor completes the consultation by submitting:
   - **Diagnosis/assessment** (ICD-10 code if applicable)
   - **Treatment plan** (advice, lifestyle, medication if appropriate)
   - **Follow-up recommendation** (timeframe and conditions for return)
   - **Prescription** (if clinically warranted — see Section 5)
2. Patient receives a consultation summary with all the above

### 4.4 Follow-up
- Doctor sets follow-up timeframe (e.g., "Review in 7 days if symptoms persist")
- System sends automated follow-up notification to patient
- Patient can re-open consultation or start a new one

## 5. Prescription Boundaries

### 5.1 Permitted
- Schedule H drugs for conditions appropriately assessed via teleconsult
- OTC medications with dosage guidance
- Lab investigations and imaging referrals
- Specialist referral recommendations

### 5.2 NOT Permitted via Teleconsultation
- **Schedule H1 drugs** (antibiotics requiring stricter control) — only with explicit clinical justification documented
- **Schedule X drugs** (narcotics, psychotropic substances) — NEVER via teleconsult
- **Controlled substances** under NDPS Act — NEVER via teleconsult
- Any drug requiring physical examination for safe prescription
- Medications for conditions requiring in-person assessment (fractures, surgical conditions, etc.)

### 5.3 Prescription Format
All prescriptions must include:
- Doctor's name, qualification, registration number
- Patient's name and age
- Date and time of consultation
- Drug name (generic preferred), dosage, frequency, duration
- "Issued via teleconsultation" notation
- Platform-generated prescription ID for audit trail

## 6. Emergency Escalation Protocol

### 6.1 Red-Flag Symptoms (Require Immediate Escalation)
- Chest pain or pressure
- Shortness of breath / difficulty breathing
- Signs of stroke (sudden weakness, speech difficulty, facial droop)
- Seizure or loss of consciousness
- Active bleeding that won't stop
- Suicidal ideation or self-harm intent
- Severe allergic reaction (anaphylaxis)
- Pregnancy-related bleeding or severe pain
- High fever (>104°F / 40°C) in children under 5

### 6.2 Escalation Steps
1. **AI Triage Detection:** If AI triage flags severity as "high", display emergency banner:
   > "⚠️ Your symptoms may indicate a medical emergency. Please call 112 (India national emergency) or visit your nearest hospital emergency department immediately. Do not wait for an online consultation."
2. **Doctor Detection:** If during consultation a doctor identifies emergency-level symptoms:
   - Instruct patient to call 112 or go to nearest ER
   - Document escalation in consultation record
   - Mark consultation status as "escalated — emergency"
   - Follow up within 24 hours if possible
3. **Platform Intervention:** If a doctor is unavailable and AI detects emergency, system:
   - Shows emergency banner with 112 number
   - Logs the event in `audit_events`
   - Does NOT attempt AI diagnosis or treatment suggestion

### 6.3 Post-Escalation Documentation
- All escalation events logged with timestamp, trigger, and actions taken
- Escalation events reviewed weekly by clinical operations lead
- Patterns analyzed monthly for AI model improvement and protocol refinement

## 7. Documentation and Audit Requirements

- All consultations must have a complete record within 24 hours of closure
- Consultation records retained for minimum 3 years (Telemedicine Guidelines requirement)
- Audit logs capture: consultation create/assign/complete timestamps, prescription issuance, escalation events
- Monthly audit of random 5% of closed consultations for quality assurance

## 8. Quality Metrics

| Metric | Target | Review Frequency |
|--------|--------|-----------------|
| Average consultation response time | < 30 minutes during operating hours | Weekly |
| Consultation completion rate | > 95% | Weekly |
| Patient satisfaction (post-consult survey) | > 4.0/5.0 | Monthly |
| Emergency escalation accuracy | > 99% (no missed emergencies) | Monthly |
| Prescription compliance with boundaries | 100% | Monthly |

## 9. Non-Compliance

- Departure from prescription boundaries: Immediate account suspension pending review
- Failure to escalate emergency symptoms: Incident report + mandatory remediation
- Incomplete consultation documentation: Warning → remediation → potential suspension
- Breach of patient confidentiality: Immediate suspension + legal review

---

**Sign-off Required:**
- [ ] Clinical Advisor / Medical Director
- [ ] Legal Counsel
- [ ] Platform Operations Lead
