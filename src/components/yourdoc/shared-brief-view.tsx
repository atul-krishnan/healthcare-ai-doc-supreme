"use client";

import { FormEvent, useState } from "react";
import type { ShareBriefResponse } from "@/lib/yourdoc/types";

type Props = {
  token: string;
};

export function SharedBriefView({ token }: Props) {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ShareBriefResponse | null>(null);

  async function loadBrief(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setLoading(true);
    setError(null);

    const response = await fetch(`/api/share/${token}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pin }),
    });

    const body = (await response.json()) as ShareBriefResponse & { error?: string };
    setLoading(false);

    if (!response.ok) {
      setError(body.error ?? "Unable to open shared brief.");
      return;
    }

    setData(body);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="rounded-2xl border border-[#D8E6E6] bg-white p-5">
        <h1 className="font-serif text-3xl text-[#1D3557]">Shared YourDoc Brief</h1>
        <p className="mt-2 text-sm text-[#62788f]">
          Read-only view. This is not a diagnosis. Yeh diagnosis nahi hai.
        </p>

        {!data ? (
          <form onSubmit={loadBrief} className="mt-4 grid gap-3 max-w-sm">
            <label className="grid gap-1 text-sm">
              PIN (if required)
              <input
                value={pin}
                onChange={(event) => setPin(event.target.value)}
                className="rounded-xl border border-[#D8E6E6] px-3 py-2"
                placeholder="Enter PIN"
              />
            </label>
            <button type="submit" disabled={loading} className="rounded-xl bg-[#2A9D8F] px-4 py-2 text-sm font-semibold text-white">
              {loading ? "Opening..." : "Open shared brief"}
            </button>
            {error ? <p className="text-sm text-[#9f2f2f]">{error}</p> : null}
          </form>
        ) : (
          <div className="mt-5 grid gap-4">
            <div className="rounded-xl border border-[#D8E6E6] bg-[#F8FCFF] p-4">
              <p className="text-sm text-[#607c94]">{new Date(data.brief.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
              <h2 className="mt-1 font-serif text-2xl text-[#1D3557]">{data.brief.title}</h2>
              <p className="mt-1 text-sm text-[#45657f]">Care setting: {data.brief.careSetting.replaceAll("_", " ")}</p>
              <p className="text-sm text-[#45657f]">Department: {data.brief.departmentBucket.replaceAll("_", " ")}</p>
            </div>

            <div className="rounded-xl border border-[#D8E6E6] bg-white p-4">
              <p className="font-semibold text-[#1D3557]">Next steps</p>
              <ul className="mt-2 grid gap-2 text-sm text-[#3a5d78]">
                {data.brief.summary.next_steps.map((step) => (
                  <li key={step}>- {step}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-[#D8E6E6] bg-white p-4">
              <p className="font-semibold text-[#1D3557]">Doctor summary</p>
              <p className="mt-2 text-sm text-[#3a5d78]">{data.brief.summary.doctor_summary_sections.hpi}</p>
              <p className="mt-2 text-sm text-[#3a5d78]">{data.brief.summary.doctor_summary_sections.relevantHistory}</p>
              <p className="mt-2 text-sm text-[#3a5d78]">{data.brief.summary.doctor_summary_sections.medicationsAllergies}</p>
            </div>

            <div className="rounded-xl border border-[#D8E6E6] bg-white p-4">
              <p className="font-semibold text-[#1D3557]">Attachments</p>
              {data.attachments.length === 0 ? (
                <p className="mt-2 text-sm text-[#5f7891]">No attachments.</p>
              ) : (
                <ul className="mt-2 grid gap-2 text-sm">
                  {data.attachments.map((item) => (
                    <li key={item.id}>
                      {item.downloadUrl ? (
                        <a href={item.downloadUrl} target="_blank" rel="noreferrer" className="underline text-[#2A5A7D]">
                          {item.fileName}
                        </a>
                      ) : (
                        item.fileName
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <p className="text-xs text-[#667b92]">
              {data.disclaimer} {data.disclaimerHi}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
