"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type DoctorProfile = {
  id: string;
  name: string;
  specialization: string | null;
  languages: string[];
  city: string | null;
  yearsExperience: number | null;
  quickcheckAvailable: boolean;
  availabilityDays: string[];
  availabilityStartTime: string | null;
  availabilityEndTime: string | null;
  worksEvenings: boolean;
  ratingLabel: string;
  bookingHref: string;
};

const dayOrder = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function formatDays(days: string[]) {
  const sorted = [...days].sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));
  return sorted.join(", ");
}

export function DoctorProfilePanel({ doctorId }: { doctorId: string }) {
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDoctor() {
      setLoading(true);
      const response = await fetch(`/api/doctors/${doctorId}`);
      const body = (await response.json()) as { doctor?: DoctorProfile; error?: string };

      if (cancelled) {
        return;
      }

      setLoading(false);

      if (!response.ok || !body.doctor) {
        setError(body.error ?? "Unable to load doctor profile.");
        return;
      }

      setDoctor(body.doctor);
    }

    void loadDoctor();

    return () => {
      cancelled = true;
    };
  }, [doctorId]);

  if (loading) {
    return <p className="text-sm text-[var(--muted)]">Loading doctor profile...</p>;
  }

  if (error || !doctor) {
    return <p className="text-sm text-rose-700">{error ?? "Doctor not found."}</p>;
  }

  return (
    <section className="rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-2xl font-semibold text-[var(--text)]">Dr. {doctor.name}</p>
          <p className="mt-1 text-sm text-[var(--muted)]">{doctor.specialization ?? "General medicine"}</p>
        </div>
        <span className="rounded-full border border-[var(--line)] bg-[var(--surface-alt)] px-3 py-1 text-xs font-semibold text-[var(--text)]">
          {doctor.ratingLabel}
        </span>
      </div>

      <div className="mt-4 grid gap-2 text-sm text-[var(--muted)]">
        <p>
          <span className="font-semibold text-[var(--text)]">Languages:</span> {doctor.languages.join(", ")}
        </p>
        {doctor.city ? (
          <p>
            <span className="font-semibold text-[var(--text)]">City:</span> {doctor.city}
          </p>
        ) : null}
        {doctor.yearsExperience !== null ? (
          <p>
            <span className="font-semibold text-[var(--text)]">Experience:</span> {doctor.yearsExperience} years
          </p>
        ) : null}
        <p>
          <span className="font-semibold text-[var(--text)]">Quick Check:</span>{" "}
          {doctor.quickcheckAvailable ? "Available" : "Not currently available"}
        </p>
        <p>
          <span className="font-semibold text-[var(--text)]">Availability:</span> {formatDays(doctor.availabilityDays)}
          {doctor.availabilityStartTime && doctor.availabilityEndTime
            ? ` • ${doctor.availabilityStartTime}-${doctor.availabilityEndTime}`
            : ""}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {doctor.worksEvenings ? (
          <span className="rounded-full bg-[var(--brand-100)] px-3 py-1 text-xs font-semibold text-[var(--brand-700)]">
            Works evenings
          </span>
        ) : null}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link href={doctor.bookingHref} className="rounded-xl bg-[var(--brand-600)] px-4 py-2 text-sm font-semibold text-white">
          Book consultation
        </Link>
        <Link href="/doctors" className="rounded-xl border border-[var(--line)] px-4 py-2 text-sm font-semibold text-[var(--text)]">
          Back to doctors
        </Link>
      </div>
    </section>
  );
}
