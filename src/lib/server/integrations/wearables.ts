import { randomUUID } from "node:crypto";
import { z } from "zod";
import { env } from "@/lib/env";
import {
  mapWearableReadingToObservation,
  type WearableReading,
} from "@/lib/server/fhir/mappers";
import type { FhirObservation } from "@/lib/server/fhir/types";

export type WearableProvider = "mock" | "terra" | "junction";

type WearableSyncResult = {
  provider: WearableProvider;
  mode: "mock" | "live";
  readings: WearableReading[];
  resources: FhirObservation[];
  warnings: string[];
};

const liveReadingSchema = z.object({
  id: z.string().optional(),
  metric: z.string(),
  value: z.number(),
  unit: z.string().default(""),
  recordedAt: z.string(),
  note: z.string().optional(),
});

const liveResponseSchema = z.object({
  readings: z.array(liveReadingSchema),
});

function parseProvider(value?: string): WearableProvider {
  if (value === "terra" || value === "junction") {
    return value;
  }

  return "mock";
}

function normalizeMetric(metric: string): WearableReading["metric"] | null {
  const normalized = metric.trim().toLowerCase();

  if (normalized === "resting_heart_rate" || normalized === "rhr") {
    return "resting_heart_rate";
  }

  if (normalized === "heart_rate" || normalized === "hr") {
    return "heart_rate";
  }

  if (normalized === "spo2" || normalized === "oxygen_saturation") {
    return "spo2";
  }

  if (normalized === "sleep_duration_hours" || normalized === "sleep_duration" || normalized === "sleep") {
    return "sleep_duration_hours";
  }

  if (normalized === "heart_rate_variability" || normalized === "hrv") {
    return "heart_rate_variability";
  }

  return null;
}

function generateMockWearableReadings(provider: WearableProvider): WearableReading[] {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  const readings: WearableReading[] = [];

  for (let day = 0; day < 14; day += 1) {
    const recordedAt = new Date(now - day * dayMs).toISOString();
    const trendOffset = day < 7 ? 0 : -1;

    readings.push(
      {
        id: randomUUID(),
        metric: "resting_heart_rate",
        value: 64 + day * 0.4 + trendOffset,
        unit: "beats/min",
        recordedAt,
        provider,
      },
      {
        id: randomUUID(),
        metric: "spo2",
        value: 97 - day * 0.05,
        unit: "%",
        recordedAt,
        provider,
      },
      {
        id: randomUUID(),
        metric: "sleep_duration_hours",
        value: 7.4 - day * 0.08,
        unit: "h",
        recordedAt,
        provider,
      },
      {
        id: randomUUID(),
        metric: "heart_rate_variability",
        value: 52 - day * 1.1,
        unit: "ms",
        recordedAt,
        provider,
      },
    );
  }

  return readings;
}

async function fetchLiveWearableReadings(provider: Exclude<WearableProvider, "mock">): Promise<WearableReading[] | null> {
  if (!env.WEARABLE_SYNC_URL || !env.WEARABLE_API_KEY) {
    return null;
  }

  try {
    const response = await fetch(env.WEARABLE_SYNC_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.WEARABLE_API_KEY}`,
      },
      body: JSON.stringify({
        provider,
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return null;
    }

    const payload = liveResponseSchema.parse(await response.json());

    const normalized: WearableReading[] = [];

    for (const reading of payload.readings) {
      const metric = normalizeMetric(reading.metric);
      if (!metric) {
        continue;
      }

      normalized.push({
        id: reading.id ?? randomUUID(),
        metric,
        value: reading.value,
        unit: reading.unit,
        recordedAt: reading.recordedAt,
        provider,
        note: reading.note,
      });
    }

    return normalized;
  } catch {
    return null;
  }
}

export async function syncWearableData(userId: string): Promise<WearableSyncResult> {
  const provider = parseProvider(env.WEARABLE_PROVIDER);
  const warnings: string[] = [];

  let mode: WearableSyncResult["mode"] = "mock";
  let readings: WearableReading[] = [];

  if (provider === "terra" || provider === "junction") {
    if (!env.WEARABLE_API_KEY) {
      warnings.push(`WEARABLE_API_KEY is missing. Falling back to mock ${provider} dataset.`);
    } else {
      const live = await fetchLiveWearableReadings(provider);
      if (live && live.length > 0) {
        mode = "live";
        readings = live;
      } else {
        warnings.push(`Live ${provider} connector did not return data. Falling back to mock dataset.`);
      }
    }
  }

  if (readings.length === 0) {
    readings = generateMockWearableReadings(provider);
  }

  const resources = readings.map((reading) => mapWearableReadingToObservation(userId, reading));

  return {
    provider,
    mode,
    readings,
    resources,
    warnings,
  };
}
