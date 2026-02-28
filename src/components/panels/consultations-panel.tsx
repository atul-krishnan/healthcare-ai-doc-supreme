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
          className="rounded-xl border border-[#dfddd8] bg-white px-3 py-2 text-sm text-[#706a63]"
        >
          ↻ Refresh
        </button>
        <button
          type="button"
          onClick={() => setShowCreate((state) => !state)}
          className="rounded-2xl bg-[#191614] px-6 py-3 text-sm font-semibold text-white"
        >
          + New Visit
        </button>
      </div>

      {showCreate ? (
        <form onSubmit={createConsultation} className="grid gap-3 rounded-2xl border border-[#e3e1dc] bg-white p-5">
          <p className="text-sm font-semibold text-[#2a2825]">Start a new doctor visit</p>
          <textarea
            value={chiefComplaint}
            onChange={(event) => setChiefComplaint(event.target.value)}
            className="min-h-24 rounded-xl border border-[#e8e6e2] px-3 py-2 text-sm"
            placeholder="Describe symptoms, duration, prior medication, and concern..."
          />
          <label className="grid gap-1 text-sm text-[#5e5a54]">
            Priority
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value as Consultation["priority"])}
              className="rounded-xl border border-[#e8e6e2] px-3 py-2"
            >
              <option value="normal">Normal</option>
              <option value="urgent">Urgent</option>
              <option value="critical">Critical</option>
            </select>
          </label>
          <textarea
            value={firstMessage}
            onChange={(event) => setFirstMessage(event.target.value)}
            className="min-h-20 rounded-xl border border-[#e8e6e2] px-3 py-2 text-sm"
            placeholder="Optional first message"
          />
          <button type="submit" className="justify-self-start rounded-xl bg-[#171412] px-5 py-2 text-sm font-semibold text-white">
            Start visit
          </button>
        </form>
      ) : null}

      {loading ? <p className="text-sm text-[#8d8881]">Loading visits...</p> : null}

      {consultations.length === 0 && !loading ? (
        <section className="rounded-3xl border border-[#e4e1dc] bg-white p-10 text-center">
          <div className="mx-auto inline-flex h-24 w-24 items-center justify-center rounded-3xl border border-[#dceef6] bg-[#f6fbfe] text-4xl text-[#77b5d1]">
            ☤
          </div>
          <h3 className="mt-7 font-serif text-[2rem] text-[#23211f]">No visits yet</h3>
          <p className="mx-auto mt-3 max-w-xl text-base text-[#7d7972]">
            Connect with a board-certified physician. Get prescriptions sent to your pharmacy same-day.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm text-[#78736d]">
            <span className="rounded-full border border-[#e3e0da] px-3 py-1.5">Async messaging</span>
            <span className="rounded-full border border-[#e3e0da] px-3 py-1.5">Prescriptions</span>
            <span className="rounded-full border border-[#e3e0da] px-3 py-1.5">Async responses</span>
          </div>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="mt-7 rounded-2xl bg-[#191614] px-7 py-3 text-sm font-semibold text-white"
          >
            Start Your First Visit →
          </button>
        </section>
      ) : null}

      {consultations.length > 0 ? (
        <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
          <section className="rounded-2xl border border-[#e3e1dc] bg-white p-4">
            <p className="text-sm font-semibold text-[#2b2825]">Visits</p>
            <div className="mt-3 grid gap-2">
              {consultations.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={async () => {
                    setSelectedId(item.id);
                    await loadMessages(item.id);
                  }}
                  className={`rounded-xl border p-3 text-left transition-colors ${
                    selectedId === item.id
                      ? "border-[#7bb8d3] bg-[#f3fafd]"
                      : "border-[#eceae5] bg-[#fbfbfa] hover:border-[#ddd9d2]"
                  }`}
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${priorityBadgeStyle[item.priority]}`}>
                      {item.priority}
                    </span>
                    <span className="text-xs uppercase text-[#8f8a84]">{item.status}</span>
                  </div>
                  <p className="line-clamp-2 text-sm text-[#2f2d29]">{item.chief_complaint}</p>
                </button>
              ))}
            </div>
          </section>

          <section className="grid gap-4 rounded-2xl border border-[#e3e1dc] bg-white p-4">
            {selected ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ebe8e3] pb-3">
                  <div>
                    <p className="text-sm font-semibold text-[#2f2d29]">Visit #{selected.id.slice(0, 8)}</p>
                    <p className="text-xs text-[#8a857e]">Status: {selected.status}</p>
                  </div>
                  {(selected.status === "open" || selected.status === "assigned" || selected.status === "in_progress") && (
                    <button
                      type="button"
                      onClick={cancelConsultation}
                      className="rounded-full border border-red-200 px-4 py-1.5 text-xs font-semibold text-red-700"
                    >
                      Cancel visit
                    </button>
                  )}
                </div>

                <div className="max-h-96 space-y-3 overflow-y-auto rounded-xl border border-[#ece9e4] bg-[#fafaf9] p-3">
                  {messages.length === 0 ? <p className="text-sm text-[#8d8881]">No messages yet.</p> : null}
                  {messages.map((message) => (
                    <article
                      key={message.id}
                      className={`max-w-[86%] rounded-xl px-3 py-2 text-sm ${
                        message.sender_role === "patient"
                          ? "ml-auto bg-[#7cb9d4] text-white"
                          : message.sender_role === "doctor"
                            ? "mr-auto border border-[#e2dfd9] bg-white text-[#2f2d29]"
                            : "mr-auto bg-[#eceae6] text-[#2f2d29]"
                      }`}
                    >
                      <p className="mb-1 text-xs uppercase tracking-wide opacity-80">{message.sender_role}</p>
                      <p>{message.content}</p>
                    </article>
                  ))}
                </div>

                <form onSubmit={sendMessage} className="grid gap-2">
                  <textarea
                    value={messageDraft}
                    onChange={(event) => setMessageDraft(event.target.value)}
                    className="min-h-24 rounded-xl border border-[#e8e5df] px-3 py-2 text-sm"
                    placeholder="Send update to your assigned doctor..."
                  />
                  <button type="submit" className="justify-self-start rounded-xl bg-[#171412] px-5 py-2 text-sm font-semibold text-white">
                    Send message
                  </button>
                </form>
              </>
            ) : (
              <p className="text-sm text-[#8d8881]">Select a visit to see full discussion.</p>
            )}
          </section>
        </div>
      ) : null}

      {status ? <p className="text-sm text-[#7f7a73]">{status}</p> : null}
    </div>
  );
}
