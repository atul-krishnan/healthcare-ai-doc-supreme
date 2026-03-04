"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type AvailabilityPayload = {
  availabilityEnabled: boolean;
  availabilityDays: string[];
  availabilityStartTime: string;
  availabilityEndTime: string;
};

const dayOptions = [
  { id: "sun", label: "Sun" },
  { id: "mon", label: "Mon" },
  { id: "tue", label: "Tue" },
  { id: "wed", label: "Wed" },
  { id: "thu", label: "Thu" },
  { id: "fri", label: "Fri" },
  { id: "sat", label: "Sat" },
] as const;

const defaultAvailability: AvailabilityPayload = {
  availabilityEnabled: true,
  availabilityDays: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
  availabilityStartTime: "19:00",
  availabilityEndTime: "22:00",
};

export function DoctorAvailabilityPanel() {
  const [availability, setAvailability] = useState<AvailabilityPayload>(defaultAvailability);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const availableTonight = useMemo(() => {
    const now = new Date();
    const dayKeys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    const today = dayKeys[now.getUTCDay()];
    return availability.availabilityEnabled && availability.availabilityDays.includes(today);
  }, [availability.availabilityDays, availability.availabilityEnabled]);

  useEffect(() => {
    let cancelled = false;

    async function loadAvailability() {
      setLoading(true);
      const response = await fetch("/api/doctor/availability");
      const body = (await response.json()) as {
        availability?: AvailabilityPayload;
        error?: string;
      };

      if (cancelled) {
        return;
      }

      setLoading(false);

      if (!response.ok) {
        setStatus(body.error ?? "Unable to load availability settings.");
        return;
      }

      if (body.availability) {
        setAvailability(body.availability);
      }
    }

    void loadAvailability();

    return () => {
      cancelled = true;
    };
  }, []);

  function toggleDay(day: string) {
    setAvailability((current) => {
      const hasDay = current.availabilityDays.includes(day);
      const nextDays = hasDay
        ? current.availabilityDays.filter((item) => item !== day)
        : [...current.availabilityDays, day];

      return {
        ...current,
        availabilityDays: nextDays,
      };
    });
  }

  async function saveAvailability(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);

    if (availability.availabilityDays.length === 0) {
      setStatus("Choose at least one active day.");
      return;
    }

    setSaving(true);
    const response = await fetch("/api/doctor/availability", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(availability),
    });
    const body = (await response.json()) as { availability?: AvailabilityPayload; error?: string };
    setSaving(false);

    if (!response.ok) {
      setStatus(body.error ?? "Unable to save availability settings.");
      return;
    }

    if (body.availability) {
      setAvailability(body.availability);
    }

    setStatus("Availability saved.");
  }

  return (
    <section className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--text)]">Quick Check availability</p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Control when you are eligible for auto-assignment and manual assignment.
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            availableTonight
              ? "bg-[var(--brand-100)] text-[var(--brand-700)]"
              : "border border-[var(--line)] bg-[var(--surface-alt)] text-[var(--muted)]"
          }`}
        >
          {availableTonight ? "Available tonight" : "Not available tonight"}
        </span>
      </div>

      {loading ? (
        <p className="mt-3 text-sm text-[var(--muted)]">Loading availability...</p>
      ) : (
        <form onSubmit={saveAvailability} className="mt-4 grid gap-4">
          <label className="flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] px-3 py-2 text-sm text-[var(--text)]">
            <input
              type="checkbox"
              checked={availability.availabilityEnabled}
              onChange={(event) =>
                setAvailability((current) => ({
                  ...current,
                  availabilityEnabled: event.target.checked,
                }))
              }
            />
            Available for Quick Check assignment
          </label>

          <div className="grid gap-2">
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--muted)]">Active days</p>
            <div className="flex flex-wrap gap-2">
              {dayOptions.map((day) => {
                const active = availability.availabilityDays.includes(day.id);
                return (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => toggleDay(day.id)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      active
                        ? "border-[var(--brand-500)] bg-[var(--brand-100)] text-[var(--brand-700)]"
                        : "border-[var(--line)] bg-white text-[var(--muted)] hover:border-[var(--brand-400)]"
                    }`}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-sm text-[var(--muted)]">
              Start time
              <input
                type="time"
                value={availability.availabilityStartTime}
                onChange={(event) =>
                  setAvailability((current) => ({
                    ...current,
                    availabilityStartTime: event.target.value,
                  }))
                }
                className="rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] px-3 py-2"
              />
            </label>
            <label className="grid gap-1 text-sm text-[var(--muted)]">
              End time
              <input
                type="time"
                value={availability.availabilityEndTime}
                onChange={(event) =>
                  setAvailability((current) => ({
                    ...current,
                    availabilityEndTime: event.target.value,
                  }))
                }
                className="rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] px-3 py-2"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="justify-self-start rounded-xl bg-[var(--brand-600)] px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save availability"}
          </button>
        </form>
      )}

      {status ? <p className="mt-3 text-sm text-[var(--muted)]">{status}</p> : null}
    </section>
  );
}
