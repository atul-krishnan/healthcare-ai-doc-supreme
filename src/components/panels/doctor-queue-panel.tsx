"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type QueueConsultation = {
  id: string;
  patient_id: string;
  doctor_id: string | null;
  status: "open" | "assigned" | "in_progress" | "completed" | "cancelled";
  priority: "normal" | "urgent" | "critical";
  chief_complaint: string;
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

const priorityBadgeStyle: Record<QueueConsultation["priority"], string> = {
  normal: "bg-zinc-100 text-zinc-800",
  urgent: "bg-amber-100 text-amber-900",
  critical: "bg-red-100 text-red-900",
};

export function DoctorQueuePanel() {
  const [queue, setQueue] = useState<QueueConsultation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ConsultationMessage[]>([]);
  const [messageDraft, setMessageDraft] = useState("");
  const [clinicalSummary, setClinicalSummary] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [medication, setMedication] = useState("");
  const [dosage, setDosage] = useState("");
  const [instructions, setInstructions] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const selected = useMemo(() => queue.find((item) => item.id === selectedId) ?? null, [queue, selectedId]);

  async function loadQueue() {
    const response = await fetch("/api/doctor/queue");
    const body = (await response.json()) as { queue?: QueueConsultation[]; error?: string };

    if (!response.ok) {
      setStatus(body.error ?? "Unable to load doctor queue.");
      return;
    }

    const loaded = body.queue ?? [];
    setQueue(loaded);

    if (loaded.length > 0) {
      const keep = selectedId && loaded.some((item) => item.id === selectedId) ? selectedId : loaded[0].id;
      setSelectedId(keep);
      await loadMessages(keep);
    } else {
      setSelectedId(null);
      setMessages([]);
    }
  }

  async function loadMessages(consultationId: string) {
    const response = await fetch(`/api/consultations/${consultationId}/messages`);
    const body = (await response.json()) as { messages?: ConsultationMessage[]; error?: string };

    if (!response.ok) {
      setStatus(body.error ?? "Unable to load messages.");
      return;
    }

    setMessages(body.messages ?? []);
  }

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      const response = await fetch("/api/doctor/queue");
      const body = (await response.json()) as { queue?: QueueConsultation[]; error?: string };

      if (cancelled) {
        return;
      }

      if (!response.ok) {
        setStatus(body.error ?? "Unable to load doctor queue.");
        return;
      }

      const loaded = body.queue ?? [];
      setQueue(loaded);

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
        setStatus(messageBody.error ?? "Unable to load messages.");
        return;
      }

      setMessages(messageBody.messages ?? []);
    }

    void initialize();

    return () => {
      cancelled = true;
    };
  }, []);

  async function assignConsultation() {
    if (!selectedId) {
      return;
    }

    const response = await fetch(`/api/doctor/consultations/${selectedId}/assign`, {
      method: "POST",
    });
    const body = (await response.json()) as { error?: string };

    if (!response.ok) {
      setStatus(body.error ?? "Unable to assign consultation.");
      return;
    }

    setStatus("Consultation assigned.");
    await loadQueue();
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

    setMessageDraft("");
    setMessages(body.messages ?? []);
    await loadQueue();
  }

  async function completeConsultation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedId) {
      return;
    }

    const prescriptions = medication.trim()
      ? [
          {
            medication: medication.trim(),
            dosage: dosage.trim() || "As advised",
            instructions: instructions.trim() || "Follow doctor instructions",
          },
        ]
      : [];

    const response = await fetch(`/api/doctor/consultations/${selectedId}/complete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        clinicalSummary,
        resolutionNotes,
        prescriptions,
      }),
    });

    const body = (await response.json()) as { error?: string };

    if (!response.ok) {
      setStatus(body.error ?? "Unable to complete consultation.");
      return;
    }

    setClinicalSummary("");
    setResolutionNotes("");
    setMedication("");
    setDosage("");
    setInstructions("");
    setStatus("Consultation completed.");
    await loadQueue();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <div className="rounded-xl border border-[var(--line)] p-3">
        <p className="mb-2 text-sm font-semibold">Doctor queue</p>
        <div className="grid gap-2">
          {queue.map((item) => (
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

      <div className="grid gap-4 rounded-xl border border-[var(--line)] p-4">
        {selected ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] pb-3">
              <div>
                <p className="text-sm font-semibold">Consultation #{selected.id.slice(0, 8)}</p>
                <p className="text-xs text-[var(--muted)]">Status: {selected.status}</p>
              </div>
              <button
                type="button"
                onClick={assignConsultation}
                className="rounded-full border border-[var(--line)] px-4 py-1.5 text-xs font-semibold hover:border-[var(--brand-400)]"
              >
                Assign to me
              </button>
            </div>

            <div className="max-h-64 space-y-3 overflow-y-auto rounded-lg border border-[var(--line)] p-3">
              {messages.length === 0 ? <p className="text-sm text-[var(--muted)]">No messages yet.</p> : null}
              {messages.map((message) => (
                <article
                  key={message.id}
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                    message.sender_role === "doctor"
                      ? "ml-auto bg-[var(--brand-100)]"
                      : message.sender_role === "patient"
                        ? "mr-auto border border-[var(--line)] bg-white"
                        : "mr-auto bg-[var(--surface-alt)]"
                  }`}
                >
                  <p className="mb-1 text-xs uppercase tracking-wide text-[var(--muted)]">{message.sender_role}</p>
                  <p>{message.content}</p>
                </article>
              ))}
            </div>

            <form onSubmit={sendMessage} className="grid gap-2 rounded-lg border border-[var(--line)] p-3">
              <textarea
                value={messageDraft}
                onChange={(event) => setMessageDraft(event.target.value)}
                className="min-h-20 rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
                placeholder="Reply to patient..."
              />
              <button
                type="submit"
                className="justify-self-start rounded-full bg-[var(--brand-500)] px-4 py-2 text-sm font-semibold text-white"
              >
                Send message
              </button>
            </form>

            <form onSubmit={completeConsultation} className="grid gap-2 rounded-lg border border-[var(--line)] p-3">
              <p className="text-sm font-semibold">Close consultation</p>
              <textarea
                value={clinicalSummary}
                onChange={(event) => setClinicalSummary(event.target.value)}
                className="min-h-20 rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
                placeholder="Clinical summary"
                required
              />
              <textarea
                value={resolutionNotes}
                onChange={(event) => setResolutionNotes(event.target.value)}
                className="min-h-20 rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
                placeholder="Resolution notes"
                required
              />
              <div className="grid gap-2 sm:grid-cols-3">
                <input
                  value={medication}
                  onChange={(event) => setMedication(event.target.value)}
                  className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
                  placeholder="Medication (optional)"
                />
                <input
                  value={dosage}
                  onChange={(event) => setDosage(event.target.value)}
                  className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
                  placeholder="Dosage"
                />
                <input
                  value={instructions}
                  onChange={(event) => setInstructions(event.target.value)}
                  className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
                  placeholder="Instructions"
                />
              </div>
              <button
                type="submit"
                className="justify-self-start rounded-full bg-[var(--brand-500)] px-4 py-2 text-sm font-semibold text-white"
              >
                Complete consultation
              </button>
            </form>
          </>
        ) : (
          <p className="text-sm text-[var(--muted)]">No consultation selected.</p>
        )}
      </div>

      {status ? <p className="text-sm text-[var(--muted)] lg:col-span-2">{status}</p> : null}
    </div>
  );
}
