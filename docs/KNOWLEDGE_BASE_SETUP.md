# Knowledge Base Setup (MVP V1)

Date: 2026-02-28

This file defines the practical V1 knowledge strategy for YourDoc, aligned to your request for PranaDoc-style functionality with safer LLM grounding.

## What is implemented now

## 1) Source-of-truth corpus in repo
- Folder: `knowledge-base/clinical/`
- Current seed docs:
  - `urgent-care-red-flags.md`
  - `pregnancy-safety-escalation.md`
  - `chronic-care-monitoring.md`

## 2) Retrieval layer in backend
- Loader: `src/lib/server/knowledge-base.ts`
  - Reads markdown from `knowledge-base/clinical`
  - Builds chunks with title/source/tags/content
- Retriever: `src/lib/server/clinical-knowledge.ts`
  - Vector mode when `VECTOR_DB_*` is configured
  - Local lexical fallback when vector infra is missing

## 3) LLM grounding usage
- Triage: `src/lib/server/triage.ts`
  - Retrieves evidence before response
  - Returns `rationale` and `citations`
- Chat assistant: `src/lib/server/chat-assistant.ts`
  - Retrieves evidence for conversation replies

## 4) Knowledge API + UI
- API: `POST /api/knowledge/search`
- UI page: `/knowledge-base`
  - Allows testing the retriever and seeing citations + scores

## Recommended V1 operating model

## A) Corpus design
1. Keep guidelines in plain markdown files per topic.
2. Add one file per clinical domain (respiratory, GI, dermatology, pediatrics, chronic disease, pregnancy).
3. Keep each section short and operational (triage trigger -> action).

## B) Retrieval policy
1. Always retrieve before generating clinical response.
2. Return top 2-5 citations to user/doctor-facing UI.
3. If zero confident hits, answer conservatively and force escalation guidance.

## C) Governance
1. Every KB file should include:
   - owner (clinical reviewer)
   - last review date
   - source references
2. Treat KB edits like code changes with PR review.
3. Revalidate prompts after KB update.

## D) When to switch to vector infra
Use local lexical mode during early MVP.
Switch to vector mode once any of these happens:
1. >100 guideline chunks
2. multi-lingual content
3. need richer metadata filters (specialty, country, age-group)

## External research references (primary)
1. Chroma intro docs (retrieval capabilities: embeddings + metadata filtering + hybrid/full-text):
   - https://docs.trychroma.com/docs/overview/introduction
2. Qdrant docs (AI-native vector DB + filtering/search concepts):
   - https://qdrant.tech/documentation/
3. Medplum docs (headless EHR model and FHIR datastore workflows):
   - https://www.medplum.com/docs
4. Azure OpenAI data privacy notes (customer data handling / training boundaries):
   - https://learn.microsoft.com/en-us/azure/foundry/responsible-ai/openai/data-privacy
5. OpenAI enterprise privacy commitments (ownership/control defaults):
   - https://openai.com/enterprise-privacy/

## Founder decision for V1
Choose one vector provider for production track:
1. `Qdrant` if you want high-control self-hosting and mature filtering/scaling controls.
2. `Chroma` if you want simple developer experience and fast iteration.

Both are already supported in current app architecture via `VECTOR_DB_PROVIDER` + `VECTOR_DB_URL`.
