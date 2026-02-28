"use client";

import { useEffect, useState } from "react";

type SyncResponse = {
  provider: string;
  mode: "mock" | "live";
  importedCount: number;
  warnings: string[];
  error?: string;
};

type IntegrationStatus = {
  countsBySource: Record<string, number>;
  latestBySource: Record<string, string>;
  error?: string;
};

export function IntegrationSyncPanel() {
  const [wearablesResult, setWearablesResult] = useState<SyncResponse | null>(null);
  const [ehrResult, setEhrResult] = useState<SyncResponse | null>(null);
  const [status, setStatus] = useState<IntegrationStatus | null>(null);
  const [loadingWearables, setLoadingWearables] = useState(false);
  const [loadingEhr, setLoadingEhr] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function loadStatus() {
    const response = await fetch("/api/integrations/status");
    const body = (await response.json()) as IntegrationStatus;

    if (!response.ok) {
      setMessage(body.error ?? "Unable to load integration status.");
      return;
    }

    setStatus(body);
  }

  useEffect(() => {
    loadStatus().catch(() => {
      setMessage("Unable to load integration status.");
    });
  }, []);

  async function runWearableSync() {
    setLoadingWearables(true);
    setMessage(null);

    try {
      const response = await fetch("/api/integrations/wearables/sync", {
        method: "POST",
      });
      const body = (await response.json()) as SyncResponse;

      if (!response.ok) {
        setMessage(body.error ?? "Wearable sync failed.");
        return;
      }

      setWearablesResult(body);
      await loadStatus();
    } catch {
      setMessage("Wearable sync failed.");
    } finally {
      setLoadingWearables(false);
    }
  }

  async function runEhrSync() {
    setLoadingEhr(true);
    setMessage(null);

    try {
      const response = await fetch("/api/integrations/ehr/sync", {
        method: "POST",
      });
      const body = (await response.json()) as SyncResponse;

      if (!response.ok) {
        setMessage(body.error ?? "EHR sync failed.");
        return;
      }

      setEhrResult(body);
      await loadStatus();
    } catch {
      setMessage("EHR sync failed.");
    } finally {
      setLoadingEhr(false);
    }
  }

  return (
    <div className="grid gap-4">
      <section className="grid gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] p-4">
        <p className="text-sm font-semibold">Data ingestion</p>
        <p className="text-sm text-[var(--muted)]">
          Syncs are live-provider ready but currently auto-fallback to mock mode when provider keys are not configured.
        </p>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={runWearableSync}
            disabled={loadingWearables}
            className="rounded-full bg-[var(--brand-500)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loadingWearables ? "Syncing wearables..." : "Sync wearables"}
          </button>
          <button
            type="button"
            onClick={runEhrSync}
            disabled={loadingEhr}
            className="rounded-full bg-[var(--brand-500)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loadingEhr ? "Syncing EHR..." : "Sync EHR"}
          </button>
        </div>

        {message ? <p className="text-sm text-red-700">{message}</p> : null}
      </section>

      {wearablesResult ? (
        <section className="rounded-xl border border-[var(--line)] p-4 text-sm">
          <p className="font-semibold">Wearables sync result</p>
          <p className="text-[var(--muted)]">
            Provider: {wearablesResult.provider} ({wearablesResult.mode}), imported: {wearablesResult.importedCount}
          </p>
          {wearablesResult.warnings.length > 0 ? (
            <ul className="mt-2 grid gap-1 text-amber-700">
              {wearablesResult.warnings.map((warning) => (
                <li key={warning}>- {warning}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}

      {ehrResult ? (
        <section className="rounded-xl border border-[var(--line)] p-4 text-sm">
          <p className="font-semibold">EHR sync result</p>
          <p className="text-[var(--muted)]">
            Provider: {ehrResult.provider} ({ehrResult.mode}), imported: {ehrResult.importedCount}
          </p>
          {ehrResult.warnings.length > 0 ? (
            <ul className="mt-2 grid gap-1 text-amber-700">
              {ehrResult.warnings.map((warning) => (
                <li key={warning}>- {warning}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}

      {status ? (
        <section className="rounded-xl border border-[var(--line)] p-4 text-sm">
          <p className="font-semibold">Current ingestion footprint</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {Object.keys(status.countsBySource).length > 0 ? (
              Object.entries(status.countsBySource).map(([source, count]) => (
                <article key={source} className="rounded-lg border border-[var(--line)] p-3">
                  <p className="font-medium">{source}</p>
                  <p className="text-[var(--muted)]">Records: {count}</p>
                  <p className="text-[var(--muted)]">
                    Last sync: {status.latestBySource[source] ? new Date(status.latestBySource[source]).toLocaleString() : "-"}
                  </p>
                </article>
              ))
            ) : (
              <p className="text-[var(--muted)]">No synced data yet.</p>
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
}
