"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

type VaultBrief = {
  id: string;
  title: string;
  care_setting: string;
  department_bucket: string;
  summary_json: unknown;
  created_at: string;
};

type VaultUpload = {
  id: string;
  briefId: string | null;
  fileName: string | null;
  mimeType: string;
  summary: string | null;
  createdAt: string;
};

type VaultResponse = {
  briefs?: VaultBrief[];
  uploads?: VaultUpload[];
  error?: string;
};

export function VaultPanel({
  initialBriefs,
  initialUploads,
}: {
  initialBriefs: VaultBrief[];
  initialUploads: VaultUpload[];
}) {
  const [query, setQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [briefs, setBriefs] = useState<VaultBrief[]>(initialBriefs);
  const [uploads, setUploads] = useState<VaultUpload[]>(initialUploads);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadVault(q = "") {
    setLoading(true);
    setError(null);

    const url = q ? `/api/vault?q=${encodeURIComponent(q)}` : "/api/vault";
    const response = await fetch(url);
    const body = (await response.json()) as VaultResponse;

    setLoading(false);

    if (!response.ok) {
      setError(body.error ?? "Unable to load vault.");
      return;
    }

    setBriefs(body.briefs ?? []);
    setUploads(body.uploads ?? []);
  }

  async function onSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setQuery(searchInput.trim());
    await loadVault(searchInput.trim());
  }

  return (
    <div className="grid gap-5">
      <form onSubmit={onSearch} className="flex flex-col gap-2 rounded-2xl border border-[#D8E6E6] bg-white p-4 sm:flex-row">
        <input
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Search briefs, medications, tests, or OCR text"
          className="h-11 flex-1 rounded-xl border border-[#D8E6E6] px-3"
        />
        <button type="submit" className="h-11 rounded-xl bg-[#1D3557] px-4 text-sm font-semibold text-white">
          Search
        </button>
      </form>

      {query ? <p className="text-sm text-[#5e748a]">Showing results for: {query}</p> : null}
      {loading ? <p className="text-sm text-[#6e8398]">Loading vault...</p> : null}
      {error ? <p className="rounded-xl bg-[#FFF5F5] p-3 text-sm text-[#A13030]">{error}</p> : null}

      <section className="rounded-2xl border border-[#D8E6E6] bg-white p-4">
        <h2 className="text-base font-semibold text-[#1D3557]">Briefs</h2>
        {briefs.length === 0 ? (
          <p className="mt-2 text-sm text-[#6f859b]">No briefs found yet. Complete intake to create your first brief.</p>
        ) : (
          <ul className="mt-2 grid gap-2">
            {briefs.map((brief) => (
              <li key={brief.id} className="rounded-xl border border-[#E1ECF1] bg-[#F9FCFF] p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-[#1D3557]">{brief.title}</p>
                  <span className="text-xs uppercase text-[#648099]">{brief.care_setting.replaceAll("_", " ")}</span>
                </div>
                <p className="mt-1 text-xs text-[#6d879e]">{new Date(brief.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
                <p className="mt-1 text-xs text-[#6d879e]">Department: {brief.department_bucket.replaceAll("_", " ")}</p>
                <Link href={`/briefs/${brief.id}`} className="mt-2 inline-block text-sm text-[#2A5A7D] underline">
                  View brief
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-[#D8E6E6] bg-white p-4">
        <h2 className="text-base font-semibold text-[#1D3557]">Documents</h2>
        {uploads.length === 0 ? (
          <p className="mt-2 text-sm text-[#6f859b]">No documents uploaded yet.</p>
        ) : (
          <ul className="mt-2 grid gap-2">
            {uploads.map((doc) => (
              <li key={doc.id} className="rounded-xl border border-[#E1ECF1] bg-[#F9FCFF] p-3">
                <p className="text-sm font-medium text-[#1D3557]">{doc.fileName ?? "Attachment"}</p>
                <p className="text-xs text-[#6d879e]">{doc.mimeType}</p>
                <p className="mt-1 text-xs text-[#6d879e]">{new Date(doc.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
                {doc.summary ? <p className="mt-1 text-xs text-[#4f6981]">{doc.summary}</p> : null}
                {doc.briefId ? (
                  <Link href={`/briefs/${doc.briefId}`} className="mt-2 inline-block text-xs text-[#2A5A7D] underline">
                    Linked brief
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="rounded-xl border border-[#D8E6E6] bg-[#F6FAFF] p-3 text-xs text-[#536C84]">
        Smart band trends (steps, sleep, HR) are coming soon in Health Vault.
      </div>
    </div>
  );
}
