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
      <section className="rounded-2xl border border-[#e5e2dc] bg-white p-4">
        <div className="mb-4 flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-[#2a2825]">Care conversation</p>
          <button
            type="button"
            onClick={() => void loadMessages()}
            className="rounded-lg border border-[#e4e1db] bg-[#faf9f7] px-3 py-1.5 text-xs text-[#746f67]"
          >
            Refresh
          </button>
        </div>

        <div className="max-h-[460px] space-y-3 overflow-y-auto rounded-xl border border-[#ece9e3] bg-[#faf9f7] p-4">
          {loading ? <p className="text-sm text-[#8f8a84]">Loading conversation...</p> : null}
          {!loading && grouped.length === 0 ? (
            <p className="text-sm text-[#8f8a84]">No messages yet. Ask your first question.</p>
          ) : null}

          {grouped.map((message) => (
            <article
              key={message.id}
              className={`max-w-[88%] rounded-xl px-4 py-3 text-sm ${
                message.role === "patient"
                  ? "ml-auto bg-[#77b8d4] text-white"
                  : message.role === "doctor"
                    ? "mr-auto border border-[#e4e1db] bg-white text-[#2a2825]"
                    : "mr-auto bg-[#ece9e5] text-[#2a2825]"
              }`}
            >
              <p className="mb-1 text-xs uppercase tracking-wide opacity-80">{message.role}</p>
              <p>{message.content}</p>
            </article>
          ))}
        </div>
      </section>

      <form onSubmit={onSubmit} className="grid gap-3 rounded-2xl border border-[#e5e2dc] bg-white p-4">
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Describe your issue or ask a follow-up question..."
          className="min-h-24 rounded-xl border border-[#e8e4de] bg-[#fcfcfb] px-3 py-2 text-sm"
        />
        <button type="submit" className="justify-self-start rounded-xl bg-[#171412] px-5 py-2 text-sm font-semibold text-white">
          Send message
        </button>
      </form>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
