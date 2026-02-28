"use client";

import { FormEvent, useState } from "react";

type Citation = {
  title: string;
  source: string;
  snippet: string;
  score: number;
};

type SearchResult = {
  retriever: string;
  citations: Citation[];
  error?: string;
};

export function KnowledgeBasePanel() {
  const [query, setQuery] = useState("persistent fever and shortness of breath");
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const response = await fetch("/api/knowledge/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, limit: 6 }),
    });

    const body = (await response.json()) as SearchResult;
    setLoading(false);

    if (!response.ok) {
      setError(body.error ?? "Knowledge search failed.");
      return;
    }

    setResult(body);
  }

  return (
    <div className="grid gap-4">
      <form onSubmit={onSearch} className="grid gap-3 rounded-2xl border border-[#e2dfd9] bg-white p-5">
        <p className="text-base font-semibold text-[#2a2825]">Knowledge base search</p>
        <p className="text-sm text-[#807b74]">
          Search grounded clinical references used by AI triage. Retrieval uses vector mode when configured, else local lexical mode.
        </p>
        <textarea
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="min-h-24 rounded-xl border border-[#e8e5df] bg-[#fcfcfb] px-3 py-2 text-sm"
        />
        <button type="submit" disabled={loading} className="justify-self-start rounded-xl bg-[#171412] px-5 py-2 text-sm font-semibold text-white">
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {result ? (
        <section className="rounded-2xl border border-[#e2dfd9] bg-white p-5">
          <p className="text-sm font-semibold text-[#2a2825]">Retriever: {result.retriever}</p>
          <div className="mt-3 grid gap-2">
            {result.citations.length === 0 ? (
              <p className="text-sm text-[#8d8881]">No citations found for this query.</p>
            ) : (
              result.citations.map((citation) => (
                <article key={`${citation.title}-${citation.source}`} className="rounded-xl border border-[#ece9e3] bg-[#fbfbfa] p-3">
                  <p className="text-sm font-semibold text-[#2a2825]">{citation.title}</p>
                  <p className="text-xs text-[#7f7a73]">{citation.source}</p>
                  <p className="mt-1 text-sm text-[#6e6962]">{citation.snippet}</p>
                  <p className="mt-1 text-xs text-[#9a948d]">Score: {citation.score.toFixed(2)}</p>
                </article>
              ))
            )}
          </div>
        </section>
      ) : null}

      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
