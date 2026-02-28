import { randomUUID } from "node:crypto";
import type { Json } from "@/lib/supabase/types";

export type ObservationRecord = {
  id: string;
  observed_at: string | null;
  payload: Json;
};

type MetricRule = {
  metric: string;
  higherRisk?: {
    medium: number;
    high: number;
  };
  lowerRisk?: {
    medium: number;
    high: number;
  };
  unit: string;
  recommendation: string;
};

export type DriftAlert = {
  id: string;
  metric: string;
  severity: "medium" | "high";
  baselineAverage: number;
  recentAverage: number;
  delta: number;
  unit: string;
  rationale: string;
  recommendation: string;
};

type Point = {
  metric: string;
  value: number;
  observedAt: string;
};

const metricRules: MetricRule[] = [
  {
    metric: "resting_heart_rate",
    higherRisk: { medium: 8, high: 12 },
    unit: "beats/min",
    recommendation:
      "Resting heart rate trend increased materially. Schedule clinician review and correlate with symptoms or infection risk.",
  },
  {
    metric: "spo2",
    lowerRisk: { medium: -2, high: -3 },
    unit: "%",
    recommendation:
      "Oxygen saturation trend is declining. Escalate for respiratory assessment if symptoms are present.",
  },
  {
    metric: "sleep_duration_hours",
    lowerRisk: { medium: -1.5, high: -2.5 },
    unit: "h",
    recommendation:
      "Sleep duration dropped over rolling windows. Check stressors, infection signals, and recovery burden.",
  },
  {
    metric: "heart_rate_variability",
    lowerRisk: { medium: -10, high: -20 },
    unit: "ms",
    recommendation:
      "HRV trend reduced significantly. Recommend recovery-focused interventions and clinician review.",
  },
];

function readMetricCode(payload: Json): string | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return null;
  }

  const codeNode = payload.code;
  if (!codeNode || typeof codeNode !== "object" || Array.isArray(codeNode)) {
    return null;
  }

  const codingNode = codeNode.coding;
  if (Array.isArray(codingNode) && codingNode.length > 0) {
    const firstCoding = codingNode[0];
    if (firstCoding && typeof firstCoding === "object" && !Array.isArray(firstCoding)) {
      const raw = firstCoding.code;
      if (typeof raw === "string") {
        return raw;
      }
    }
  }

  const text = codeNode.text;
  return typeof text === "string" ? text.toLowerCase().replace(/\s+/g, "_") : null;
}

function readObservationValue(payload: Json): number | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return null;
  }

  const valueNode = payload.valueQuantity;
  if (!valueNode || typeof valueNode !== "object" || Array.isArray(valueNode)) {
    return null;
  }

  const value = valueNode.value;
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  return null;
}

function normalizeMetric(code: string): string | null {
  const normalized = code.trim().toLowerCase();

  if (normalized === "resting_heart_rate") {
    return normalized;
  }

  if (normalized === "8867-4" || normalized === "heart_rate") {
    return "heart_rate";
  }

  if (normalized === "59408-5" || normalized === "spo2" || normalized === "oxygen_saturation") {
    return "spo2";
  }

  if (normalized === "sleep_duration_hours") {
    return normalized;
  }

  if (normalized === "heart_rate_variability") {
    return normalized;
  }

  return null;
}

function toObservationPoints(records: ObservationRecord[]): Point[] {
  const points: Point[] = [];

  for (const record of records) {
    const code = readMetricCode(record.payload);
    const value = readObservationValue(record.payload);
    const metric = code ? normalizeMetric(code) : null;

    if (!metric || value === null) {
      continue;
    }

    const observedAt = record.observed_at ?? new Date().toISOString();
    if (Number.isNaN(new Date(observedAt).getTime())) {
      continue;
    }

    points.push({
      metric,
      value,
      observedAt,
    });
  }

  return points;
}

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, current) => sum + current, 0) / values.length;
}

function assessRule(rule: MetricRule, baselineAverage: number, recentAverage: number): DriftAlert | null {
  const delta = Number((recentAverage - baselineAverage).toFixed(2));

  if (rule.higherRisk) {
    if (delta >= rule.higherRisk.high) {
      return {
        id: randomUUID(),
        metric: rule.metric,
        severity: "high",
        baselineAverage,
        recentAverage,
        delta,
        unit: rule.unit,
        rationale: `Recent average increased by ${delta} ${rule.unit} against baseline.`,
        recommendation: rule.recommendation,
      };
    }

    if (delta >= rule.higherRisk.medium) {
      return {
        id: randomUUID(),
        metric: rule.metric,
        severity: "medium",
        baselineAverage,
        recentAverage,
        delta,
        unit: rule.unit,
        rationale: `Recent average increased by ${delta} ${rule.unit} against baseline.`,
        recommendation: rule.recommendation,
      };
    }
  }

  if (rule.lowerRisk) {
    if (delta <= rule.lowerRisk.high) {
      return {
        id: randomUUID(),
        metric: rule.metric,
        severity: "high",
        baselineAverage,
        recentAverage,
        delta,
        unit: rule.unit,
        rationale: `Recent average dropped by ${Math.abs(delta)} ${rule.unit} against baseline.`,
        recommendation: rule.recommendation,
      };
    }

    if (delta <= rule.lowerRisk.medium) {
      return {
        id: randomUUID(),
        metric: rule.metric,
        severity: "medium",
        baselineAverage,
        recentAverage,
        delta,
        unit: rule.unit,
        rationale: `Recent average dropped by ${Math.abs(delta)} ${rule.unit} against baseline.`,
        recommendation: rule.recommendation,
      };
    }
  }

  return null;
}

export function computeClinicalDriftAlerts(records: ObservationRecord[]): DriftAlert[] {
  const points = toObservationPoints(records);
  const alerts: DriftAlert[] = [];

  for (const rule of metricRules) {
    const series = points
      .filter((point) => point.metric === rule.metric)
      .sort((a, b) => new Date(b.observedAt).getTime() - new Date(a.observedAt).getTime());

    if (series.length < 6) {
      continue;
    }

    const windowSize = Math.min(7, Math.floor(series.length / 2));
    if (windowSize < 3) {
      continue;
    }

    const recentWindow = series.slice(0, windowSize).map((point) => point.value);
    const baselineWindow = series.slice(windowSize, windowSize * 2).map((point) => point.value);

    if (baselineWindow.length < windowSize) {
      continue;
    }

    const recentAverage = Number(average(recentWindow).toFixed(2));
    const baselineAverage = Number(average(baselineWindow).toFixed(2));

    const alert = assessRule(rule, baselineAverage, recentAverage);
    if (alert) {
      alerts.push(alert);
    }
  }

  return alerts.sort((a, b) => {
    if (a.severity === b.severity) {
      return Math.abs(b.delta) - Math.abs(a.delta);
    }

    return a.severity === "high" ? -1 : 1;
  });
}
