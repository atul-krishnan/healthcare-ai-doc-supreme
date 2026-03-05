"use client";

import { useState } from "react";

const challengeOptions = [
  "Unsure if symptom is urgent",
  "Hard to find the right doctor",
  "Confusing prescriptions and follow-up",
  "Managing parents' health records",
  "Lab reports are hard to understand",
];

type WaitlistFormProps = {
  compact?: boolean;
  buttonLabel?: string;
  className?: string;
};

export function WaitlistForm({ compact = false, buttonLabel = "Join Waitlist", className }: WaitlistFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      email: String(formData.get("email") ?? ""),
      name: String(formData.get("name") ?? ""),
      city: String(formData.get("city") ?? ""),
      language: String(formData.get("language") ?? ""),
      biggest_headache: String(formData.get("biggest_headache") ?? ""),
      source: "landing_page_waitlist",
    };

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        setErrorMessage(body?.error ?? "Unable to join waitlist. Please try again.");
        setIsSubmitting(false);
        return;
      }

      setIsSubmitted(true);
    } catch {
      setErrorMessage("Unable to join waitlist. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSubmitted) {
    return (
      <div
        className={`rounded-2xl border border-[#bfdbfe] bg-[#eff6ff] px-4 py-3 text-sm text-[#1d4ed8] md:px-5 ${className ?? ""}`}
      >
        You are on the founding waitlist. We will invite members in batches.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={`grid gap-3 ${className ?? ""}`}>
      {!compact ? (
        <div className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-1.5 text-sm font-medium text-[#334155]">
            Name
            <input
              name="name"
              autoComplete="name"
              required
              placeholder="Your name"
              className="h-11 rounded-xl border border-[#cbd5e1] bg-white px-3 text-sm text-[#0f172a] outline-none transition focus:border-[#3b82f6] focus:ring-2 focus:ring-[#bfdbfe]"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-[#334155]">
            Email
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@email.com"
              className="h-11 rounded-xl border border-[#cbd5e1] bg-white px-3 text-sm text-[#0f172a] outline-none transition focus:border-[#3b82f6] focus:ring-2 focus:ring-[#bfdbfe]"
            />
          </label>
        </div>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="Enter your email address"
            className="h-11 flex-1 rounded-xl border border-[#cbd5e1] bg-white px-3 text-sm text-[#0f172a] outline-none transition focus:border-[#3b82f6] focus:ring-2 focus:ring-[#bfdbfe]"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-11 rounded-xl bg-[#1e3a8a] px-5 text-sm font-semibold !text-white transition hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Joining..." : buttonLabel}
          </button>
        </div>
      )}

      {!compact ? (
        <div className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-1.5 text-sm font-medium text-[#334155]">
            City
            <input
              name="city"
              autoComplete="address-level2"
              placeholder="Bengaluru"
              className="h-11 rounded-xl border border-[#cbd5e1] bg-white px-3 text-sm text-[#0f172a] outline-none transition focus:border-[#3b82f6] focus:ring-2 focus:ring-[#bfdbfe]"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-[#334155]">
            Preferred language
            <select
              name="language"
              defaultValue="English"
              className="h-11 rounded-xl border border-[#cbd5e1] bg-white px-3 text-sm text-[#0f172a] outline-none transition focus:border-[#3b82f6] focus:ring-2 focus:ring-[#bfdbfe]"
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Hinglish">Hinglish</option>
            </select>
          </label>
        </div>
      ) : null}

      {!compact ? (
        <label className="grid gap-1.5 text-sm font-medium text-[#334155]">
          Biggest healthcare headache
          <select
            name="biggest_headache"
            defaultValue={challengeOptions[0]}
            className="h-11 rounded-xl border border-[#cbd5e1] bg-white px-3 text-sm text-[#0f172a] outline-none transition focus:border-[#3b82f6] focus:ring-2 focus:ring-[#bfdbfe]"
          >
            {challengeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {!compact ? (
        <button
          type="submit"
          disabled={isSubmitting}
          className="h-11 rounded-xl bg-[#1e3a8a] px-5 text-sm font-semibold !text-white transition hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Submitting..." : buttonLabel}
        </button>
      ) : null}

      {errorMessage ? <p className="text-sm text-[#b91c1c]">{errorMessage}</p> : null}
    </form>
  );
}
