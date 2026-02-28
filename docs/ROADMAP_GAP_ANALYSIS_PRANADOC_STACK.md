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
| Modular, event-driven microservices architecture | `partial` | `not needed now` for MVP, `needed` for scale | Next.js monolith + separate Python ML service | Split into services for ingestion, reasoning, monitoring before scale-up |
| Wearable ingestion via Junction/Terra | `not started` | `needed` if wearable feature is in V1 | No Junction/Terra integration code found | Choose provider, add ingestion worker + data mapping |
| EHR ingestion via Fasten/Particle | `not started` | `needed` for EHR parity | No Fasten/Particle integration code found | Choose provider, add connector and mapping pipeline |
| Backend stack (Node/FastAPI) | `implemented` | `needed` | Next.js APIs + `ml/triage_service` FastAPI | Keep; split workloads over time |
| HL7 FHIR R4 internal model | `not started` | `needed` (should start early) | Current schema is app-specific, not FHIR R4 resource model | Add FHIR-oriented storage model + mapping layer |

## 2) AI Reasoning Layer: RAG + Clinical Drift

| Recommendation | Status | Needed Now? | Evidence in Repo | What Next |
|---|---|---|---|---|
| RAG architecture (retrieval before response) | `not started` | `needed` before broad medical claims | `runTriage` is ML/OpenAI/fallback, no retriever | Add guideline ingestion + retrieval pipeline |
| Vector DB (Qdrant/Chroma) | `not started` | `needed` for RAG | No vector DB integration found | Choose DB, add embedding + retrieval service |
| Source-attributed responses | `not started` | `needed` for clinician trust | No citation payload in triage API response | Add response schema with evidence references |
| Signal processing drift engine (rolling trends/anomalies) | `partial` | `needed` for always-on monitoring | Python triage service exists, but no rolling wearable drift analytics | Add time-series anomaly service and event publisher |

## 3) Compliance Engineering: Privacy-by-Design

| Recommendation | Status | Needed Now? | Evidence in Repo | What Next |
|---|---|---|---|---|
| VPC isolation | `not started` | `needed` before PHI production | No cloud infra repo/deployment config for VPC yet | Decide cloud account and deploy topology |
| RBAC with restricted roles | `partial` | `needed` | `profiles.role`, doctor/admin gating, RLS present | Add admin policy management + stricter scoped permissions |
| Break-the-glass protocol | `not started` | `needed` before production clinical ops | No emergency override workflow yet | Add audited emergency-access flow |
| BAA-backed zero-retention AI provider setup | `not started` | `needed` before PHI to external AI | No BAA/retention enforcement config yet | Choose provider (Azure OpenAI etc.), sign BAAs, enforce retention policy |
| PHI de-identification pipeline | `not started` | `needed` when external LLM sees notes | No redaction stage in prompt pipeline | Add de-id preprocessor before AI calls |
| Audit logging | `implemented` | `needed` | `audit_events` table + writes in consult APIs | Expand to all sensitive read/write events |

## 4) Phase Roadmap Readiness

| Phase | Current State | Status |
|---|---|---|
| Phase 1: Compliance + Infrastructure baseline | App-level security and DB RLS started | `partial` |
| Phase 2: Ingestion interoperability (wearables/EHR/ABDM rails) | Connectors not yet built | `not started` |
| Phase 3: RAG reasoning and clinician rationale | Triage exists, RAG/citations missing | `partial` |
| Phase 4: Clinical drift monitoring | No full time-series drift pipeline yet | `not started` |
| Phase 5: Human-loop doctor conveyor belt | Doctor queue/assignment/completion implemented | `implemented` |

## 5) Specialized Recommendations

| Recommendation | Status | Needed Now? | Notes |
|---|---|---|---|
| Medplum as headless FHIR EHR | `not started` | `decision needed` | Optional path; could reduce custom FHIR backend work |
| India ABDM/ABHA integration | `not started` | `needed` for India-native interoperability strategy | Requires ABDM sandbox onboarding and API implementation |
| Explainable AI (show evidence before output) | `partial` | `needed` | Current triage gives recommendation/red flags but not explicit source evidence |

## Bottom Line
- Strong baseline is built for product flow (auth, consults, doctor loop, billing scaffolding, triage service).
- Biggest missing pieces for your pasted roadmap are interoperability (FHIR connectors), RAG evidence layer, and production compliance infrastructure.
- These are all feasible next, but require provider/cloud/legal decisions and credentials.
