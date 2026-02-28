# Incident Response Plan

**Version:** 1.0  
**Date:** February 2026  
**Status:** DRAFT — Requires management sign-off before production use

---

## 1. Purpose

This plan defines how YourDoc responds to security incidents, data breaches, system outages, and clinical safety events. Compliance target: **CERT-In 6-hour breach notification requirement** and DPDPA reporting obligations.

## 2. Definitions

| Term | Definition |
|------|-----------|
| **Security Incident** | Unauthorized access, disclosure, alteration, or destruction of data or systems |
| **Data Breach** | A security incident involving personal data or personal health information (PHI) |
| **Clinical Safety Event** | An incident where AI or platform behavior could result in patient harm |
| **Severity 1 (Critical)** | Data breach affecting PHI, complete platform outage, or clinical safety event |
| **Severity 2 (High)** | Partial service disruption, unauthorized access attempt, or AI degradation |
| **Severity 3 (Medium)** | Minor security issue, single-user data anomaly, non-critical bug |
| **Severity 4 (Low)** | Informational alert, policy violation without data impact |

## 3. Incident Response Team

| Role | Responsibility | Contact |
|------|---------------|---------|
| **Incident Commander** | Overall coordination and decision-making | [Founder / CTO] |
| **Technical Lead** | Investigation, containment, and remediation | [Lead Engineer] |
| **Clinical Lead** | Assessment of patient safety implications | [Medical Director] |
| **Communications Lead** | User notification, regulatory reporting | [Founder / Operations] |
| **Legal Counsel** | Regulatory compliance guidance | [External Counsel] |

## 4. Response Phases

### Phase 1: Detection and Identification (0-30 min)
1. Alert received via:
   - Sentry error monitoring
   - Supabase audit logs
   - User report
   - Automated health checks
   - Log anomaly detection
2. Incident Commander notified
3. Initial severity classification (S1-S4)
4. Incident ticket created with timestamp

### Phase 2: Containment (30 min - 2 hr)
1. **Immediate containment:**
   - Revoke compromised credentials
   - Block suspicious IPs
   - Disable affected API endpoints if necessary
   - Isolate affected systems
2. **Short-term containment:**
   - Deploy hotfix if applicable
   - Enable enhanced logging
   - Preserve evidence (database snapshots, logs)

### Phase 3: Notification (within 6 hours for S1/S2)

#### CERT-In Notification (Mandatory for S1/S2)
- **Deadline:** Within 6 hours of becoming aware of the incident
- **Channel:** Email to incident@cert-in.org.in
- **Content:** Nature of incident, systems affected, initial impact assessment, remediation steps taken
- **Follow-up:** Detailed report within 14 days

#### Data Protection Board (if PHI breach under DPDPA)
- Notify the Data Protection Board of India as required under Section 8 of DPDPA
- Notify affected data principals (users) without unreasonable delay

#### User Notification (for data breaches)
- In-app banner + email to affected users
- Plain language explanation of what happened, what data was affected, and what actions users should take

### Phase 4: Eradication (2-24 hr)
1. Root cause identification
2. Remove attacker access / fix vulnerability
3. Patch and harden affected systems
4. Verify no residual compromise

### Phase 5: Recovery (24-72 hr)
1. Restore services from clean backups if needed
2. Monitor for re-occurrence
3. Gradually re-enable affected features
4. Confirm system integrity

### Phase 6: Post-Incident Review (within 7 days)
1. Conduct blameless post-mortem
2. Document:
   - Timeline of events
   - Root cause analysis
   - What worked well
   - What needs improvement
   - Action items with owners and deadlines
3. Update security controls, monitoring alerts, and this plan as needed
4. Share lessons learned with team

## 5. Clinical Safety Event Protocol

### When AI produces a potentially harmful output:
1. Immediately flag the triage session in `audit_events`
2. If patient has acted on the guidance:
   - Contact patient directly (phone if available, otherwise email)
   - Arrange complimentary doctor consultation for review
3. Investigate AI output chain:
   - Review triage input/output
   - Check clinical knowledge retrieval results
   - Test for reproducibility
4. If systematic issue confirmed:
   - Disable affected AI pathway (fallback to conservative heuristic)
   - Notify all patients who received similar outputs in last 7 days
   - Remediate and re-test before re-enabling

## 6. Communication Templates

### Internal Escalation
```
[SEVERITY X] Incident detected at [TIME]
Type: [Security/Data Breach/Clinical Safety/Outage]
Affected: [Systems/Users/Data]
Initial assessment: [Brief description]
Current status: [Investigating/Contained/Resolved]
Action needed from: [Names/Roles]
```

### User Notification (Data Breach)
```
Subject: Important Security Notice from YourDoc

We are writing to inform you of a security incident that may have
affected your account. [Description of what happened].

What was affected: [Specific data types]
What we've done: [Containment and remediation steps]
What you should do: [Recommended actions]

We take the security of your health data extremely seriously and
sincerely apologize for this incident. If you have any questions,
please contact us at security@yourdoc.com.
```

## 7. Testing and Maintenance

- **Tabletop exercise:** Quarterly simulation of S1 incident
- **Plan review:** Every 6 months or after any S1/S2 incident
- **Contact list update:** Monthly verification of all team contacts
- **Backup restore test:** Quarterly verification of backup integrity

---

**Sign-off Required:**
- [ ] Incident Commander (Founder / CTO)
- [ ] Legal Counsel
- [ ] Clinical Lead (when appointed)
