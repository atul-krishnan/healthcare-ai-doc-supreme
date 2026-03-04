"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";

type ApplicationStatus = "pending" | "approved" | "rejected" | "disabled";

type DoctorApplyResponse = {
  role: "patient" | "doctor" | "admin";
  application: {
    id: string;
    status: ApplicationStatus;
    full_name: string;
    specialization: string;
    languages: string[];
    registration_number: string;
    registration_council: string;
    years_experience: number;
    city: string;
    phone: string;
    whatsapp: string | null;
    quickcheck_opt_in: boolean;
    availability_days: string[];
    availability_window: string;
    terms_accepted: boolean;
    rejection_reason: string | null;
    reviewed_at: string | null;
    created_at: string;
    updated_at: string;
  } | null;
  doctor: {
    id: string;
    active: boolean;
    role: string;
    name: string;
  } | null;
  error?: string;
};

type ApplyFormState = {
  fullName: string;
  specialization: string;
  languagesInput: string;
  registrationNumber: string;
  registrationCouncil: string;
  yearsExperience: string;
  city: string;
  phone: string;
  whatsapp: string;
  quickcheckOptIn: boolean;
  availabilityDays: string[];
  availabilityStartTime: string;
  availabilityEndTime: string;
  termsAccepted: boolean;
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

const defaultState: ApplyFormState = {
  fullName: "",
  specialization: "",
  languagesInput: "English",
  registrationNumber: "",
  registrationCouncil: "",
  yearsExperience: "0",
  city: "",
  phone: "",
  whatsapp: "",
  quickcheckOptIn: true,
  availabilityDays: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
  availabilityStartTime: "19:00",
  availabilityEndTime: "22:00",
  termsAccepted: false,
};

function parseAvailabilityWindow(value: string | null | undefined) {
  if (!value || !value.includes("-")) {
    return { start: "19:00", end: "22:00" };
  }

  const [start, end] = value.split("-");
  const startValue = start?.trim();
  const endValue = end?.trim();

  if (!startValue || !endValue) {
    return { start: "19:00", end: "22:00" };
  }

  return {
    start: startValue,
    end: endValue,
  };
}

function parseLanguageList(input: string) {
  const values = input
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 8);

  return values.length > 0 ? values : ["English"];
}

function statusLabel(status: ApplicationStatus) {
  if (status === "pending") return "Pending review";
  if (status === "approved") return "Approved";
  if (status === "rejected") return "Rejected";
  return "Disabled";
}

