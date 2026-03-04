"use client";

import { useEffect, useMemo, useState } from "react";

type AuditEvent = {
  id: string;
  source: "doctor_access_log" | "audit_events";
  timestamp: string;
  action: string;
  doctor: {
    id: string | null;
    authUserId: string | null;
    name: string | null;
    specialization: string | null;
  };
  brief: {
    id: string | null;
    title: string | null;
    careSetting: string | null;
    departmentBucket: string | null;
  };
  consultation: {
    id: string | null;
    status: string | null;
    priority: string | null;
    chiefComplaint: string | null;
  };
  metadata: unknown;
};

type AuditResponse = {
  events?: AuditEvent[];
  summary?: Record<string, number>;
  doctorOptions?: Array<{
    id: string;
    name: string;
    specialization: string | null;
  }>;
  error?: string;
};

const dayFilters = [7, 30, 90] as const;

function formatActionLabel(action: string) {
  return action.replaceAll("_", " ");
}

function actionTone(action: string) {
  if (action.includes("download")) {
    return "text-amber-700 bg-amber-50 border-amber-200";
  }
  if (action.includes("completed") || action.includes("changed_outcome")) {
    return "text-emerald-700 bg-emerald-50 border-emerald-200";
  }
  if (action.includes("assigned")) {
    return "text-sky-700 bg-sky-50 border-sky-200";
  }
  return "text-[var(--brand-700)] bg-[var(--brand-50)] border-[var(--brand-200)]";
}

export function AdminDoctorAuditPanel() {
  const [days, setDays] = useState<number>(30);
  const [doctorId, setDoctorId] = useState<string>("");
  const [actionFilter, setActionFilter] = useState<string>("");
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [summary, setSummary] = useState<Record<string, number>>({});
  const [doctorOptions, setDoctorOptions] = useState<AuditResponse["doctorOptions"]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);

  const availableActions = useMemo(() => Object.keys(summary).sort((a, b) => a.localeCompare(b)), [summary]);

  async function loadEvents() {
    setLoading(true);
    setStatus(null);

    const params = new URLSearchParams();
    params.set("days", String(days));
    params.set("limit", "300");
    if (doctorId) {
      params.set("doctorId", doctorId);
    }
    if (actionFilter) {
      params.set("action", actionFilter);
    }

    const response = await fetch(`/api/admin/audit/doctor-access?${params.toString()}`);
    const body = (await response.json()) as AuditResponse;
    setLoading(false);

    if (!response.ok) {
      setStatus(body.error ?? "Unable to load doctor audit events.");
      return;
    }

    setEvents(body.events ?? []);
    setSummary(body.summary ?? {});
    setDoctorOptions(body.doctorOptions ?? []);
  }

  useEffect(() => {
    void loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days, doctorId, actionFilter]);

  return (
    <section className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-[var(--text)]">Doctor access audit log</p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Track brief views, attachment downloads, outcome changes, and consultation assignment/completion events.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadEvents()}
          className="rounded-xl border border-[var(--line)] px-4 py-2 text-xs font-semibold text-[var(--text)]"
        >
          Refresh
        </button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <label className="grid gap-1 text-xs text-[var(--muted)]">
          Time window
          <div className="flex flex-wrap gap-2">
            {dayFilters.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setDays(item)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                  days === item
                    ? "border-[var(--brand-500)] bg-[var(--brand-100)] text-[var(--brand-700)]"
                    : "border-[var(--line)] bg-white text-[var(--muted)]"
                }`}
              >
                {item}d
              </button>
            ))}
          </div>
        </label>

        <label className="grid gap-1 text-xs text-[var(--muted)]">
          Doctor
          <select
            value={doctorId}
            onChange={(event) => setDoctorId(event.target.value)}
            className="rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] px-3 py-2 text-sm"
          >
            <option value="">All doctors</option>
            {(doctorOptions ?? []).map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} {item.specialization ? `(${item.specialization})` : ""}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1 text-xs text-[var(--muted)]">
          Action
          <select
            value={actionFilter}
            onChange={(event) => setActionFilter(event.target.value)}
            className="rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] px-3 py-2 text-sm"
          >
            <option value="">All actions</option>
            {availableActions.map((action) => (
              <option key={action} value={action}>
                {formatActionLabel(action)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {Object.entries(summary)
          .sort((a, b) => b[1] - a[1])
          .map(([action, count]) => (
            <span key={action} className="rounded-full border border-[var(--line)] bg-[var(--surface-alt)] px-3 py-1 text-xs text-[var(--muted)]">
              {formatActionLabel(action)}: {count}
            </span>
          ))}
      </div>

      {loading ? <p className="mt-4 text-sm text-[var(--muted)]">Loading audit events...</p> : null}

      {!loading && events.length === 0 ? (
        <p className="mt-4 rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] p-3 text-sm text-[var(--muted)]">
          No events found for this filter set.
        </p>
      ) : null}

      <div className="mt-4 grid gap-2">
        {events.map((event) => (
          <article key={`${event.source}-${event.id}`} className="rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${actionTone(event.action)}`}>
                  {formatActionLabel(event.action)}
                </span>
                <span className="text-xs text-[var(--muted)]">{event.source === "doctor_access_log" ? "Brief access" : "Workflow event"}</span>
              </div>
              <span className="text-xs text-[var(--muted)]">
                {new Date(event.timestamp).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
              </span>
            </div>

            <div className="mt-2 grid gap-1 text-xs text-[var(--muted)]">
              <p>
                Doctor: <span className="font-semibold text-[var(--text)]">{event.doctor.name ?? "Unknown"}</span>
                {event.doctor.specialization ? ` • ${event.doctor.specialization}` : ""}
              </p>
              {event.brief.id ? (
                <p>
                  Brief: <span className="font-semibold text-[var(--text)]">{event.brief.title ?? "Brief"}</span>
                  {event.brief.careSetting ? ` • ${event.brief.careSetting.replaceAll("_", " ")}` : ""}
                  {event.brief.departmentBucket ? ` • ${event.brief.departmentBucket.replaceAll("_", " ")}` : ""}
                </p>
              ) : null}
              {event.consultation.id ? (
                <p>
                  Consultation: <span className="font-semibold text-[var(--text)]">{event.consultation.id.slice(0, 8)}</span>
                  {event.consultation.status ? ` • ${event.consultation.status}` : ""}
                  {event.consultation.priority ? ` • ${event.consultation.priority}` : ""}
                </p>
              ) : null}
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              {event.brief.id ? (
                <a
                  href={`/briefs/${event.brief.id}`}
                  className="rounded-lg border border-[var(--line)] bg-white px-2 py-1 text-xs font-semibold text-[var(--text)]"
                >
                  Open brief
                </a>
              ) : null}
              {event.consultation.id ? (
                <a
                  href="/doctor"
                  className="rounded-lg border border-[var(--line)] bg-white px-2 py-1 text-xs font-semibold text-[var(--text)]"
                >
                  Open doctor workspace
                </a>
              ) : null}
            </div>
          </article>
        ))}
      </div>

      {status ? <p className="mt-4 text-sm text-[var(--muted)]">{status}</p> : null}
    </section>
  );
}
