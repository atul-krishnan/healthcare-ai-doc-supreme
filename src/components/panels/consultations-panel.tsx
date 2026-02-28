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
  normal: "bg-zinc-100 text-zinc-800",
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

  const selected = useMemo(
    () => consultations.find((item) => item.id === selectedId) ?? null,
    [consultations, selectedId],
  );

  async function loadConsultations() {
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

    if (loaded.length > 0) {
      const nextSelected = selectedId && loaded.some((item) => item.id === selectedId) ? selectedId : loaded[0].id;
      setSelectedId(nextSelected);
      await loadMessages(nextSelected);
    } else {
      setSelectedId(null);
      setMessages([]);
    }
  }

  async function loadMessages(consultationId: string) {
    const response = await fetch(`/api/consultations/${consultationId}/messages`);
    const body = (await response.json()) as { messages?: ConsultationMessage[]; error?: string };

    if (!response.ok) {
      setStatus(body.error ?? "Unable to load consultation messages.");
      return;
    }

    setMessages(body.messages ?? []);
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
    setStatus("Consultation created.");
    await loadConsultations();

    if (body.consultation?.id) {
      setSelectedId(body.consultation.id);
      await loadMessages(body.consultation.id);
    }
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
      body: JSON.stringify({
        status: "cancelled",
      }),
    });

    const body = (await response.json()) as { error?: string };

    if (!response.ok) {
      setStatus(body.error ?? "Unable to cancel consultation.");
      return;
    }

    setStatus("Consultation cancelled.");
    await loadConsultations();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <div className="space-y-4">
        <form onSubmit={createConsultation} className="grid gap-3 rounded-xl border border-[var(--line)] p-4">
          <p className="text-sm font-semibold">Start new consultation</p>
          <textarea
            value={chiefComplaint}
            onChange={(event) => setChiefComplaint(event.target.value)}
            className="min-h-24 rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
            placeholder="Describe symptoms, duration, and risks..."
          />
          <label className="grid gap-1 text-sm">
            Priority
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value as Consultation["priority"])}
              className="rounded-lg border border-[var(--line)] px-3 py-2"
            >
              <option value="normal">Normal</option>
              <option value="urgent">Urgent</option>
              <option value="critical">Critical</option>
            </select>
          </label>
          <textarea
            value={firstMessage}
            onChange={(event) => setFirstMessage(event.target.value)}
            className="min-h-20 rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
            placeholder="Optional first message to doctor"
          />
          <button type="submit" className="rounded-full bg-[var(--brand-500)] px-4 py-2 text-sm font-semibold text-white">
            Create Consultation
          </button>
        </form>

        <div className="rounded-xl border border-[var(--line)] p-3">
          <p className="mb-2 text-sm font-semibold">Your consultations</p>
          {loading ? <p className="text-xs text-[var(--muted)]">Loading...</p> : null}
          <div className="grid gap-2">
            {consultations.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={async () => {
                  setSelectedId(item.id);
                  await loadMessages(item.id);
                }}
                className={`rounded-lg border p-3 text-left text-sm ${
                  selectedId === item.id ? "border-[var(--brand-500)] bg-[var(--surface-alt)]" : "border-[var(--line)]"
                }`}
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${priorityBadgeStyle[item.priority]}`}>
                    {item.priority}
                  </span>
                  <span className="text-xs uppercase text-[var(--muted)]">{item.status}</span>
                </div>
                <p className="line-clamp-2">{item.chief_complaint}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 rounded-xl border border-[var(--line)] p-4">
        {selected ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] pb-3">
              <div>
                <p className="text-sm font-semibold">Consultation #{selected.id.slice(0, 8)}</p>
                <p className="text-xs text-[var(--muted)]">Status: {selected.status}</p>
              </div>
              {(selected.status === "open" || selected.status === "assigned" || selected.status === "in_progress") && (
                <button
                  type="button"
                  onClick={cancelConsultation}
                  className="rounded-full border border-red-200 px-4 py-1.5 text-xs font-semibold text-red-700"
                >
                  Cancel consultation
                </button>
              )}
            </div>

            <div className="max-h-96 space-y-3 overflow-y-auto rounded-lg border border-[var(--line)] p-3">
              {messages.length === 0 ? <p className="text-sm text-[var(--muted)]">No messages yet.</p> : null}
              {messages.map((message) => (
                <article
                  key={message.id}
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                    message.sender_role === "patient"
                      ? "ml-auto bg-[var(--brand-100)]"
                      : message.sender_role === "doctor"
                        ? "mr-auto border border-[var(--line)] bg-white"
                        : "mr-auto bg-[var(--surface-alt)]"
                  }`}
                >
                  <p className="mb-1 text-xs uppercase tracking-wide text-[var(--muted)]">{message.sender_role}</p>
                  <p>{message.content}</p>
                </article>
              ))}
            </div>

            <form onSubmit={sendMessage} className="grid gap-2">
              <textarea
                value={messageDraft}
                onChange={(event) => setMessageDraft(event.target.value)}
                className="min-h-24 rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
                placeholder="Send update to your assigned doctor..."
              />
              <button
                type="submit"
                className="justify-self-start rounded-full bg-[var(--brand-500)] px-5 py-2 text-sm font-semibold text-white"
              >
                Send message
              </button>
            </form>
          </>
        ) : (
          <p className="text-sm text-[var(--muted)]">Create a consultation to start doctor workflow.</p>
        )}
      </div>

      {status ? <p className="text-sm text-[var(--muted)] lg:col-span-2">{status}</p> : null}
    </div>
  );
}
