"use client";

import { useEffect, useMemo, useState } from "react";

type QueueItem = {
  id: string;
  briefId: string;
  slotId: string;
  status: string;
  language: "english" | "hindi";
  phoneMasked: string;
  doctorId: string | null;
  startTime: string | null;
  endTime: string | null;
  createdAt: string;
};

type QueueResponse = {
  queue?: QueueItem[];
  doctor?: {
    id: string;
    name: string;
    role: string;
  };
  error?: string;
};

type BookingDetail = {
  booking: {
    id: string;
    status: string;
    language: "english" | "hindi";
    phone: string;
    notes: string | null;
    brief: {
      id: string;
      title: string;
      care_setting: string;
      department_bucket: string;
      summary_json: {
        doctor_summary_sections?: {
          hpi?: string;
          relevantHistory?: string;
          medicationsAllergies?: string;
        };
      };
      created_at: string;
    };
    attachments: Array<{
      id: string;
      fileName: string;
      mimeType: string;
      downloadUrl: string | null;
    }>;
  };
  error?: string;
};

export function DoctorQuickcheckPanel() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<BookingDetail["booking"] | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [outcomeCare, setOutcomeCare] = useState("urgent_today");
  const [outcomeDept, setOutcomeDept] = useState("general_medicine");
  const [busy, setBusy] = useState(false);

  const selected = useMemo(() => queue.find((item) => item.id === selectedId) ?? null, [queue, selectedId]);

  async function loadQueue() {
    const response = await fetch("/api/doctor/quickcheck/queue");
    const body = (await response.json()) as QueueResponse;

    if (!response.ok) {
      setStatus(body.error ?? "Unable to load quick-check queue.");
      return;
    }

    setQueue(body.queue ?? []);

    if ((body.queue ?? []).length > 0) {
      const next = selectedId && body.queue?.some((item) => item.id === selectedId) ? selectedId : body.queue?.[0]?.id;
      if (next) {
        setSelectedId(next);
        await loadDetail(next);
      }
    } else {
      setSelectedId(null);
      setDetail(null);
    }
  }

  async function loadDetail(bookingId: string) {
    const response = await fetch(`/api/doctor/quickcheck/bookings/${bookingId}`);
    const body = (await response.json()) as BookingDetail;

    if (!response.ok || !body.booking) {
      setStatus(body.error ?? "Unable to load booking details.");
      return;
    }

    setDetail(body.booking);
    setNotes(body.booking.notes ?? "");
  }

  useEffect(() => {
    void loadQueue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function assignSelected() {
    if (!selectedId) {
      return;
    }

    const response = await fetch(`/api/doctor/quickcheck/bookings/${selectedId}/assign`, {
      method: "POST",
    });

    const body = (await response.json()) as { error?: string };
    if (!response.ok) {
      setStatus(body.error ?? "Unable to assign booking.");
      return;
    }

    setStatus("Booking assigned.");
    await loadQueue();
  }

  async function updateStatus(action: "start_call" | "complete_call" | "mark_no_show") {
    if (!selectedId) {
      return;
    }

    setBusy(true);
    const response = await fetch(`/api/doctor/quickcheck/bookings/${selectedId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action,
        notes,
        outcomeCareSetting: action === "complete_call" ? outcomeCare : undefined,
        outcomeDepartmentBucket: action === "complete_call" ? outcomeDept : undefined,
      }),
    });

    const body = (await response.json()) as { error?: string };
    setBusy(false);

    if (!response.ok) {
      setStatus(body.error ?? "Unable to update booking.");
      return;
    }

    setStatus(
      action === "start_call"
        ? "Call started."
        : action === "mark_no_show"
          ? "Marked as no-show."
          : "Call completed and outcome recorded.",
    );

    await loadQueue();
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
      <aside className="rounded-2xl border border-[#D8E6E6] bg-white p-3">
        <p className="mb-2 text-sm font-semibold text-[#1D3557]">Quick Check Queue</p>
        <div className="grid gap-2">
          {queue.length === 0 ? <p className="text-sm text-[#6f8499]">No quick-check bookings.</p> : null}
          {queue.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={async () => {
                setSelectedId(item.id);
                await loadDetail(item.id);
              }}
              className={`rounded-xl border p-3 text-left text-sm ${
                selectedId === item.id ? "border-[#2A9D8F] bg-[#F4FBF8]" : "border-[#D8E6E6]"
              }`}
            >
              <p className="font-semibold text-[#1D3557]">{item.status.toUpperCase()}</p>
              <p className="text-xs text-[#6b8198]">{item.startTime ? new Date(item.startTime).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : "No slot"}</p>
              <p className="text-xs text-[#6b8198]">Phone: {item.phoneMasked}</p>
            </button>
          ))}
        </div>
      </aside>

      <section className="rounded-2xl border border-[#D8E6E6] bg-white p-4">
        {!selected || !detail ? (
          <p className="text-sm text-[#6f8499]">Select a booking to view details.</p>
        ) : (
          <div className="grid gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E7EFF3] pb-3">
              <div>
                <p className="text-sm font-semibold text-[#1D3557]">Booking {selected.id.slice(0, 8)}</p>
                <p className="text-xs text-[#6f8499]">Status: {detail.status}</p>
              </div>
              <button type="button" onClick={assignSelected} className="rounded-lg border border-[#D8E6E6] px-3 py-1.5 text-xs">
                Assign to me
              </button>
            </div>

            <div className="grid gap-2 rounded-xl border border-[#E7EFF3] bg-[#F9FCFF] p-3 text-sm text-[#395b75]">
              <p>
                <strong>{detail.brief.title}</strong> | {detail.brief.care_setting.replaceAll("_", " ")} | {detail.brief.department_bucket.replaceAll("_", " ")}
              </p>
              <p>{detail.brief.summary_json?.doctor_summary_sections?.hpi ?? ""}</p>
              <p>{detail.brief.summary_json?.doctor_summary_sections?.relevantHistory ?? ""}</p>
              <p>{detail.brief.summary_json?.doctor_summary_sections?.medicationsAllergies ?? ""}</p>
            </div>

            <div>
              <p className="text-sm font-semibold text-[#1D3557]">Attachments</p>
              {detail.attachments.length === 0 ? (
                <p className="text-sm text-[#6f8499]">No attachments.</p>
              ) : (
                <ul className="mt-2 grid gap-2 text-sm">
                  {detail.attachments.map((item) => (
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

            <label className="grid gap-1 text-sm">
              Doctor notes
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className="min-h-24 rounded-xl border border-[#D8E6E6] px-3 py-2"
                placeholder="Call summary and guidance"
              />
            </label>

            <div className="grid gap-2 sm:grid-cols-2">
              <label className="grid gap-1 text-sm">
                Outcome care setting
                <select
                  value={outcomeCare}
                  onChange={(event) => setOutcomeCare(event.target.value)}
                  className="rounded-xl border border-[#D8E6E6] px-3 py-2"
                >
                  <option value="self_care">self care</option>
                  <option value="opd_24_72h">opd 24-72h</option>
                  <option value="urgent_today">urgent today</option>
                  <option value="er_now">er now</option>
                </select>
              </label>
              <label className="grid gap-1 text-sm">
                Outcome department
                <select
                  value={outcomeDept}
                  onChange={(event) => setOutcomeDept(event.target.value)}
                  className="rounded-xl border border-[#D8E6E6] px-3 py-2"
                >
                  <option value="general_medicine">general medicine</option>
                  <option value="ent">ent</option>
                  <option value="ortho">ortho</option>
                  <option value="derm">derm</option>
                  <option value="gyn">gyn</option>
                  <option value="gastro">gastro</option>
                  <option value="neuro">neuro</option>
                  <option value="cardio">cardio</option>
                  <option value="pulmo">pulmo</option>
                  <option value="pediatrics">pediatrics</option>
                  <option value="other">other</option>
                </select>
              </label>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void updateStatus("start_call")}
                disabled={busy}
                className="rounded-xl border border-[#D8E6E6] px-4 py-2 text-sm font-semibold text-[#1D3557]"
              >
                Start call
              </button>
              <button
                type="button"
                onClick={() => void updateStatus("complete_call")}
                disabled={busy}
                className="rounded-xl bg-[#2A9D8F] px-4 py-2 text-sm font-semibold text-white"
              >
                Complete call
              </button>
              <button
                type="button"
                onClick={() => void updateStatus("mark_no_show")}
                disabled={busy}
                className="rounded-xl border border-[#E6C9C9] px-4 py-2 text-sm font-semibold text-[#8E3A3A]"
              >
                Mark no-show
              </button>
            </div>
          </div>
        )}
        {status ? <p className="mt-3 text-sm text-[#2b6c60]">{status}</p> : null}
      </section>
    </div>
  );
}
