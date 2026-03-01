import { Buffer } from "node:buffer";
import { z } from "zod";
import { getLlmConfig } from "@/lib/server/llm-client";

type OcrResult = {
  ocrText: string | null;
  docSummary: string | null;
  extractionConfidence: string;
};

const imageOcrSchema = z.object({
  ocrText: z.string().min(1).max(12000),
  summary: z.string().min(1).max(1000),
  medicationsMentioned: z.array(z.string()).default([]),
  testsMentioned: z.array(z.string()).default([]),
  confidence: z.enum(["high", "medium", "low"]).default("low"),
});

function summarizeTextHeuristically(text: string) {
  const compact = text.replace(/\s+/g, " ").trim();
  const meds = Array.from(
    new Set(
      (compact.match(/\b(?:tablet|tab|capsule|cap|syrup|mg|ml|metformin|paracetamol|ibuprofen|amlodipine|atorvastatin)\b/gi) ?? []).map(
        (item) => item.toLowerCase(),
      ),
    ),
  );

  const tests = Array.from(
    new Set(
      (compact.match(/\b(?:cbc|hba1c|lipid|thyroid|tsh|ecg|x-ray|ct|mri|lft|kft|hemoglobin|glucose)\b/gi) ?? []).map(
        (item) => item.toUpperCase(),
      ),
    ),
  );

  const summaryParts = [
    compact.slice(0, 350),
    meds.length > 0 ? `Medications mentioned: ${meds.join(", ")}.` : "",
    tests.length > 0 ? `Tests mentioned: ${tests.join(", ")}.` : "",
  ].filter(Boolean);

  return summaryParts.join(" ");
}

function extractTextFromPdfBytes(bytes: Uint8Array) {
  const raw = Buffer.from(bytes).toString("latin1");
  const matches = raw.match(/[A-Za-z0-9][A-Za-z0-9 ,.%()/:+\\-]{15,}/g) ?? [];
  const normalized = matches
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter((line) => line.length >= 20)
    .join("\n")
    .slice(0, 12_000);

  return normalized || null;
}

function extractTextFromTextBytes(bytes: Uint8Array) {
  const text = Buffer.from(bytes).toString("utf8").trim();
  return text.length > 0 ? text.slice(0, 12_000) : null;
}

async function ocrImageWithLlm(bytes: Uint8Array, mimeType: string): Promise<OcrResult | null> {
  const llm = getLlmConfig();
  if (!llm) {
    return null;
  }

  // Avoid oversized inline image payloads.
  if (bytes.byteLength > 4 * 1024 * 1024) {
    return null;
  }

  const base64 = Buffer.from(bytes).toString("base64");

  try {
    const completion = await llm.client.chat.completions.create({
      model: llm.model,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Extract readable text from this medical image/report photo. Return JSON with keys: ocrText, summary, medicationsMentioned[], testsMentioned[], confidence(high|medium|low). Do not diagnose.",
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Extract report text and concise summary." },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64}`,
              },
            },
          ],
        },
      ],
    });

    const content = completion.choices[0]?.message.content;
    if (!content) {
      return null;
    }

    const parsed = imageOcrSchema.parse(JSON.parse(content));

    return {
      ocrText: parsed.ocrText,
      docSummary: [
        parsed.summary,
        parsed.medicationsMentioned.length > 0
          ? `Medications mentioned: ${parsed.medicationsMentioned.join(", ")}.`
          : "",
        parsed.testsMentioned.length > 0 ? `Tests mentioned: ${parsed.testsMentioned.join(", ")}.` : "",
      ]
        .filter(Boolean)
        .join(" "),
      extractionConfidence: parsed.confidence,
    };
  } catch {
    return null;
  }
}

export async function extractDocumentInsights({
  bytes,
  mimeType,
}: {
  bytes: Uint8Array;
  mimeType: string;
}): Promise<OcrResult> {
  const lowerMime = mimeType.toLowerCase();

  if (lowerMime.startsWith("image/")) {
    const vision = await ocrImageWithLlm(bytes, lowerMime);
    if (vision) {
      return vision;
    }

    return {
      ocrText: null,
      docSummary: "Image uploaded. OCR was unavailable in this environment.",
      extractionConfidence: "low",
    };
  }

  const isPdf = lowerMime.includes("pdf");
  const isTextLike =
    lowerMime.startsWith("text/") || lowerMime.includes("json") || lowerMime.includes("csv") || lowerMime.includes("xml");

  const extracted = isPdf ? extractTextFromPdfBytes(bytes) : isTextLike ? extractTextFromTextBytes(bytes) : null;

  if (!extracted) {
    return {
      ocrText: null,
      docSummary: "No OCR text could be extracted from this file.",
      extractionConfidence: "low",
    };
  }

  return {
    ocrText: extracted,
    docSummary: summarizeTextHeuristically(extracted),
    extractionConfidence: isPdf ? "low" : "medium",
  };
}
