import { randomUUID } from "node:crypto";
import { z } from "zod";
import { env } from "@/lib/env";
import { mapEhrRecordToResource, type EhrRecord } from "@/lib/server/fhir/mappers";
import type { FhirResource } from "@/lib/server/fhir/types";

export type EhrProvider = "mock" | "fasten" | "particle" | "medplum";

type EhrSyncResult = {
  provider: EhrProvider;
  mode: "mock" | "live";
  records: EhrRecord[];
  resources: FhirResource[];
  warnings: string[];
};

const liveRecordSchema = z.object({
  id: z.string().optional(),
  kind: z.enum(["condition", "medication", "lab"]),
  title: z.string(),
  code: z.string().optional(),
  system: z.string().optional(),
  status: z.string().optional(),
  recordedAt: z.string().optional(),
  onsetDate: z.string().optional(),
  value: z.number().optional(),
  unit: z.string().optional(),
  notes: z.string().optional(),
});

const liveResponseSchema = z.object({
  records: z.array(liveRecordSchema),
});

function parseProvider(value?: string): EhrProvider {
  if (value === "fasten" || value === "particle" || value === "medplum") {
    return value;
  }

  return "mock";
}

function generateMockEhrRecords(provider: EhrProvider): EhrRecord[] {
  const now = new Date();

  return [
    {
      id: randomUUID(),
      kind: "condition",
      title: "Essential hypertension",
      code: "I10",
      system: "http://hl7.org/fhir/sid/icd-10",
      status: "active",
      recordedAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      provider,
      notes: "Diagnosed in annual checkup.",
    },
    {
      id: randomUUID(),
      kind: "medication",
      title: "Amlodipine 5 mg tablet",
      code: "197361",
      system: "http://www.nlm.nih.gov/research/umls/rxnorm",
      status: "active",
      recordedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      value: 1,
      unit: "tablet daily",
      provider,
      notes: "Continue for blood pressure management.",
    },
    {
      id: randomUUID(),
      kind: "lab",
      title: "HbA1c",
      code: "4548-4",
      system: "http://loinc.org",
      value: 6.1,
      unit: "%",
      recordedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      provider,
      notes: "Prediabetes range.",
    },
  ];
}

async function fetchLiveEhrRecords(provider: Exclude<EhrProvider, "mock">): Promise<EhrRecord[] | null> {
  if (!env.EHR_SYNC_URL || !env.EHR_API_KEY) {
    return null;
  }

  try {
    const response = await fetch(env.EHR_SYNC_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.EHR_API_KEY}`,
      },
      body: JSON.stringify({ provider }),
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return null;
    }

    const payload = liveResponseSchema.parse(await response.json());

    return payload.records.map((record) => ({
      id: record.id ?? randomUUID(),
      kind: record.kind,
      title: record.title,
      code: record.code,
      system: record.system,
      status: record.status,
      recordedAt: record.recordedAt,
      onsetDate: record.onsetDate,
      value: record.value,
      unit: record.unit,
      notes: record.notes,
      provider,
    }));
  } catch {
    return null;
  }
}

export async function syncEhrData(userId: string): Promise<EhrSyncResult> {
  const provider = parseProvider(env.EHR_PROVIDER);
  const warnings: string[] = [];

  let mode: EhrSyncResult["mode"] = "mock";
  let records: EhrRecord[] = [];

  if (provider === "fasten" || provider === "particle" || provider === "medplum") {
    if (!env.EHR_API_KEY) {
      warnings.push(`EHR_API_KEY is missing. Falling back to mock ${provider} dataset.`);
    } else {
      const live = await fetchLiveEhrRecords(provider);
      if (live && live.length > 0) {
        mode = "live";
        records = live;
      } else {
        warnings.push(`Live ${provider} connector did not return data. Falling back to mock dataset.`);
      }
    }
  }

  if (records.length === 0) {
    records = generateMockEhrRecords(provider);
  }

  const resources = records.map((record) => mapEhrRecordToResource(userId, record));

  return {
    provider,
    mode,
    records,
    resources,
    warnings,
  };
}
