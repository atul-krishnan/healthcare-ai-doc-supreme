import { z } from "zod";
import { env } from "@/lib/env";
import { getKnowledgeBaseChunks, type KnowledgeChunk } from "@/lib/server/knowledge-base";

export type EvidenceCitation = {
  title: string;
  source: string;
  snippet: string;
  score: number;
};

type RetrievalResult = {
  citations: EvidenceCitation[];
  retriever: "vector" | "local-lexical";
};

const fallbackGuidelineChunks: KnowledgeChunk[] = [
  {
    id: "guideline-chestpain-001",
    title: "Chest pain and dyspnea triage",
    source: "Internal clinical protocol v1",
    tags: ["cardiac", "emergency", "chest pain", "breathlessness"],
    content:
      "Chest pain with shortness of breath, syncope, or radiation to jaw/arm should be treated as high-risk and escalated for urgent in-person evaluation.",
  },
  {
    id: "guideline-fever-002",
    title: "Fever adult tele-triage",
    source: "Internal clinical protocol v1",
    tags: ["fever", "infection", "monitoring"],
    content:
      "Fever without red flags can be managed with hydration and monitoring. Escalate when persistent beyond 72 hours, severe weakness, altered mental status, or dehydration are present.",
  },
  {
    id: "guideline-pregnancy-003",
    title: "Pregnancy symptom safety escalation",
    source: "Internal obstetric triage note",
    tags: ["pregnancy", "bleeding", "safety"],
    content:
      "Pregnancy-associated bleeding, severe abdominal pain, or reduced fetal movement should trigger urgent in-person review and not rely only on remote advice.",
  },
  {
    id: "guideline-respiratory-004",
    title: "Respiratory infection risk monitoring",
    source: "Internal clinical protocol v1",
    tags: ["cough", "breathing", "oxygen"],
    content:
      "Persistent cough with breathlessness, oxygen desaturation, or progressive fatigue should be upgraded from routine teleconsult to urgent clinical review.",
  },
  {
    id: "guideline-hypertension-005",
    title: "Hypertension and medication adherence",
    source: "Primary care chronic protocol",
    tags: ["hypertension", "blood pressure", "chronic"],
    content:
      "Patients with chronic hypertension and new symptoms should be reviewed by a clinician within 24 hours, especially when medications were missed or blood pressure trends worsen.",
  },
  {
    id: "guideline-wearables-006",
    title: "Wearable drift trigger thresholds",
    source: "Remote monitoring playbook",
    tags: ["wearables", "rhr", "spo2", "sleep", "hrv"],
    content:
      "A sustained 7-day rise in resting heart rate, drop in SpO2, or reduced sleep duration may indicate physiological stress and should trigger a clinician review workflow.",
  },
];

const vectorResponseSchema = z.object({
  results: z.array(
    z.object({
      title: z.string(),
      source: z.string(),
      snippet: z.string(),
      score: z.number(),
    }),
  ),
});

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

function lexicalScore(queryTokens: string[], chunk: KnowledgeChunk): number {
  if (queryTokens.length === 0) {
    return 0;
  }

  const haystack = `${chunk.title} ${chunk.content} ${chunk.tags.join(" ")}`.toLowerCase();
  let matches = 0;

  for (const token of queryTokens) {
    if (haystack.includes(token)) {
      matches += 1;
    }
  }

  return matches / queryTokens.length;
}

async function queryVectorProvider(query: string, limit: number): Promise<EvidenceCitation[] | null> {
  if (!env.VECTOR_DB_URL || !env.VECTOR_DB_PROVIDER) {
    return null;
  }

  try {
    const response = await fetch(`${env.VECTOR_DB_URL.replace(/\/$/, "")}/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(env.VECTOR_DB_API_KEY ? { Authorization: `Bearer ${env.VECTOR_DB_API_KEY}` } : {}),
      },
      body: JSON.stringify({
        provider: env.VECTOR_DB_PROVIDER,
        query,
        limit,
      }),
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return null;
    }

    const payload = vectorResponseSchema.parse(await response.json());

    return payload.results.slice(0, limit).map((item) => ({
      title: item.title,
      source: item.source,
      snippet: item.snippet,
      score: item.score,
    }));
  } catch {
    return null;
  }
}

async function queryLocalKnowledgeBase(query: string, limit: number): Promise<EvidenceCitation[]> {
  const loaded = await getKnowledgeBaseChunks();
  const chunks = loaded.length > 0 ? loaded : fallbackGuidelineChunks;
  const queryTokens = tokenize(query);

  return chunks
    .map((chunk) => ({
      chunk,
      score: lexicalScore(queryTokens, chunk),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ chunk, score }) => ({
      title: chunk.title,
      source: chunk.source,
      snippet: chunk.content,
      score,
    }));
}

export async function retrieveClinicalEvidence(query: string, limit = 3): Promise<RetrievalResult> {
  const vectorCitations = await queryVectorProvider(query, limit);
  if (vectorCitations && vectorCitations.length > 0) {
    return {
      citations: vectorCitations,
      retriever: "vector",
    };
  }

  return {
    citations: await queryLocalKnowledgeBase(query, limit),
    retriever: "local-lexical",
  };
}

export function toPromptEvidenceBlock(citations: EvidenceCitation[]): string {
  if (citations.length === 0) {
    return "No guideline evidence retrieved.";
  }

  return citations
    .map((citation, index) => {
      const score = citation.score.toFixed(2);
      return `${index + 1}. ${citation.title} (${citation.source}, score=${score}): ${citation.snippet}`;
    })
    .join("\n");
}
