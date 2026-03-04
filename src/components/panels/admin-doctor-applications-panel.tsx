"use client";

import { useEffect, useState } from "react";

type DoctorApplication = {
  id: string;
  auth_user_id: string;
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
  status: "pending" | "approved" | "rejected" | "disabled";
  reviewed_at: string | null;
  reviewed_by: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
};

type StatusFilter = "pending" | "approved" | "rejected" | "disabled";

const filters: StatusFilter[] = ["pending", "approved", "rejected", "disabled"];

export function AdminDoctorApplicationsPanel() {
  const [filter, setFilter] = useState<StatusFilter>("pending");
  const [applications, setApplications] = useState<DoctorApplication[]>([]);
  const [rejectionReasonById, setRejectionReasonById] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  async function loadApplications(nextFilter: StatusFilter = filter) {
    setLoading(true);
    const response = await fetch(`/api/admin/doctor-applications?status=${nextFilter}`);
    const body = (await response.json()) as { applications?: DoctorApplication[]; error?: string };
    setLoading(false);

    if (!response.ok) {
      setStatus(body.error ?? "Unable to load doctor applications.");
      return;
    }

    setApplications(body.applications ?? []);
  }

  useEffect(() => {
    void loadApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function reviewApplication(applicationId: string, decision: "approved" | "rejected" | "disabled") {
    setStatus(null);

    if ((decision === "rejected" || decision === "disabled") && !(rejectionReasonById[applicationId] ?? "").trim()) {
      setStatus("Provide a reason for rejection/disable.");
      return;
    }

    setBusyId(applicationId);
    const response = await fetch("/api/admin/doctor-applications", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        applicationId,
        decision,
        rejectionReason: (rejectionReasonById[applicationId] ?? "").trim() || undefined,
      }),
    });
    const body = (await response.json()) as { error?: string };
    setBusyId(null);

    if (!response.ok) {
      setStatus(body.error ?? "Unable to update application.");
      return;
    }

    setStatus(`Application ${decision}.`);
    await loadApplications();
  }

  return (
    <section className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-[var(--text)]">Doctor applications</p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Approve, reject, or disable doctor accounts. Only approved doctors receive queue access.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                filter === item
                  ? "border-[var(--brand-500)] bg-[var(--brand-100)] text-[var(--brand-700)]"
                  : "border-[var(--line)] bg-white text-[var(--muted)]"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {loading ? <p className="mt-4 text-sm text-[var(--muted)]">Loading...</p> : null}

      {!loading && applications.length === 0 ? (
        <p className="mt-4 rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] p-3 text-sm text-[var(--muted)]">
          No applications in this state.
        </p>
      ) : null}

      <div className="mt-4 grid gap-3">
        {applications.map((application) => (
          <article key={application.id} className="rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[var(--text)]">{application.full_name}</p>
                <p className="text-xs text-[var(--muted)]">
                  {application.specialization} • {application.city} • {application.years_experience} years
                </p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {application.languages.join(", ")} • {application.availability_window} • {application.availability_days.join(", ")}
                </p>
              </div>
              <span className="rounded-full border border-[var(--line)] bg-white px-2 py-1 text-xs font-semibold text-[var(--text)]">
                {application.status}
              </span>
            </div>

            <div className="mt-2 grid gap-1 text-xs text-[var(--muted)]">
              <p>Reg#: {application.registration_number}</p>
              <p>Council: {application.registration_council}</p>
              <p>Phone: {application.phone}</p>
              {application.whatsapp ? <p>WhatsApp: {application.whatsapp}</p> : null}
              {application.rejection_reason ? <p>Reason: {application.rejection_reason}</p> : null}
            </div>

            <label className="mt-3 grid gap-1 text-xs text-[var(--muted)]">
              Review note (required for reject/disable)
              <input
                value={rejectionReasonById[application.id] ?? ""}
                onChange={(event) =>
                  setRejectionReasonById((current) => ({
                    ...current,
                    [application.id]: event.target.value,
                  }))
                }
                className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm"
                placeholder="Reason for decision"
              />
            </label>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busyId === application.id}
                onClick={() => void reviewApplication(application.id, "approved")}
                className="rounded-lg bg-[var(--brand-600)] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
              >
                Approve
              </button>
              <button
                type="button"
                disabled={busyId === application.id}
                onClick={() => void reviewApplication(application.id, "rejected")}
                className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 disabled:opacity-60"
              >
                Reject
              </button>
              <button
                type="button"
                disabled={busyId === application.id}
                onClick={() => void reviewApplication(application.id, "disabled")}
                className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 disabled:opacity-60"
              >
                Disable
              </button>
            </div>
          </article>
        ))}
      </div>

      {status ? <p className="mt-4 text-sm text-[var(--muted)]">{status}</p> : null}
    </section>
  );
}
