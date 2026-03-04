"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type DirectoryDoctor = {
  id: string;
  name: string;
  specialization: string | null;
  languages: string[];
  city: string | null;
  worksEvenings: boolean;
  quickcheckAvailable: boolean;
  ratingLabel: string;
};

export function DoctorDirectoryPanel() {
  const [doctors, setDoctors] = useState<DirectoryDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDoctors() {
      setLoading(true);
      const response = await fetch("/api/doctors");
      const body = (await response.json()) as { doctors?: DirectoryDoctor[]; error?: string };

      if (cancelled) {
        return;
      }

      setLoading(false);

      if (!response.ok) {
        setError(body.error ?? "Unable to load doctors.");
        return;
      }

      setDoctors(body.doctors ?? []);
    }

    void loadDoctors();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <p className="text-sm text-[var(--muted)]">Loading doctors...</p>;
  }

  if (error) {
    return <p className="text-sm text-rose-700">{error}</p>;
  }

  if (doctors.length === 0) {
    return (
      <p className="rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] p-4 text-sm text-[var(--muted)]">
        No active doctors are listed yet.
      </p>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {doctors.map((doctor) => (
        <article key={doctor.id} className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-lg font-semibold text-[var(--text)]">Dr. {doctor.name}</p>
              <p className="text-sm text-[var(--muted)]">{doctor.specialization ?? "General medicine"}</p>
            </div>
            <span className="rounded-full border border-[var(--line)] bg-[var(--surface-alt)] px-2 py-1 text-xs text-[var(--muted)]">
              {doctor.ratingLabel}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {doctor.languages.map((language) => (
              <span key={`${doctor.id}-${language}`} className="rounded-full border border-[var(--line)] bg-[var(--surface-alt)] px-2 py-1">
                {language}
              </span>
            ))}
            {doctor.city ? (
              <span className="rounded-full border border-[var(--line)] bg-[var(--surface-alt)] px-2 py-1">{doctor.city}</span>
            ) : null}
            {doctor.worksEvenings ? (
              <span className="rounded-full bg-[var(--brand-100)] px-2 py-1 font-semibold text-[var(--brand-700)]">
                Works evenings
              </span>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={`/doctors/${doctor.id}`}
              className="rounded-xl border border-[var(--line)] px-3 py-2 text-sm font-semibold text-[var(--text)]"
            >
              View profile
            </Link>
            <Link
              href={`/consultations?doctor=${doctor.id}`}
              className="rounded-xl bg-[var(--brand-600)] px-3 py-2 text-sm font-semibold text-white"
            >
              Book consultation
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
