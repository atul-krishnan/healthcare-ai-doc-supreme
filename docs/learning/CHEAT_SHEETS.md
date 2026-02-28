# Cheat Sheets

Use this document during design reviews, sprint planning, and incident response.

## 1) Health-Tech System Design Checklist

Before shipping a feature, verify:
- Problem boundary is clear: what the feature must do and must not do
- Data contract is explicit: input schema, output schema, error states
- Access control is least-privilege by role
- Audit trail exists for sensitive reads/writes
- Failure behavior is safe: retries, fallback, user-visible handling
- Monitoring is configured: logs, metrics, alerts, owner
- Rollback path is defined and tested

## 2) AI Feature Safety Checklist

For any model-powered feature:
- Intended use and out-of-scope use are written
- Ground truth and label policy are documented
- Evaluation includes clinically meaningful slices
- Confidence or abstention behavior is defined
- Red-flag escalation path exists
- Human override path is clear
- Prompt and policy changes are versioned
- Model card is updated after each major change

## 3) Compliance-to-Control Mapping

Translate requirements into implementation:
- Data minimization:
  - Collect only required fields
  - Enforce schema-level validation
- Purpose limitation:
  - Tag each field with approved use
  - Block secondary use by default
- Access governance:
  - Role-based policies + row-level controls
  - Regular access review log
- Security:
  - Encryption in transit and at rest
  - Secret rotation and key custody policy
- Accountability:
  - Immutable audit events for critical actions
  - Change approval and release records
- User rights handling:
  - Access/correction/deletion workflow
  - SLA tracking for each request

## 4) Clinical Essentials (Non-Clinician)

You are not training to diagnose. You are training to build safe systems around clinical work.

Core concepts:
- Chief complaint: the primary patient-reported issue
- History of present illness: timeline and context of symptoms
- Differential diagnosis: possible explanations ranked by likelihood/risk
- Red flag: signal suggesting possible severe or time-critical condition
- Contraindication: condition where an intervention may be harmful
- Escalation: routing to higher urgency care pathway

Safe triage framing:
- Emergency: immediate emergency services direction
- Urgent: same-day clinician attention
- Routine: standard appointment window
- Self-care: low-risk symptom support with clear return precautions

Never-autonomous actions for AI assistant:
- Final diagnosis
- Prescription or dose instructions
- Advice that delays emergency care when red flags are present
- Definitive reassurance without uncertainty disclosure

## 5) Evidence Pack Quick List

Keep these artifacts current:
- Architecture diagram and data flow
- Threat model and hazard log
- Data inventory and retention map
- Model card and evaluation reports
- Incident response runbook and past incident reports
- Access review logs and policy approvals

## 6) Weekly Self-Review Prompts

Ask yourself:
- What failure would most likely harm a patient if this feature is wrong?
- What assumptions are currently untested?
- Which alert would tell us we are failing in production?
- If audited tomorrow, what evidence is missing?
- If a clinician challenged this output, can we explain how it was produced?