export function DoctorApplyPanel() {
  const [form, setForm] = useState<ApplyFormState>(defaultState);
  const [application, setApplication] = useState<DoctorApplyResponse["application"]>(null);
  const [doctor, setDoctor] = useState<DoctorApplyResponse["doctor"]>(null);
  const [role, setRole] = useState<DoctorApplyResponse["role"]>("patient");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      const response = await fetch("/api/doctor/apply");
      const body = (await response.json()) as DoctorApplyResponse;

      if (cancelled) {
        return;
      }

      setLoading(false);

      if (!response.ok) {
        setStatus(body.error ?? "Unable to load doctor onboarding data.");
        return;
      }

      setRole(body.role);
      setApplication(body.application ?? null);
      setDoctor(body.doctor ?? null);

      if (body.application) {
        const availability = parseAvailabilityWindow(body.application.availability_window);
        setForm({
          fullName: body.application.full_name,
          specialization: body.application.specialization,
          languagesInput: body.application.languages.join(", "),
          registrationNumber: body.application.registration_number,
          registrationCouncil: body.application.registration_council,
          yearsExperience: String(body.application.years_experience),
          city: body.application.city,
          phone: body.application.phone,
          whatsapp: body.application.whatsapp ?? "",
          quickcheckOptIn: body.application.quickcheck_opt_in,
          availabilityDays: body.application.availability_days,
          availabilityStartTime: availability.start,
          availabilityEndTime: availability.end,
          termsAccepted: body.application.terms_accepted,
        });
      }
    }

    void loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const canEdit = useMemo(() => {
    if (doctor?.active) {
      return false;
    }

    if (!application) {
      return true;
    }

    return application.status === "pending";
  }, [application, doctor?.active]);

  function toggleDay(day: string) {
    setForm((current) => {
      const exists = current.availabilityDays.includes(day);
      return {
        ...current,
        availabilityDays: exists
          ? current.availabilityDays.filter((item) => item !== day)
          : [...current.availabilityDays, day],
      };
    });
  }

  async function submitApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);

    if (!canEdit) {
      return;
    }

    if (!form.termsAccepted) {
      setStatus("You must accept doctor platform terms before submitting.");
      return;
    }

    if (form.availabilityDays.length === 0) {
      setStatus("Select at least one availability day.");
      return;
    }

    const yearsExperience = Number(form.yearsExperience);
    if (!Number.isInteger(yearsExperience) || yearsExperience < 0 || yearsExperience > 80) {
      setStatus("Years experience should be a number between 0 and 80.");
      return;
    }

    const payload = {
      fullName: form.fullName,
      specialization: form.specialization,
      languages: parseLanguageList(form.languagesInput),
      registrationNumber: form.registrationNumber,
      registrationCouncil: form.registrationCouncil,
      yearsExperience,
      city: form.city,
      phone: form.phone,
      whatsapp: form.whatsapp,
      quickcheckOptIn: form.quickcheckOptIn,
      availabilityDays: form.availabilityDays,
      availabilityWindow: `${form.availabilityStartTime}-${form.availabilityEndTime}`,
      termsAccepted: form.termsAccepted,
    };

    setSaving(true);
    const response = await fetch("/api/doctor/apply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const body = (await response.json()) as { application?: DoctorApplyResponse["application"]; error?: string };
    setSaving(false);

    if (!response.ok) {
      setStatus(body.error ?? "Unable to submit doctor application.");
      return;
    }

    if (body.application) {
      setApplication(body.application);
    }

    setStatus("Application submitted. Your profile is now pending admin review.");
  }

  return (
    <section className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-[var(--text)]">Doctor onboarding</p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Submit your details for verification. After admin approval, your doctor workspace is enabled.
          </p>
        </div>
        {application ? (
          <span className="rounded-full border border-[var(--line)] bg-[var(--surface-alt)] px-3 py-1 text-xs font-semibold text-[var(--text)]">
            {statusLabel(application.status)}
          </span>
        ) : null}
      </div>

      {loading ? <p className="mt-4 text-sm text-[var(--muted)]">Loading...</p> : null}

      {!loading && doctor?.active ? (
        <div className="mt-4 grid gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] p-4">
          <p className="text-sm text-[var(--text)]">Your doctor profile is active. You can open your assigned queue now.</p>
          <div>
            <Link href="/doctor" className="inline-flex rounded-xl bg-[var(--brand-600)] px-4 py-2 text-sm font-semibold text-white">
              Open doctor workspace
            </Link>
          </div>
        </div>
      ) : null}

      {!loading && application?.status === "rejected" ? (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          <p className="font-semibold">Application rejected</p>
          <p className="mt-1">{application.rejection_reason ?? "No reason was provided."}</p>
          <p className="mt-2 text-xs">Ask admin to reopen your application if you need to re-submit details.</p>
        </div>
      ) : null}

      {!loading && role === "admin" ? (
        <p className="mt-4 rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] p-3 text-sm text-[var(--muted)]">
          Admin accounts are managed in the doctor applications review page.
        </p>
      ) : null}

      {!loading && role !== "admin" ? (
        <form onSubmit={submitApplication} className="mt-4 grid gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-sm text-[var(--muted)]">
              Full name
              <input
                value={form.fullName}
                onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
                className="rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] px-3 py-2"
                disabled={!canEdit}
                required
              />
            </label>
            <label className="grid gap-1 text-sm text-[var(--muted)]">
              Specialization
              <input
                value={form.specialization}
                onChange={(event) => setForm((current) => ({ ...current, specialization: event.target.value }))}
                className="rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] px-3 py-2"
                disabled={!canEdit}
                placeholder="General medicine"
                required
              />
            </label>
          </div>

          <label className="grid gap-1 text-sm text-[var(--muted)]">
            Languages (comma-separated)
            <input
              value={form.languagesInput}
              onChange={(event) => setForm((current) => ({ ...current, languagesInput: event.target.value }))}
              className="rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] px-3 py-2"
              disabled={!canEdit}
              required
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-sm text-[var(--muted)]">
              Registration number
              <input
                value={form.registrationNumber}
                onChange={(event) => setForm((current) => ({ ...current, registrationNumber: event.target.value }))}
                className="rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] px-3 py-2"
                disabled={!canEdit}
                required
              />
            </label>
            <label className="grid gap-1 text-sm text-[var(--muted)]">
              Council / state
              <input
                value={form.registrationCouncil}
                onChange={(event) => setForm((current) => ({ ...current, registrationCouncil: event.target.value }))}
                className="rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] px-3 py-2"
                disabled={!canEdit}
                required
              />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <label className="grid gap-1 text-sm text-[var(--muted)]">
              Years experience
              <input
                value={form.yearsExperience}
                onChange={(event) => setForm((current) => ({ ...current, yearsExperience: event.target.value }))}
                className="rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] px-3 py-2"
                type="number"
                min={0}
                max={80}
                disabled={!canEdit}
                required
              />
            </label>
            <label className="grid gap-1 text-sm text-[var(--muted)]">
              City
              <input
                value={form.city}
                onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
                className="rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] px-3 py-2"
                disabled={!canEdit}
                required
              />
            </label>
            <label className="grid gap-1 text-sm text-[var(--muted)]">
              Phone (for calls)
              <input
                value={form.phone}
                onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                className="rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] px-3 py-2"
                disabled={!canEdit}
                required
              />
            </label>
          </div>

          <label className="grid gap-1 text-sm text-[var(--muted)]">
            WhatsApp (optional)
            <input
              value={form.whatsapp}
              onChange={(event) => setForm((current) => ({ ...current, whatsapp: event.target.value }))}
              className="rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] px-3 py-2"
              disabled={!canEdit}
            />
          </label>

          <label className="flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] px-3 py-2 text-sm text-[var(--text)]">
            <input
              type="checkbox"
              checked={form.quickcheckOptIn}
              onChange={(event) => setForm((current) => ({ ...current, quickcheckOptIn: event.target.checked }))}
              disabled={!canEdit}
            />
            Opt in for Quick Check assignment window
          </label>

          <div className="grid gap-2">
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--muted)]">Availability days</p>
            <div className="flex flex-wrap gap-2">
              {dayOptions.map((day) => {
                const active = form.availabilityDays.includes(day.id);
                return (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => toggleDay(day.id)}
                    disabled={!canEdit}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      active
                        ? "border-[var(--brand-500)] bg-[var(--brand-100)] text-[var(--brand-700)]"
                        : "border-[var(--line)] bg-white text-[var(--muted)]"
                    } disabled:cursor-not-allowed disabled:opacity-70`}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-sm text-[var(--muted)]">
              Availability start
              <input
                type="time"
                value={form.availabilityStartTime}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    availabilityStartTime: event.target.value,
                  }))
                }
                className="rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] px-3 py-2"
                disabled={!canEdit}
              />
            </label>
            <label className="grid gap-1 text-sm text-[var(--muted)]">
              Availability end
              <input
                type="time"
                value={form.availabilityEndTime}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    availabilityEndTime: event.target.value,
                  }))
                }
                className="rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] px-3 py-2"
                disabled={!canEdit}
              />
            </label>
          </div>

          <label className="flex items-start gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] px-3 py-2 text-sm text-[var(--text)]">
            <input
              type="checkbox"
              checked={form.termsAccepted}
              onChange={(event) => setForm((current) => ({ ...current, termsAccepted: event.target.checked }))}
              disabled={!canEdit}
              className="mt-1"
            />
            I consent to doctor platform terms and verification review.
          </label>

          <button
            type="submit"
            disabled={!canEdit || saving}
            className="justify-self-start rounded-xl bg-[var(--brand-600)] px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Submitting..." : application ? "Update application" : "Submit application"}
          </button>
        </form>
      ) : null}

      {status ? <p className="mt-3 text-sm text-[var(--muted)]">{status}</p> : null}
    </section>
  );
}
