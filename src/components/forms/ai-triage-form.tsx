"use client";

import { FormEvent, useMemo, useState } from "react";

type TriageResult = {
  severity: "low" | "medium" | "high";
  recommendation: string;
  redFlags: string[];
  rationale: string;
  citations: Array<{
    title: string;
    source: string;
    snippet: string;
  }>;
  model: string;
  retriever?: string;
  triageId?: string;
};

const severityStyles: Record<TriageResult["severity"], string> = {
  low: "bg-emerald-100 text-emerald-900",
  medium: "bg-amber-100 text-amber-900",
  high: "bg-red-100 text-red-900",
};

export function AITriageForm() {
  const [symptomText, setSymptomText] = useState("");
  const [age, setAge] = useState("30");
  const [durationDays, setDurationDays] = useState("1");
  const [hasChronicConditions, setHasChronicConditions] = useState(false);
  const [isPregnant, setIsPregnant] = useState(false);
  const [result, setResult] = useState<TriageResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [handoffStatus, setHandoffStatus] = useState<string | null>(null);

  const canSubmit = useMemo(() => symptomText.trim().length >= 10, [symptomText]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/triage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symptomText,
          age: Number(age),
          durationDays: Number(durationDays),
          hasChronicConditions,
          isPregnant,
        }),
      });

      const payload = (await response.json()) as TriageResult & { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to run triage");
      }

      setResult(payload);
      setHandoffStatus(null);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to run triage");
    } finally {
      setLoading(false);
    }
  }

  async function createConsultationFromTriage() {
    if (!result) {
      return;
    }

    const response = await fetch("/api/consultations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chiefComplaint: symptomText,
        priority: result.severity === "high" ? "critical" : "urgent",
        triageSessionId: result.triageId,
        firstMessage: `AI triage severity: ${result.severity}. Recommendation: ${result.recommendation}`,
      }),
    });

    const body = (await response.json()) as { consultation?: { id: string }; error?: string };

    if (!response.ok) {
      setHandoffStatus(body.error ?? "Unable to create consultation from triage.");
      return;
    }

    setHandoffStatus(`Consultation ${body.consultation?.id?.slice(0, 8) ?? ""} created. Open /consultations.`);
  }

  return (
    <div className="grid gap-5">
      <form onSubmit={onSubmit} className="grid gap-4 rounded-xl border border-[var(--line)] p-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="symptoms">
            Describe symptoms
          </label>
          <textarea
            id="symptoms"
            value={symptomText}
            onChange={(event) => setSymptomText(event.target.value)}
            placeholder="Example: Fever for 2 days with sore throat and body ache..."
            className="min-h-28 rounded-lg border border-[var(--line)] bg-[#fcfcfb] px-3 py-2 text-sm outline-none focus:border-[#FF6600]"
            required
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium">
            Age
            <input
              value={age}
              onChange={(event) => setAge(event.target.value)}
              type="number"
              min={0}
              max={120}
              className="rounded-lg border border-[var(--line)] bg-[#fcfcfb] px-3 py-2 text-sm outline-none focus:border-[#FF6600]"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Duration (days)
            <input
              value={durationDays}
              onChange={(event) => setDurationDays(event.target.value)}
              type="number"
              min={0}
              max={365}
              className="rounded-lg border border-[var(--line)] bg-[#fcfcfb] px-3 py-2 text-sm outline-none focus:border-[#FF6600]"
            />
          </label>
        </div>

        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={hasChronicConditions}
              onChange={(event) => setHasChronicConditions(event.target.checked)}
            />
            Chronic conditions present
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={isPregnant} onChange={(event) => setIsPregnant(event.target.checked)} />
            Pregnant
          </label>
        </div>

        <button
          type="submit"
          disabled={!canSubmit || loading}
          className="rounded-xl bg-[#FF6600] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#E55C00] transition-colors disabled:opacity-60"
        >
          {loading ? "Analyzing..." : "Run AI Triage"}
        </button>
      </form>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      {result ? (
        <article className="grid gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] p-4">
          <div className="flex items-center gap-2 text-sm">
            <span className={`rounded-full px-3 py-1 font-semibold uppercase ${severityStyles[result.severity]}`}>
              {result.severity}
            </span>
            <span className="text-[var(--muted)]">Model: {result.model}</span>
            {result.retriever ? <span className="text-[var(--muted)]">Retriever: {result.retriever}</span> : null}
          </div>
          <p className="text-sm">{result.recommendation}</p>
          <p className="text-sm text-[var(--muted)]">Why: {result.rationale}</p>
          {result.redFlags.length > 0 ? (
            <ul className="grid gap-2 text-sm text-red-800">
              {result.redFlags.map((flag) => (
                <li key={flag}>- {flag}</li>
              ))}
            </ul>
          ) : null}
          {result.citations.length > 0 ? (
            <div className="grid gap-2 rounded-lg border border-[var(--line)] bg-white p-3 text-sm">
              <p className="font-semibold">Evidence used</p>
              {result.citations.map((citation) => (
                <article key={`${citation.title}-${citation.source}`} className="grid gap-1">
                  <p className="font-medium">{citation.title}</p>
                  <p className="text-xs uppercase tracking-wide text-[var(--muted)]">{citation.source}</p>
                  <p className="text-[var(--muted)]">{citation.snippet}</p>
                </article>
              ))}
            </div>
          ) : null}

          {(result.severity === "medium" || result.severity === "high") && (
            <button
              type="button"
              onClick={createConsultationFromTriage}
              className="justify-self-start rounded-xl bg-[#FF6600] px-4 py-2 text-sm font-semibold text-white hover:bg-[#E55C00] transition-colors"
            >
              Escalate to doctor consultation
            </button>
          )}
        </article>
      ) : null}

      {handoffStatus ? <p className="text-sm text-[var(--muted)]">{handoffStatus}</p> : null}
    </div>
  );
}
