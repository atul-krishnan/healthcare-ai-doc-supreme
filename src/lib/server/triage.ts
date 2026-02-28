import { z } from "zod";
import { retrieveClinicalEvidence, toPromptEvidenceBlock, type EvidenceCitation } from "@/lib/server/clinical-knowledge";
import { deidentifyClinicalText } from "@/lib/server/deidentify";
import { env } from "@/lib/env";
import { getLlmConfig } from "@/lib/server/llm-client";

export const triageRequestSchema = z.object({
  symptomText: z.string().min(10),
  age: z.number().int().min(0).max(120).optional(),
  durationDays: z.number().int().min(0).max(365).optional(),
  hasChronicConditions: z.boolean().default(false),
  isPregnant: z.boolean().default(false),
});

const triageCitationSchema = z.object({
  title: z.string(),
  source: z.string(),
  snippet: z.string(),
});

const triageResponseSchema = z.object({
  severity: z.enum(["low", "medium", "high"]),
  recommendation: z.string().min(10),
  redFlags: z.array(z.string()).default([]),
  rationale: z.string().min(8),
  citations: z.array(triageCitationSchema).default([]),
});

const modelResponseSchema = triageResponseSchema.omit({
  citations: true,
});

const mlServiceResponseSchema = z.object({
  severity: z.enum(["low", "medium", "high"]),
  recommendation: z.string().min(10),
  redFlags: z.array(z.string()).default([]),
  model: z.string().optional(),
});

type TriageInput = z.infer<typeof triageRequestSchema>;

type TriageOutput = z.infer<typeof triageResponseSchema>;

const emergencyKeywords = [
  "chest pain",
  "shortness of breath",
  "fainting",
  "seizure",
  "stroke",
  "bleeding",
  "unconscious",
  "suicidal",
  "pregnancy bleeding",
  "severe pain",
  "high fever",
];

function normalizeCitations(citations: EvidenceCitation[]): TriageOutput["citations"] {
  return citations.map((citation) => ({
    title: citation.title,
    source: citation.source,
    snippet: citation.snippet,
  }));
}

function fallbackTriage(input: TriageInput, citations: TriageOutput["citations"]): TriageOutput {
  const text = input.symptomText.toLowerCase();
  const foundFlags = emergencyKeywords.filter((keyword) => text.includes(keyword));

  let severity: "low" | "medium" | "high" = "low";

  if (foundFlags.length > 0) {
    severity = "high";
  } else if ((input.durationDays ?? 0) > 7 || input.hasChronicConditions || input.isPregnant) {
    severity = "medium";
  }

  const recommendationBySeverity: Record<typeof severity, string> = {
    low: "Symptoms appear low risk. Continue hydration and rest, monitor for worsening signs, and book a teleconsult if not improving in 24-48 hours.",
    medium:
      "Symptoms require clinician review soon. Schedule a doctor consultation within 24 hours and monitor for any red-flag progression.",
    high:
      "Potentially urgent symptoms detected. Seek immediate in-person medical care or emergency services and do not rely only on AI guidance.",
  };

  const rationaleBySeverity: Record<typeof severity, string> = {
    low: "No clear emergency triggers detected from symptom text and duration profile.",
    medium: "Prolonged symptoms or higher baseline clinical risk requires clinician assessment.",
    high: "Emergency-style symptom keywords were detected and escalation is required.",
  };

  return {
    severity,
    recommendation: recommendationBySeverity[severity],
    redFlags:
      foundFlags.length > 0
        ? foundFlags
        : severity === "high"
          ? ["Urgent clinical evaluation needed"]
          : [],
    rationale: rationaleBySeverity[severity],
    citations,
  };
}

async function runPythonMlTriage(input: TriageInput) {
  if (!env.TRIAGE_ML_SERVICE_URL) {
    return null;
  }

  try {
    const response = await fetch(`${env.TRIAGE_ML_SERVICE_URL}/triage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return null;
    }

    const payload = await response.json();
    const parsed = mlServiceResponseSchema.parse(payload);

    return {
      output: {
        severity: parsed.severity,
        recommendation: parsed.recommendation,
        redFlags: parsed.redFlags,
      },
      model: parsed.model ?? "python-ml-service",
    };
  } catch {
    return null;
  }
}

export async function runTriage(input: TriageInput) {
  const retrieval = await retrieveClinicalEvidence(input.symptomText, 3);
  const citations = normalizeCitations(retrieval.citations);

  const pythonResult = await runPythonMlTriage(input);
  if (pythonResult) {
    return {
      output: {
        ...pythonResult.output,
        rationale: "Prediction produced by statistical triage model and grounded using retrieved clinical references.",
        citations,
      },
      model: pythonResult.model,
      retriever: retrieval.retriever,
    };
  }

  const llm = getLlmConfig();
  if (!llm) {
    return {
      output: fallbackTriage(input, citations),
      model: "heuristic-fallback",
      retriever: retrieval.retriever,
    };
  }

  const deidentifiedSymptomText = deidentifyClinicalText(input.symptomText);
  const evidenceBlock = toPromptEvidenceBlock(retrieval.citations);

  try {
    const completion = await llm.client.chat.completions.create({
      model: llm.model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a conservative telemedicine triage assistant. Never provide diagnosis certainty. Return strict JSON with keys severity, recommendation, redFlags, rationale. Severity must be low, medium, or high.",
        },
        {
          role: "user",
          content: JSON.stringify({
            patientContext: {
              ...input,
              symptomText: deidentifiedSymptomText,
            },
            retrievedEvidence: evidenceBlock,
            rule: "If emergency risk is present, prefer high severity and immediate in-person care guidance.",
          }),
        },
      ],
    });

    const content = completion.choices[0]?.message.content;
    if (!content) {
      throw new Error("Missing completion content");
    }

    const parsed = modelResponseSchema.parse(JSON.parse(content));

    return {
      output: {
        ...parsed,
        citations,
      },
      model: completion.model ?? `${llm.provider}:${llm.model}`,
      retriever: retrieval.retriever,
    };
  } catch {
    return {
      output: fallbackTriage(input, citations),
      model: "heuristic-fallback",
      retriever: retrieval.retriever,
    };
  }
}
