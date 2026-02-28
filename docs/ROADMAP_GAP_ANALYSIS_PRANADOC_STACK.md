# Roadmap Gap Analysis (PranaDoc-Style Stack)

Date: 2026-02-28

Legend:
- `implemented`: already in this repo
- `partial`: base exists, production-grade version still needed
- `not started`: not implemented yet
- `not needed now`: can be deferred for current phase

## 1) Core Architecture: "Always-On" Blueprint

| Recommendation | Status | Needed Now? | Evidence in Repo | What Next |
|---|---|---|---|---|
| Modular, event-driven microservices architecture | `partial` | `not needed now` for MVP, `needed` for scale | Next.js app + separate Python ML service + modular server libs | Split ingestion/reasoning/monitoring into independently deployable services before scale-up |
| Wearable ingestion via Junction/Terra | `partial` | `needed` if wearable feature is in V1 | `src/lib/server/integrations/wearables.ts`, `/api/integrations/wearables/sync` with provider-aware fallback | Add real Terra/Junction API wiring and production webhook/cron sync |
| EHR ingestion via Fasten/Particle | `partial` | `needed` for EHR parity | `src/lib/server/integrations/ehr.ts`, `/api/integrations/ehr/sync` with provider-aware fallback | Add real Fasten/Particle/Medplum connector auth and patient-level sync flows |
| Backend stack (Node/FastAPI) | `implemented` | `needed` | Next.js APIs + `ml/triage_service` FastAPI | Keep; split workloads over time |
| HL7 FHIR R4 internal model | `partial` | `needed` (start early) | `src/lib/server/fhir/types.ts`, `src/lib/server/fhir/mappers.ts`, normalized FHIR payloads in `health_records` | Extend to full resource coverage and strict FHIR validation |

## 2) AI Reasoning Layer: RAG + Clinical Drift

| Recommendation | Status | Needed Now? | Evidence in Repo | What Next |
|---|---|---|---|---|
| RAG architecture (retrieval before response) | `partial` | `needed` before broad medical claims | `src/lib/server/clinical-knowledge.ts` now retrieves evidence before triage generation | Replace local lexical retrieval with production vector search + curated guideline ingestion pipeline |
| Vector DB (Qdrant/Chroma) | `partial` | `needed` for RAG | Vector-ready env + provider call path exists (`VECTOR_DB_*`) with local fallback | Configure and connect chosen vector DB in production |
| Source-attributed responses | `partial` | `needed` for clinician trust | Triage response now includes `rationale` + `citations` from retrieval | Tie citations to versioned clinical guideline corpus and clinician review workflow |
| Signal processing drift engine (rolling trends/anomalies) | `partial` | `needed` for always-on monitoring | `src/lib/server/monitoring/drift.ts` + `/api/monitoring/drift/run` implemented | Add scheduler/background jobs, threshold tuning, doctor queue routing |

## 3) Compliance Engineering: Privacy-by-Design

| Recommendation | Status | Needed Now? | Evidence in Repo | What Next |
|---|---|---|---|---|
| VPC isolation | `not started` | `needed` before PHI production | No cloud infra repo/deployment config for VPC yet | Decide cloud account and deploy topology |
| RBAC with restricted roles | `partial` | `needed` | `profiles.role`, doctor/admin gating, RLS present | Add admin policy management + stricter scoped permissions |
| Break-the-glass protocol | `not started` | `needed` before production clinical ops | No emergency override workflow yet | Add audited emergency-access flow |
| BAA-backed zero-retention AI provider setup | `not started` | `needed` before PHI to external AI | No signed BAA/retention enforcement config in infra yet | Choose provider (Azure OpenAI etc.), sign BAAs, enforce retention policy |
| PHI de-identification pipeline | `partial` | `needed` when external LLM sees notes | `src/lib/server/deidentify.ts` now redacts high-risk tokens before OpenAI path | Expand de-id to structured notes/docs and add QA tests for recall/precision |
| Audit logging | `implemented` | `needed` | `audit_events` table + consult + ingestion + drift audit writes | Expand to all sensitive read/write events |

## 4) Phase Roadmap Readiness

| Phase | Current State | Status |
|---|---|---|
| Phase 1: Compliance + Infrastructure baseline | App-level security + RLS + CSRF + partial de-id implemented | `partial` |
| Phase 2: Ingestion interoperability (wearables/EHR/ABDM rails) | Wearable/EHR sync scaffolding and FHIR mapping now implemented in mock/live-ready mode | `partial` |
| Phase 3: RAG reasoning and clinician rationale | Retrieval + citations + rationale now live in triage API | `partial` |
| Phase 4: Clinical drift monitoring | Drift analytics endpoint and alert generation implemented | `partial` |
| Phase 5: Human-loop doctor conveyor belt | Doctor queue/assignment/completion implemented | `implemented` |

## 5) Specialized Recommendations

| Recommendation | Status | Needed Now? | Notes |
|---|---|---|---|
| Medplum as headless FHIR EHR | `not started` | `decision needed` | Optional path; could reduce custom FHIR backend work |
| India ABDM/ABHA integration | `not started` | `needed` for India-native interoperability strategy | Requires ABDM sandbox onboarding and API implementation |
| Explainable AI (show evidence before output) | `partial` | `needed` | `rationale` + `citations` now included; still needs clinician-validated evidence governance |
| Report scanning optionality | `partial` | `needed` for richer records intake | `/api/reports/scan` + `/health-records` text-based scan implemented; OCR for PDF/image pending |

## Bottom Line
- Platform baseline is now stronger: core product flow + ingestion scaffolding + FHIR normalization + retrieval-grounded triage + drift monitoring.
- Biggest remaining gaps are production integrations (real provider APIs), cloud/compliance hardening (VPC/BAA), and India interoperability rails (ABDM/ABHA).
- These remaining items are founder-input dependent and tracked in `docs/FOUNDER_INPUT_TRACKER.md`.
