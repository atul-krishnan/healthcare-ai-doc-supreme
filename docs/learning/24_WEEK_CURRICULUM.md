# 24-Week Curriculum

This curriculum assumes you are building and operating a real healthcare AI product, not just studying theory.

Each week has:
- Focus
- What to learn
- Hands-on build task
- Required output artifact

## Phase 1 (Weeks 1-6): Tech Foundations for Health Systems

### Week 1: Web and Backend Systems Thinking
- Learn:
  - HTTP lifecycle, API contracts, auth/session basics
  - Monolith vs modular service tradeoffs
  - Failure modes in patient-facing flows
- Build:
  - Trace one complete request path in this app from UI to DB
- Artifact:
  - `Request lifecycle note` with bottlenecks and risks

### Week 2: Data Modeling and Access Control
- Learn:
  - Relational modeling, normalization, schema evolution
  - Role-based access and row-level security concepts
  - Auditability requirements for healthcare records
- Build:
  - Review all patient/doctor tables and map who can read/write each
- Artifact:
  - `Access control matrix` by role and table

### Week 3: APIs, Integrations, and Reliability
- Learn:
  - Idempotency, retries, timeouts, dead-letter handling
  - Webhooks and eventual consistency
  - Integration failure patterns (billing, EHR, wearables)
- Build:
  - Add and test one failure-handling improvement for an integration route
- Artifact:
  - `Reliability checklist` + test evidence

### Week 4: Observability and Incident Handling
- Learn:
  - Logs, metrics, traces, SLOs, error budgets
  - Alert quality and runbook design
  - Clinical operations impact of outages
- Build:
  - Define top 5 alerts for consultation, triage, and billing flows
- Artifact:
  - `Alert map` with severity and owner

### Week 5: Security Engineering Basics
- Learn:
  - Threat modeling, least privilege, secrets handling
  - Common web risks: auth bypass, injection, insecure storage
  - Security testing scope in product releases
- Build:
  - Run a security checklist across auth, uploads, and public endpoints
- Artifact:
  - `Threat model v1` with mitigations

### Week 6: Product Analytics for Safety + Growth
- Learn:
  - Core event taxonomy and funnel instrumentation
  - Distinguishing safety metrics from growth metrics
  - Designing trustworthy experiments in healthcare UX
- Build:
  - Define events from symptom start to consultation completion
- Artifact:
  - `Event taxonomy` + `north-star metric tree`

## Phase 2 (Weeks 7-12): AI Engineering and Safety

### Week 7: ML Fundamentals for Product Leaders
- Learn:
  - Supervised learning basics, bias-variance, class imbalance
  - Metrics: precision, recall, F1, AUROC, calibration
  - Why healthcare tasks need threshold tuning
- Build:
  - Review current triage model output and define success metrics
- Artifact:
  - `Model KPI spec` with acceptable thresholds

### Week 8: LLM Product Patterns
- Learn:
  - Prompting, structured output, retrieval grounding
  - Hallucination risks and mitigation patterns
  - Human-in-the-loop decision boundaries
- Build:
  - Add stricter output schema checks for triage response
- Artifact:
  - `LLM guardrail spec` with failure examples

### Week 9: Data Pipelines and Label Quality
- Learn:
  - Dataset design, labeling policy, leakage prevention
  - Data versioning and provenance
  - Synthetic data caveats in clinical domains
- Build:
  - Draft labeling guidelines for triage outcomes
- Artifact:
  - `Labeling policy` and adjudication rules

### Week 10: Evaluation and Validation
- Learn:
  - Offline vs online evaluation
  - Slice-based error analysis
  - Confidence scoring and abstention strategies
- Build:
  - Create test slices by age, symptom cluster, and urgency
- Artifact:
  - `Evaluation report v1` with risky slices

### Week 11: MLOps and Model Operations
- Learn:
  - Model versioning, rollout strategies, rollback rules
  - Drift detection and retraining triggers
  - Monitoring for false reassurance and over-triage
- Build:
  - Define a staged rollout plan for model updates
- Artifact:
  - `Model rollout + rollback runbook`

### Week 12: Responsible AI and Governance
- Learn:
  - Fairness, explainability, traceability, accountability
  - Model cards and decision logs
  - Governance board review rituals
- Build:
  - Draft a model card for current triage implementation
