import OpenAI from "openai";
import { z } from "zod";
import { env, hasOpenAIEnv } from "@/lib/env";

export const triageRequestSchema = z.object({
  symptomText: z.string().min(10),
  age: z.number().int().min(0).max(120).optional(),
  durationDays: z.number().int().min(0).max(365).optional(),
  hasChronicConditions: z.boolean().default(false),
  isPregnant: z.boolean().default(false),
});

const triageResponseSchema = z.object({
  severity: z.enum(["low", "medium", "high"]),
  recommendation: z.string().min(10),
  redFlags: z.array(z.string()).default([]),
});

const mlServiceResponseSchema = triageResponseSchema.extend({
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

function fallbackTriage(input: TriageInput): TriageOutput {
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

  return {
    severity,
    recommendation: recommendationBySeverity[severity],
    redFlags:
      foundFlags.length > 0
        ? foundFlags
        : severity === "high"
          ? ["Urgent clinical evaluation needed"]
          : [],
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
  const pythonResult = await runPythonMlTriage(input);
  if (pythonResult) {
    return pythonResult;
  }

  if (!hasOpenAIEnv) {
    return {
      output: fallbackTriage(input),
      model: "heuristic-fallback",
    };
  }

  const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a conservative telemedicine triage assistant. Never provide diagnosis certainty. Return strict JSON with keys severity, recommendation, redFlags. Severity must be low, medium, or high.",
        },
        {
          role: "user",
          content: JSON.stringify(input),
        },
      ],
    });

    const content = completion.choices[0]?.message.content;
    if (!content) {
      throw new Error("Missing completion content");
    }

    const parsed = triageResponseSchema.parse(JSON.parse(content));

    return {
      output: parsed,
      model: completion.model,
    };
  } catch {
    return {
      output: fallbackTriage(input),
      model: "heuristic-fallback",
    };
  }
}
