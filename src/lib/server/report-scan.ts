import { z } from "zod";
import { deidentifyClinicalText } from "@/lib/server/deidentify";
import { getLlmConfig } from "@/lib/server/llm-client";

type Finding = {
  name: string;
  value: string;
  interpretation: "normal" | "borderline" | "high" | "low" | "unknown";
  note: string;
};

export type ReportScanOutput = {
  summary: string;
  findings: Finding[];
  recommendedNextStep: string;
  model: string;
};

const scanSchema = z.object({
  summary: z.string().min(10),
  findings: z
    .array(
      z.object({
        name: z.string(),
        value: z.string(),
        interpretation: z.enum(["normal", "borderline", "high", "low", "unknown"]),
        note: z.string(),
      }),
    )
    .default([]),
  recommendedNextStep: z.string().min(10),
});

const patternRules = [
  {
    name: "HbA1c",
    regex: /(?:hba1c|glycated\s+hemoglobin)[^\d]*(\d+(?:\.\d+)?)/i,
    classify: (value: number): Finding["interpretation"] => {
      if (value >= 6.5) {
        return "high";
      }
      if (value >= 5.7) {
        return "borderline";
      }
      return "normal";
    },
    note: "Elevated HbA1c may indicate impaired glucose control.",
  },
  {
    name: "Fasting Glucose",
    regex: /(?:fasting\s+glucose|fbs)[^\d]*(\d+(?:\.\d+)?)/i,
    classify: (value: number): Finding["interpretation"] => {
      if (value >= 126) {
        return "high";
      }
      if (value >= 100) {
        return "borderline";
      }
      return "normal";
    },
    note: "High fasting glucose should be reviewed with your doctor.",
  },
  {
    name: "Hemoglobin",
    regex: /(?:hemoglobin|hb)[^\d]*(\d+(?:\.\d+)?)/i,
    classify: (value: number): Finding["interpretation"] => {
      if (value < 12) {
        return "low";
      }
      if (value > 17.5) {
        return "high";
      }
      return "normal";
    },
    note: "Hemoglobin outliers can require anemia/polycythemia evaluation.",
  },
  {
    name: "WBC",
    regex: /(?:wbc|white\s+blood\s+cell)[^\d]*(\d+(?:\.\d+)?)/i,
    classify: (value: number): Finding["interpretation"] => {
      if (value < 4) {
        return "low";
      }
      if (value > 11) {
        return "high";
      }
      return "normal";
    },
    note: "Abnormal WBC can suggest infection/inflammation or marrow issues.",
  },
  {
    name: "Platelets",
    regex: /(?:platelet(?:s)?)[^\d]*(\d+(?:\.\d+)?)/i,
    classify: (value: number): Finding["interpretation"] => {
      if (value < 150) {
        return "low";
      }
      if (value > 450) {
        return "high";
      }
      return "normal";
    },
    note: "Platelet abnormalities require clinician interpretation.",
  },
];

function heuristicScan(text: string): ReportScanOutput {
  const findings: Finding[] = [];

  for (const rule of patternRules) {
    const match = text.match(rule.regex);
    if (!match?.[1]) {
      continue;
    }

    const value = Number(match[1]);
    const interpretation = Number.isFinite(value) ? rule.classify(value) : "unknown";

    findings.push({
      name: rule.name,
      value: match[1],
      interpretation,
      note: rule.note,
    });
  }

  const highOrLow = findings.filter((item) => item.interpretation === "high" || item.interpretation === "low");
  const borderline = findings.filter((item) => item.interpretation === "borderline");

  let summary = "No clearly parseable abnormal markers were detected by heuristic scanning.";
  let recommendedNextStep = "Share this report with your clinician for full interpretation.";

  if (highOrLow.length > 0) {
    summary = `Detected ${highOrLow.length} potentially abnormal marker(s): ${highOrLow.map((item) => item.name).join(", ")}.`;
    recommendedNextStep = "Book a doctor visit within 24-48 hours to review these abnormalities and correlate with symptoms.";
  } else if (borderline.length > 0) {
    summary = `Detected borderline marker(s): ${borderline.map((item) => item.name).join(", ")}.`;
    recommendedNextStep = "Discuss lifestyle and follow-up testing plan with a clinician.";
  }

  return {
    summary,
    findings,
    recommendedNextStep,
    model: "heuristic-report-scan",
  };
}

async function llmScan(text: string): Promise<ReportScanOutput | null> {
  const llm = getLlmConfig();
  if (!llm) {
    return null;
  }

  const deidentified = deidentifyClinicalText(text);

  try {
    const completion = await llm.client.chat.completions.create({
      model: llm.model,
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a medical report extraction assistant. You are not diagnosing. Return strict JSON with summary, findings, recommendedNextStep. For each finding include name, value, interpretation(normal|borderline|high|low|unknown), note.",
        },
        {
          role: "user",
          content: JSON.stringify({
            reportText: deidentified,
            requirement:
              "Focus on objective marker extraction and conservative care guidance. If uncertain, use interpretation=unknown.",
          }),
        },
      ],
    });

    const content = completion.choices[0]?.message.content;
    if (!content) {
      return null;
    }

    const parsed = scanSchema.parse(JSON.parse(content));

    return {
      ...parsed,
      model: completion.model ?? `${llm.provider}:${llm.model}`,
    };
  } catch {
    return null;
  }
}

export async function scanMedicalReport(reportText: string): Promise<ReportScanOutput> {
  const normalized = reportText.trim();

  const llm = await llmScan(normalized);
  if (llm) {
    return llm;
  }

  return heuristicScan(normalized);
}