- Artifact:
  - `Model card v1` + governance checklist

## Phase 3 (Weeks 13-18): Compliance and Regulated Execution

### Week 13: Privacy by Design
- Learn:
  - Data classification and minimization
  - Purpose limitation and retention strategy
  - Consent and legal basis mapping
- Build:
  - Map every collected field to purpose and retention period
- Artifact:
  - `Data inventory and retention matrix`

### Week 14: Regulatory Landscape Mapping
- Learn:
  - Compare launch jurisdictions and their privacy obligations
  - Processor vs controller roles and vendor risk
  - Cross-border data transfer constraints
- Build:
  - Create compliance obligations table by target market
- Artifact:
  - `Jurisdiction obligations matrix`

### Week 15: Clinical AI Regulatory Positioning
- Learn:
  - Decision-support vs diagnostic-device positioning
  - Risk class concepts and intended-use statements
  - Documentation expected for regulated software
- Build:
  - Write intended-use and out-of-scope statements for AI features
- Artifact:
  - `Intended use dossier v1`

### Week 16: Risk Management and Safety Cases
- Learn:
  - Hazard identification, severity/probability scoring
  - Control verification and residual risk acceptance
  - Safety case narrative structure
- Build:
  - Run one hazard workshop for AI triage flow
- Artifact:
  - `Hazard log v1` with control mapping

### Week 17: Audit Readiness and Evidence
- Learn:
  - What evidence auditors and partners ask for
  - Change logs, approvals, training records, test evidence
  - How to keep evidence generation low-friction
- Build:
  - Build a minimal evidence folder structure
- Artifact:
  - `Audit evidence index` with file ownership

### Week 18: Breach and Incident Response Drills
- Learn:
  - Security incident lifecycle and communication plan
  - Impact assessment and notification requirements
  - Corrective and preventive action loops
- Build:
  - Tabletop exercise: unauthorized PHI access scenario
- Artifact:
  - `Incident report template` + postmortem checklist

## Phase 4 (Weeks 19-24): Essential Clinical Knowledge + Leadership

### Week 19: Clinical Workflow Literacy
- Learn:
  - Patient journey, triage, consult, follow-up workflows
  - SOAP-style documentation basics
  - Hand-off quality between AI and clinician
- Build:
  - Convert one AI output into clinician-ready SOAP format
- Artifact:
  - `Clinical handoff template`

### Week 20: Triage and Red-Flag Thinking
- Learn:
  - Urgency ladder: emergency, urgent, routine, self-care
  - What constitutes a red flag in symptom reports
  - Safe escalation and refusal-to-advise patterns
- Build:
  - Add red-flag escalation checks to triage prompt/pipeline
- Artifact:
  - `Escalation policy v1`

### Week 21: Medication and Safety Basics (Non-Prescribing)
- Learn:
  - Medication classes, contraindication awareness basics
  - Adherence and side-effect monitoring concepts
  - Why dose recommendations require clinician oversight
- Build:
  - Add a hard constraint against autonomous prescribing advice
- Artifact:
  - `Medication safety boundary policy`

### Week 22: Provider Operations and Quality
- Learn:
  - Clinical QA loops, peer review, escalation QA
  - Capacity planning and queue balancing
  - Quality and safety KPI dashboards
- Build:
  - Define weekly clinical quality review agenda and metrics
- Artifact:
  - `Clinical QA scorecard`

### Week 23: Health-Tech Economics and Strategy
- Learn:
  - Unit economics (CAC, retention, consult margin)
  - Payer/provider/patient incentive alignment
  - Risk of growth tactics that erode trust
- Build:
  - Build a one-page operating model for your launch market
- Artifact:
  - `Unit economics model v1`

### Week 24: Capstone Integration Week
- Learn:
  - Integrating tech, AI, compliance, and clinical controls
  - Executive communication for partners/investors/regulators
- Build:
  - Complete capstone package and review against rubric
- Artifact:
  - `Capstone dossier` (see assessment doc)

## Completion Criteria

You are ready to claim practical expertise when you can:
- Explain architecture and safety tradeoffs without hand-waving
- Show concrete evidence of controls, not only policies
- Defend model evaluation methodology and limits
- Demonstrate clinical escalation boundaries that reduce harm
- Run incidents and audits with repeatable, documented process

