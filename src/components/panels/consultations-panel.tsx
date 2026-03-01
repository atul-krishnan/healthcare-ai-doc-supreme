"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Consultation = {
  id: string;
  patient_id: string;
  doctor_id: string | null;
  status: "open" | "assigned" | "in_progress" | "completed" | "cancelled";
  priority: "normal" | "urgent" | "critical";
  chief_complaint: string;
  clinical_summary: string | null;
  resolution_notes: string | null;
  created_at: string;
  updated_at: string;
};

type ConsultationMessage = {
  id: string;
  consultation_id: string;
  sender_id: string;
  sender_role: "patient" | "doctor" | "assistant";
  content: string;
  created_at: string;
};

const priorityBadgeStyle: Record<Consultation["priority"], string> = {
  normal: "bg-zinc-100 text-zinc-700",
  urgent: "bg-amber-100 text-amber-900",
  critical: "bg-red-100 text-red-900",
};

export function ConsultationsPanel() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [messages, setMessages] = useState<ConsultationMessage[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [priority, setPriority] = useState<Consultation["priority"]>("normal");
  const [firstMessage, setFirstMessage] = useState("");
  const [messageDraft, setMessageDraft] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const selected = useMemo(
    () => consultations.find((item) => item.id === selectedId) ?? null,
    [consultations, selectedId],
  );

  async function loadMessages(consultationId: string) {
    const response = await fetch(`/api/consultations/${consultationId}/messages`);
    const body = (await response.json()) as { messages?: ConsultationMessage[]; error?: string };

    if (!response.ok) {
      setStatus(body.error ?? "Unable to load consultation messages.");
      return;
    }

    setMessages(body.messages ?? []);
  }

  async function loadConsultations(keepSelected = true) {
    setLoading(true);
    const response = await fetch("/api/consultations");
    const body = (await response.json()) as { consultations?: Consultation[]; error?: string };
    setLoading(false);

    if (!response.ok) {
      setStatus(body.error ?? "Unable to load consultations.");
      return;
    }

    const loaded = body.consultations ?? [];
    setConsultations(loaded);

    if (loaded.length === 0) {
      setSelectedId(null);
      setMessages([]);
      return;
    }

    const nextSelected =
      keepSelected && selectedId && loaded.some((item) => item.id === selectedId) ? selectedId : loaded[0].id;
    setSelectedId(nextSelected);
    await loadMessages(nextSelected);
  }

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      setLoading(true);
      const response = await fetch("/api/consultations");
      const body = (await response.json()) as { consultations?: Consultation[]; error?: string };

      if (cancelled) {
        return;
      }

      setLoading(false);

      if (!response.ok) {
        setStatus(body.error ?? "Unable to load consultations.");
        return;
      }

      const loaded = body.consultations ?? [];
      setConsultations(loaded);

      if (loaded.length === 0) {
        setSelectedId(null);
        setMessages([]);
        return;
      }

      const nextSelected = loaded[0].id;
      setSelectedId(nextSelected);
      const messageResponse = await fetch(`/api/consultations/${nextSelected}/messages`);
      const messageBody = (await messageResponse.json()) as { messages?: ConsultationMessage[]; error?: string };

      if (cancelled) {
        return;
      }

      if (!messageResponse.ok) {
        setStatus(messageBody.error ?? "Unable to load consultation messages.");
        return;
      }

      setMessages(messageBody.messages ?? []);
    }

    void initialize();

    return () => {
      cancelled = true;
    };
  }, []);

  async function createConsultation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (chiefComplaint.trim().length < 10) {
      setStatus("Chief complaint should have at least 10 characters.");
      return;
    }

    const response = await fetch("/api/consultations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chiefComplaint,
        priority,
        firstMessage: firstMessage.trim() || undefined,
      }),
    });

    const body = (await response.json()) as { consultation?: Consultation; error?: string };

    if (!response.ok) {
      setStatus(body.error ?? "Unable to create consultation.");
      return;
    }

    setChiefComplaint("");
    setFirstMessage("");
    setShowCreate(false);
    setStatus("Visit created.");
    await loadConsultations(false);
  }

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedId || !messageDraft.trim()) {
      return;
    }

    const response = await fetch(`/api/consultations/${selectedId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: messageDraft.trim() }),
    });

    const body = (await response.json()) as { messages?: ConsultationMessage[]; error?: string };

    if (!response.ok) {
      setStatus(body.error ?? "Unable to send message.");
      return;
    }

    setMessages(body.messages ?? []);
    setMessageDraft("");
    await loadConsultations();
  }

  async function cancelConsultation() {
    if (!selectedId) {
      return;
    }

    const response = await fetch(`/api/consultations/${selectedId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "cancelled" }),
    });

    const body = (await response.json()) as { error?: string };

    if (!response.ok) {
      setStatus(body.error ?? "Unable to cancel visit.");
      return;
    }

    setStatus("Visit cancelled.");
    await loadConsultations();
  }

  return (
    <div className="grid gap-8">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => void loadConsultations()}
          className="rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--muted)] shadow-sm hover:bg-[var(--surface-alt)] transition-colors"
        >
          ↻ Refresh
        </button>
        <button
          type="button"
          onClick={() => setShowCreate((state) => !state)}
          className="rounded-xl bg-[var(--brand-600)] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-[var(--brand-500)]/20 hover:bg-[var(--brand-700)] transition-colors"
        >
          + New Visit
        </button>
      </div>

      {showCreate ? (
        <form onSubmit={createConsultation} className="grid gap-3 rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-[var(--text)]">Start a new doctor visit</p>
          <textarea
            value={chiefComplaint}
            onChange={(event) => setChiefComplaint(event.target.value)}
            className="min-h-24 rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] px-3 py-2 text-sm focus:border-[var(--brand-500)] focus:ring-1 focus:ring-[var(--brand-500)] outline-none transition-all"
            placeholder="Describe symptoms, duration, prior medication, and concern..."
          />
          <label className="grid gap-1 text-sm font-medium text-[var(--muted)]">
            Priority
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value as Consultation["priority"])}
              className="rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] px-3 py-2 outline-none focus:border-[var(--brand-500)] focus:ring-1 focus:ring-[var(--brand-500)] transition-all"
            >
              <option value="normal">Normal</option>
              <option value="urgent">Urgent</option>
              <option value="critical">Critical</option>
            </select>
          </label>
          <textarea
            value={firstMessage}
            onChange={(event) => setFirstMessage(event.target.value)}
            className="min-h-20 rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] px-3 py-2 text-sm focus:border-[var(--brand-500)] focus:ring-1 focus:ring-[var(--brand-500)] outline-none transition-all"
            placeholder="Optional first message"
          />
          <button type="submit" className="justify-self-start rounded-xl bg-[var(--brand-600)] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-[var(--brand-500)]/20 hover:bg-[var(--brand-700)] transition-colors">
            Start visit
          </button>
        </form>
      ) : null}

      {loading ? <p className="text-sm text-[#8d8881]">Loading visits...</p> : null}

      {consultations.length === 0 && !loading ? (
        <section className="rounded-3xl border border-[var(--line)] bg-white p-10 text-center shadow-sm">
          <div className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-[var(--brand-100)] text-4xl text-[var(--brand-600)] shadow-inner">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <h3 className="mt-7 font-serif text-[2.2rem] text-[var(--text)]">No visits yet</h3>
          <p className="mx-auto mt-3 max-w-xl text-base text-[var(--muted)]">
            See a real doctor. Get prescriptions delivered to your pharmacy — same day.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm font-medium text-[var(--muted)]">
            <span className="rounded-full border border-[var(--line)] bg-[var(--surface-alt)] px-4 py-1.5">Async messaging</span>
            <span className="rounded-full border border-[var(--line)] bg-[var(--surface-alt)] px-4 py-1.5">Prescriptions</span>
            <span className="rounded-full border border-[var(--line)] bg-[var(--surface-alt)] px-4 py-1.5">Async responses</span>
          </div>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="mt-8 rounded-xl bg-[var(--brand-600)] px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-[var(--brand-500)]/30 hover:bg-[var(--brand-700)] transition-all hover:scale-105"
          >
            Start Your First Visit &rarr;
          </button>
        </section>
      ) : null}

      {consultations.length > 0 ? (
        <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
          <section className="rounded-2xl border border-[var(--line)] bg-white p-4 shadow-sm">
            <p className="text-sm font-bold text-[var(--text)]">Visits</p>
            <div className="mt-3 grid gap-2">
              {consultations.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={async () => {
                    setSelectedId(item.id);
                    await loadMessages(item.id);
                  }}
                  className={`rounded-xl border p-3 text-left transition-all ${selectedId === item.id
                    ? "border-[var(--brand-400)] bg-[var(--brand-50)] shadow-sm"
                    : "border-[var(--line)] bg-[var(--surface-alt)] hover:border-[var(--brand-300)] hover:bg-white"
                    }`}
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${priorityBadgeStyle[item.priority]}`}>
                      {item.priority}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">{item.status}</span>
                  </div>
                  <p className="line-clamp-2 text-sm leading-relaxed text-[var(--text)]">{item.chief_complaint}</p>
                </button>
              ))}
            </div>
          </section>

          <section className="grid gap-4 rounded-2xl border border-[var(--line)] bg-white p-4 shadow-sm">
            {selected ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] pb-4">
                  <div>
                    <p className="text-sm font-bold text-[var(--text)]">Visit #{selected.id.slice(0, 8)}</p>
                    <p className="mt-0.5 text-xs font-medium text-[var(--muted)]">Status: {selected.status}</p>
                  </div>
                  {(selected.status === "open" || selected.status === "assigned" || selected.status === "in_progress") && (
                    <button
                      type="button"
                      onClick={cancelConsultation}
                      className="rounded-xl border border-red-200 bg-red-50/50 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-100 transition-colors"
                    >
                      Cancel visit
                    </button>
                  )}
                </div>

                <div className="max-h-96 space-y-4 overflow-y-auto rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] p-4">
                  {messages.length === 0 ? <p className="text-sm text-[var(--muted)] text-center py-4">No messages yet.</p> : null}
                  {messages.map((message) => (
                    <article
                      key={message.id}
                      className={`max-w-[86%] rounded-2xl px-4 py-2.5 text-sm ${message.sender_role === "patient"
                        ? "ml-auto bg-[var(--brand-600)] text-white shadow-md shadow-[var(--brand-500)]/20 rounded-tr-sm"
                        : message.sender_role === "doctor"
                          ? "mr-auto border border-[var(--line)] bg-white text-[var(--text)] shadow-sm rounded-tl-sm"
                          : "mr-auto bg-[var(--line)] text-[var(--text)] rounded-tl-sm"
                        }`}
                    >
                      <p className="mb-1 text-[10px] font-bold uppercase tracking-wider opacity-90">{message.sender_role}</p>
                      <p className="leading-relaxed">{message.content}</p>
                    </article>
                  ))}
                </div>

                <form onSubmit={sendMessage} className="grid gap-3 pt-2">
                  <textarea
                    value={messageDraft}
                    onChange={(event) => setMessageDraft(event.target.value)}
                    className="min-h-24 rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm focus:border-[var(--brand-500)] focus:ring-1 focus:ring-[var(--brand-500)] outline-none transition-all shadow-inner"
                    placeholder="Send an update to your assigned doctor..."
                  />
                  <button type="submit" className="justify-self-start rounded-xl bg-[var(--brand-600)] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-[var(--brand-500)]/20 hover:bg-[var(--brand-700)] transition-colors">
                    Send message
                  </button>
                </form>
              </>
            ) : (
              <div className="flex h-full min-h-64 items-center justify-center">
                <p className="text-sm text-[var(--muted)]">Select a visit to see full discussion.</p>
              </div>
            )}
          </section>
        </div>
      ) : null}

      {status ? <p className="text-sm text-[#64748B]">{status}</p> : null}
    </div>
  );
}
