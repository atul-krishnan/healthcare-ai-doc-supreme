"use client";

import { FormEvent, useEffect, useState } from "react";

type HealthRecord = {
  id: string;
  title: string;
  record_type: string;
  source: string;
  observed_at: string | null;
  created_at: string;
};

export function HealthRecordsPanel() {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [title, setTitle] = useState("");
  const [recordType, setRecordType] = useState("lab_report");
  const [source, setSource] = useState("manual_upload");
  const [observedAt, setObservedAt] = useState("");
  const [payload, setPayload] = useState('{"note":"sample"}');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="grid gap-5">
      <form onSubmit={onSubmit} className="grid gap-3 rounded-xl border border-[var(--line)] p-4">
        <label className="grid gap-1 text-sm">
          Title
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            className="rounded-lg border border-[var(--line)] px-3 py-2 outline-none focus:border-[var(--brand-500)]"
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm">
            Record type
            <select
              value={recordType}
              onChange={(event) => setRecordType(event.target.value)}
              className="rounded-lg border border-[var(--line)] px-3 py-2 outline-none focus:border-[var(--brand-500)]"
            >
              <option value="lab_report">Lab report</option>
              <option value="medication">Medication</option>
              <option value="vitals">Vitals</option>
              <option value="condition">Condition</option>
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            Source
            <input
              value={source}
              onChange={(event) => setSource(event.target.value)}
              className="rounded-lg border border-[var(--line)] px-3 py-2 outline-none focus:border-[var(--brand-500)]"
            />
          </label>
        </div>
        <label className="grid gap-1 text-sm">
          Observed at
          <input
            value={observedAt}
            onChange={(event) => setObservedAt(event.target.value)}
            type="datetime-local"
            className="rounded-lg border border-[var(--line)] px-3 py-2 outline-none focus:border-[var(--brand-500)]"
          />
        </label>
        <label className="grid gap-1 text-sm">
          Payload JSON
          <textarea
            value={payload}
            onChange={(event) => setPayload(event.target.value)}
            className="min-h-24 rounded-lg border border-[var(--line)] px-3 py-2 font-mono text-xs outline-none focus:border-[var(--brand-500)]"
          />
        </label>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded-full bg-[var(--brand-500)] px-5 py-2 text-sm font-semibold text-white"
          >
            Save Record
          </button>
          <a
            href="/api/health-records/export"
            className="rounded-full border border-[var(--line)] px-5 py-2 text-sm font-semibold hover:border-[var(--brand-400)]"
          >
            Export CSV
          </a>
        </div>
      </form>

      <div className="rounded-xl border border-[var(--line)] p-4">
        <p className="mb-3 text-sm font-semibold">Recent records</p>
        {loading ? <p className="text-sm text-[var(--muted)]">Loading...</p> : null}
        {!loading && records.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No records yet.</p>
        ) : null}
        <div className="grid gap-2">
          {records.map((record) => (
            <article key={record.id} className="rounded-lg bg-[var(--surface-alt)] p-3 text-sm">
              <p className="font-semibold">{record.title}</p>
              <p className="text-xs text-[var(--muted)]">
                {record.record_type} | {record.source} | {record.observed_at ?? "no timestamp"}
              </p>
            </article>
          ))}
        </div>
      </div>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
