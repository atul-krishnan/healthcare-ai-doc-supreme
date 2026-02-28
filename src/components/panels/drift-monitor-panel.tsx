"use client";

import { useState } from "react";

type DriftAlert = {
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

type DriftResponse = {
  observationCount: number;
  alertCount: number;
  alerts: DriftAlert[];
  error?: string;
};

const severityStyles: Record<DriftAlert["severity"], string> = {
  medium: "bg-amber-100 text-amber-900",
  high: "bg-red-100 text-red-900",
};

export function DriftMonitorPanel() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DriftResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runAnalysis() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/monitoring/drift/run", {
        method: "POST",
      });
      const body = (await response.json()) as DriftResponse;

      if (!response.ok) {
        setError(body.error ?? "Drift analysis failed.");
        return;
      }

      setResult(body);
    } catch {
      setError("Drift analysis failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-4">
      <section className="grid gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] p-4">
        <p className="text-sm font-semibold">Clinical drift engine</p>
        <p className="text-sm text-[var(--muted)]">
          Runs rolling baseline vs recent window analysis on wearable observations and creates alert records when drift is detected.
        </p>
        <button
          type="button"
          onClick={runAnalysis}
          disabled={loading}
          className="justify-self-start rounded-full bg-[var(--brand-500)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Running drift analysis..." : "Run drift analysis"}
        </button>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
      </section>

      {result ? (
        <section className="grid gap-3 rounded-xl border border-[var(--line)] p-4 text-sm">
          <p className="font-semibold">Run summary</p>
          <p className="text-[var(--muted)]">
            Observations analyzed: {result.observationCount} | Alerts: {result.alertCount}
          </p>

          {result.alerts.length > 0 ? (
            <div className="grid gap-3">
              {result.alerts.map((alert) => (
                <article key={alert.id} className="rounded-lg border border-[var(--line)] p-3">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold uppercase ${severityStyles[alert.severity]}`}>
                      {alert.severity}
                    </span>
                    <span className="text-sm font-semibold">{alert.metric}</span>
                  </div>
                  <p className="mt-2 text-[var(--muted)]">
                    Baseline: {alert.baselineAverage} {alert.unit} | Recent: {alert.recentAverage} {alert.unit} | Delta: {alert.delta} {alert.unit}
                  </p>
                  <p className="mt-1">{alert.rationale}</p>
                  <p className="mt-1 text-[var(--muted)]">{alert.recommendation}</p>
                </article>
              ))}
            </div>
          ) : (
            <p className="text-[var(--muted)]">No clinical drift alerts detected in this run.</p>
          )}
        </section>
      ) : null}
    </div>
  );
}
