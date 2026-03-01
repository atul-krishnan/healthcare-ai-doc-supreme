"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type ChatMessage = {
  id: string;
  role: "patient" | "doctor" | "assistant";
  content: string;
  created_at: string;
};

type ChatResponse = {
  threadId: string;
  messages: ChatMessage[];
};

function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

/* ── Icon helpers ────────────────────────────────────── */
function RecordsIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6M8 13h8M8 17h8M8 9h2" />
    </svg>
  );
}

function DoctorIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
    </svg>
  );
}

function LabIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3h6M10 3v7l-4 7a2 2 0 001.75 3h8.5A2 2 0 0018 17l-4-7V3" />
      <path d="M8 14h8" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

export function ChatRoom() {
  const router = useRouter();
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const grouped = useMemo(() => messages, [messages]);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const query = threadId ? `?threadId=${encodeURIComponent(threadId)}` : "";
      const response = await fetch(`/api/chat/messages${query}`);
      const payload = (await response.json()) as ChatResponse & { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to load messages");
      }

      setThreadId(payload.threadId);
      setMessages(payload.messages);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load messages");
    } finally {
      setLoading(false);
    }
  }, [threadId]);

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!draft.trim()) {
      return;
    }

    setError(null);
    setSending(true);

    try {
      const response = await fetch("/api/chat/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          threadId,
          content: draft.trim(),
        }),
      });

      const payload = (await response.json()) as ChatResponse & { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to send message");
      }

      setThreadId(payload.threadId);
      setMessages(payload.messages);
      setDraft("");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to send message");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-3xl gap-0">
      {/* ── Chat header ───────────────────────────────── */}
      <div className="rounded-t-2xl border border-[var(--line)] bg-white px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--brand-500)] to-[var(--brand-700)]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 8V4m0 4a2 2 0 100 4 2 2 0 000-4z" />
              <path d="M12 12v2m-4 4h8a2 2 0 002-2v-1a4 4 0 00-4-4h-4a4 4 0 00-4 4v1a2 2 0 002 2z" />
              <path d="M9 4h6" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--text)]">YourDoc AI</p>
            <p className="text-xs text-[var(--muted)]">
              {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          </div>
        </div>
      </div>

      {/* ── Messages area ─────────────────────────────── */}
      <div className="max-h-[500px] min-h-[340px] space-y-4 overflow-y-auto border-x border-[var(--line)] bg-[var(--brand-50)] p-5">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--line)] border-t-[var(--brand-600)]" />
          </div>
        ) : null}

        {!loading && grouped.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-[var(--muted)]">No messages yet. Ask your first question below.</p>
          </div>
        ) : null}

        {grouped.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "patient" ? "justify-end" : "justify-start"}`}
          >
            <div className="max-w-[85%]">
              {/* Role label for non-patient */}
              {message.role !== "patient" ? (
                <p className="mb-1 text-xs font-medium text-[var(--brand-600)]">
                  {message.role === "assistant" ? "YourDoc AI" : "Doctor"}
                </p>
              ) : null}
              <article
                className={`px-4 py-3 text-sm leading-relaxed ${message.role === "patient"
                    ? "chat-bubble-user bg-[var(--brand-600)] text-white"
                    : message.role === "doctor"
                      ? "chat-bubble-ai border border-[var(--line)] bg-white text-[var(--text)]"
                      : "chat-bubble-ai bg-[var(--brand-100)] text-[var(--text)]"
                  }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </article>
              <p className={`mt-1 text-[10px] text-[var(--muted)]/70 ${message.role === "patient" ? "text-right" : ""}`}>
                {formatTime(message.created_at)}
              </p>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {sending ? (
          <div className="flex justify-start">
            <div className="chat-bubble-ai bg-[var(--brand-100)] px-4 py-3">
              <div className="flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--brand-600)] [animation-delay:0ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--brand-600)] [animation-delay:150ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--brand-600)] [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* ── Action buttons row (PranaDoc-style) ────────── */}
      <div className="flex items-center justify-center gap-3 border-x border-[var(--line)] bg-white px-5 py-3">
        <button
          type="button"
          onClick={() => router.push("/vault")}
          className="hover-scale inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] px-3.5 py-2 text-xs font-medium text-[var(--text)] transition-colors hover:border-[var(--brand-600)] hover:text-[var(--brand-600)]"
        >
          <RecordsIcon />
          Records
        </button>
        <button
          type="button"
          onClick={() => router.push("/consultations")}
          className="hover-scale inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] px-3.5 py-2 text-xs font-medium text-[var(--text)] transition-colors hover:border-[var(--brand-600)] hover:text-[var(--brand-600)]"
        >
          <DoctorIcon />
          Add a Doctor
        </button>
        <button
          type="button"
          onClick={() => router.push("/health-records")}
          className="hover-scale inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] px-3.5 py-2 text-xs font-medium text-[var(--text)] transition-colors hover:border-[var(--brand-600)] hover:text-[var(--brand-600)]"
        >
          <LabIcon />
          Labs
        </button>
      </div>

      {/* ── Input bar ────────────────────────────────── */}
      <div className="rounded-b-2xl border border-[var(--line)] bg-white p-4">
        <form onSubmit={onSubmit} className="flex items-end gap-3">
          <input
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-xl border border-[var(--line)] bg-[var(--brand-50)] px-4 py-3 text-sm text-[var(--text)] placeholder:text-[var(--muted)]/70 outline-none transition-colors focus:border-[var(--brand-600)] focus:bg-white"
          />
          <button
            type="submit"
            disabled={sending || !draft.trim()}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--brand-600)] text-white shadow-[0_2px_8px_rgba(37,99,235,0.3)] transition-all hover:bg-[var(--brand-700)] hover:shadow-[0_4px_12px_rgba(37,99,235,0.4)] disabled:opacity-50"
          >
            <SendIcon />
          </button>
        </form>

        {/* HIPAA badge */}
        <p className="mt-3 text-center text-[10px] text-[var(--muted)]/70">
          🔒 HIPAA-Aligned
        </p>
      </div>

      {error ? (
        <p className="mt-2 rounded-xl bg-[#FFF6F6] p-3 text-sm text-red-700">{error}</p>
      ) : null}
    </div>
  );
}
