"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

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

export function ChatRoom() {
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
    }
  }

  return (
    <div className="grid gap-4">
      <div className="max-h-96 space-y-3 overflow-y-auto rounded-xl border border-[var(--line)] p-4">
        {loading ? <p className="text-sm text-[var(--muted)]">Loading conversation...</p> : null}
        {!loading && grouped.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No messages yet. Ask your first question.</p>
        ) : null}

        {grouped.map((message) => (
          <article
            key={message.id}
            className={`max-w-[85%] rounded-xl px-4 py-3 text-sm ${
              message.role === "patient"
                ? "ml-auto bg-[var(--brand-100)]"
                : message.role === "doctor"
                  ? "mr-auto border border-[var(--line)] bg-white"
                  : "mr-auto bg-[var(--surface-alt)]"
            }`}
          >
            <p className="mb-1 text-xs uppercase tracking-wide text-[var(--muted)]">{message.role}</p>
            <p>{message.content}</p>
          </article>
        ))}
      </div>

      <form onSubmit={onSubmit} className="grid gap-3 rounded-xl border border-[var(--line)] p-4">
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Describe your issue or ask a follow-up question..."
          className="min-h-24 rounded-lg border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--brand-500)]"
        />
        <button
          type="submit"
          className="justify-self-start rounded-full bg-[var(--brand-500)] px-5 py-2 text-sm font-semibold text-white"
        >
          Send Message
        </button>
      </form>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
