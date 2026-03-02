"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";

type HealthRecord = {
  id: string;
  title: string;
  record_type: string;
  source: string;
  observed_at: string | null;
  created_at: string;
};

type ScanFinding = {
  name: string;
  value: string;
  interpretation: "normal" | "borderline" | "high" | "low" | "unknown";
  note: string;
};

type ReportScanResult = {
  summary: string;
  findings: ScanFinding[];
  recommendedNextStep: string;
  model: string;
  error?: string;
};

const interpretationStyle: Record<ScanFinding["interpretation"], string> = {
  normal: "bg-[var(--brand-100)] text-[var(--brand-800)]",
  borderline: "bg-amber-100 text-amber-900",
  high: "bg-red-100 text-red-900",
  low: "bg-sky-100 text-sky-900",
  unknown: "bg-zinc-100 text-zinc-700",
};

export function HealthRecordsPanel() {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [title, setTitle] = useState("");
  const [recordType, setRecordType] = useState("lab_report");
  const [source, setSource] = useState("manual_upload");
  const [observedAt, setObservedAt] = useState("");
  const [payload, setPayload] = useState('{"note":"sample"}');
  const [reportName, setReportName] = useState("lab-report");
  const [reportText, setReportText] = useState("");
  const [scanResult, setScanResult] = useState<ReportScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [showAdvancedEntry, setShowAdvancedEntry] = useState(false);

  const canScan = useMemo(() => reportText.trim().length >= 30, [reportText]);

  async function loadRecords() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/health-records");
      const body = (await response.json()) as { records?: HealthRecord[]; error?: string };

      if (!response.ok) {
        throw new Error(body.error ?? "Unable to load records");
      }

      setRecords(body.records ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load records");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadRecords();
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    let parsedPayload: unknown = {};
    try {
      parsedPayload = payload ? JSON.parse(payload) : {};
    } catch {
      setError("Payload must be valid JSON.");
      return;
    }

    const response = await fetch("/api/health-records", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        recordType,
        source,
        observedAt: observedAt || null,
        payload: parsedPayload,
      }),
    });

    const body = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(body.error ?? "Unable to save record");
      return;
    }

    setTitle("");
    setObservedAt("");
    setPayload('{"note":"sample"}');
    await loadRecords();
  }

  async function scanReport() {
    if (!canScan) {
      return;
    }

    setScanning(true);
    setError(null);

    const response = await fetch("/api/reports/scan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reportText,
        reportName,
      }),
    });

    const body = (await response.json()) as ReportScanResult;

    setScanning(false);

    if (!response.ok) {
      setError(body.error ?? "Unable to scan report.");
      return;
    }

    setScanResult(body);
  }

  async function saveScanAsRecord() {
    if (!scanResult) {
      return;
    }

    const response = await fetch("/api/health-records", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: `Scan: ${reportName}`,
        recordType: "report_scan",
        source: "report_scanner",
        observedAt: null,
        payload: scanResult,
      }),
    });

    const body = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(body.error ?? "Unable to save scan output.");
      return;
    }

    await loadRecords();
  }

  async function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setReportName(file.name);

    const lower = file.name.toLowerCase();
    const textLike = lower.endsWith(".txt") || lower.endsWith(".md") || lower.endsWith(".csv") || lower.endsWith(".json");

    if (!textLike) {
      setError("File upload parsing currently supports text/csv/json. For PDF/image, paste extracted text below.");
      return;
    }

    const content = await file.text();
    setReportText(content);
  }

  return (
    <div className="grid gap-5">
      <section className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
        <p className="text-base font-semibold text-[var(--text)]">Report scanning (optional)</p>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Paste or upload report text to extract key findings. Files are stored in your private vault and can be included in your brief.
        </p>

        <div className="mt-4 grid gap-3">
          <label className="grid gap-1 text-sm text-[var(--muted)]">
            Report name
            <input
              value={reportName}
              onChange={(event) => setReportName(event.target.value)}
              className="rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] px-3 py-2 outline-none focus:border-[var(--brand-500)] focus:ring-1 focus:ring-[var(--brand-500)]"
            />
          </label>

          <label className="grid gap-1 text-sm text-[var(--muted)]">
            Upload report file (.txt, .csv, .json)
            <input
              type="file"
              accept=".txt,.md,.csv,.json,text/plain,text/csv,application/json"
              onChange={onFileChange}
              className="rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] px-3 py-2"
            />
          </label>

          <label className="grid gap-1 text-sm text-[var(--muted)]">
            Report text
            <textarea
              value={reportText}
              onChange={(event) => setReportText(event.target.value)}
              className="min-h-36 rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] px-3 py-2 text-sm outline-none focus:border-[var(--brand-500)] focus:ring-1 focus:ring-[var(--brand-500)]"
              placeholder="Paste blood test, CBC, lipid profile, or other report text here..."
            />
          </label>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={scanReport}
              disabled={!canScan || scanning}
              className="rounded-xl bg-[var(--brand-600)] px-5 py-2 text-sm font-semibold text-white shadow-sm shadow-[var(--brand-500)]/20 hover:bg-[var(--brand-700)] transition-colors disabled:opacity-60"
            >
              {scanning ? "Scanning..." : "Scan report"}
            </button>
            {scanResult ? (
              <button
                type="button"
                onClick={saveScanAsRecord}
                className="rounded-xl border border-[var(--line)] px-5 py-2 text-sm font-semibold text-[var(--text)] hover:border-[var(--brand-500)] hover:text-[var(--brand-700)] transition-colors"
              >
                Save scan to records
              </button>
            ) : null}
          </div>
          <p className="text-xs text-[var(--muted)]">
            PDF/image parsing is not automatic yet. For those files, paste extracted text in the report text box.
          </p>
        </div>

        {scanResult ? (
          <article className="mt-4 rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] p-4">
            <p className="text-sm font-semibold text-[var(--brand-700)]">Scan summary ({scanResult.model})</p>
            <p className="mt-1 text-sm text-[var(--muted)]">{scanResult.summary}</p>
            <p className="mt-2 text-sm text-[var(--muted)]">{scanResult.recommendedNextStep}</p>
            <div className="mt-3 grid gap-2">
              {scanResult.findings.map((finding) => (
                <article key={`${finding.name}-${finding.value}`} className="rounded-lg border border-[var(--line)] bg-white p-3 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-[var(--text)]">{finding.name}: {finding.value}</p>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${interpretationStyle[finding.interpretation]}`}>
                      {finding.interpretation}
                    </span>
                  </div>
                  <p className="mt-1 text-[var(--muted)]">{finding.note}</p>
                </article>
              ))}
            </div>
          </article>
        ) : null}
      </section>

      <section className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-base font-semibold text-[var(--text)]">Manual health record</p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Optional advanced entry for staff or power users.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAdvancedEntry((value) => !value)}
            className="rounded-xl border border-[var(--line)] px-4 py-2 text-sm font-semibold text-[var(--text)] hover:border-[var(--brand-500)] hover:text-[var(--brand-700)] transition-colors"
          >
            {showAdvancedEntry ? "Hide advanced fields" : "Show advanced fields"}
          </button>
        </div>

        {showAdvancedEntry ? (
          <form onSubmit={onSubmit} className="mt-4 grid gap-3">
            <label className="grid gap-1 text-sm text-[var(--muted)]">
              Title
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
                className="rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] px-3 py-2 outline-none focus:border-[var(--brand-500)] focus:ring-1 focus:ring-[var(--brand-500)]"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-sm text-[var(--muted)]">
                Record type
                <select
                  value={recordType}
                  onChange={(event) => setRecordType(event.target.value)}
                  className="rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] px-3 py-2 outline-none focus:border-[var(--brand-500)] focus:ring-1 focus:ring-[var(--brand-500)]"
                >
                  <option value="lab_report">Lab report</option>
                  <option value="medication">Medication</option>
                  <option value="vitals">Vitals</option>
                  <option value="condition">Condition</option>
                  <option value="report_scan">Report scan</option>
                </select>
              </label>
              <label className="grid gap-1 text-sm text-[var(--muted)]">
                Source
                <input
                  value={source}
                  onChange={(event) => setSource(event.target.value)}
                  className="rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] px-3 py-2 outline-none focus:border-[var(--brand-500)] focus:ring-1 focus:ring-[var(--brand-500)]"
                />
              </label>
            </div>
            <label className="grid gap-1 text-sm text-[var(--muted)]">
              Observed at
              <input
                value={observedAt}
                onChange={(event) => setObservedAt(event.target.value)}
                type="datetime-local"
                className="rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] px-3 py-2 outline-none focus:border-[var(--brand-500)] focus:ring-1 focus:ring-[var(--brand-500)]"
              />
            </label>
            <label className="grid gap-1 text-sm text-[var(--muted)]">
              Payload JSON
              <textarea
                value={payload}
                onChange={(event) => setPayload(event.target.value)}
                className="min-h-24 rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] px-3 py-2 font-mono text-xs outline-none focus:border-[var(--brand-500)] focus:ring-1 focus:ring-[var(--brand-500)]"
              />
            </label>
            <div className="flex items-center gap-3">
              <button type="submit" className="rounded-xl bg-[var(--brand-600)] px-5 py-2 text-sm font-semibold text-white shadow-sm shadow-[var(--brand-500)]/20 hover:bg-[var(--brand-700)] transition-colors">
                Save record
              </button>
              <a href="/api/health-records/export" className="rounded-xl border border-[var(--line)] px-5 py-2 text-sm font-semibold text-[var(--text)] hover:border-[var(--brand-500)] hover:text-[var(--brand-700)] transition-colors">
                Export CSV
              </a>
            </div>
          </form>
        ) : (
          <p className="mt-4 text-sm text-[var(--muted)]">
            Keep this collapsed for everyday use. Use it only if you need manual structured record entry.
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
        <p className="mb-3 text-base font-semibold text-[var(--text)]">Recent records</p>
        {loading ? <p className="text-sm text-[var(--muted)]">Loading...</p> : null}
        {!loading && records.length === 0 ? <p className="text-sm text-[var(--muted)]">No records yet.</p> : null}
        <div className="grid gap-2">
          {records.map((record) => (
            <article key={record.id} className="rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] p-3 text-sm">
              <p className="font-semibold text-[var(--text)]">{record.title}</p>
              <p className="text-xs text-[var(--muted)]">
                {record.record_type} | {record.source} | {record.observed_at ?? "no timestamp"}
              </p>
            </article>
          ))}
        </div>
      </section>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
