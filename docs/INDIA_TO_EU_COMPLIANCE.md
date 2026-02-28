# India to EU Compliance Notes

## India (Initial Testing and Pilot)
- Engage legal counsel for telemedicine and e-pharmacy boundaries in India.
- Implement explicit medical disclaimers and emergency guidance.
- Log clinical escalation decisions for auditability.
- Restrict high-risk outputs: AI guidance is advisory, not definitive diagnosis.
- Enforce data minimization and role-based access in patient records.

## EU (After India Validation)
- Implement GDPR lawful basis mapping for every data category.
- Add consent records with revocation workflow.
- Implement data subject rights operations:
  - Access
  - Correction
  - Deletion
  - Portability
- Add regional data processing controls and retention policy engine.
- Execute DPIA before market entry in each EU target country.

## Platform Controls to Build Early
- Audit log table for sensitive reads and writes.
- Fine-grained access policies by role.
- Encryption at rest and in transit.
- Signed URLs for document access with short TTL.
- Incident response runbook and breach notification workflow.

## Decision Gates
1. India pilot quality gate
- Clinical safety incidents below threshold
- Stable uptime and billing reliability
- Counsel-approved patient terms

2. EU entry gate
- GDPR controls verified in staging
- Data map and DPA package complete
- Country-specific provider workflow signed off
