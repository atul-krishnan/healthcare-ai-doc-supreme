"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type ChatRole = "bot" | "user";

type ScriptEntry = {
  role: ChatRole;
  text: string;
  typingMs: number;
  pauseMs: number;
};

type TriageResult = {
  urgency: string;
  route: string;
  specialist: string;
  reason: string;
};

const demoScript: ScriptEntry[] = [
  {
    role: "bot",
    text: "Starting quick care navigation demo. What symptoms are you facing today?",
    typingMs: 1600,
    pauseMs: 800,
  },
  {
    role: "user",
    text: "I have had a bad cough for three days and mild chest heaviness.",
    typingMs: 1200,
    pauseMs: 700,
  },
  {
    role: "bot",
    text: "Do you have fever, breathing trouble, or unusual fatigue right now?",
    typingMs: 1500,
    pauseMs: 700,
  },
  {
    role: "user",
    text: "Slight fever and fatigue, no severe breathing trouble.",
    typingMs: 1100,
    pauseMs: 700,
  },
  {
    role: "bot",
    text: "How long has this been going on, and do you have any chronic condition?",
    typingMs: 1600,
    pauseMs: 700,
  },
  {
    role: "user",
    text: "Around 3 days. I have mild asthma history.",
    typingMs: 1100,
    pauseMs: 700,
  },
  {
    role: "bot",
    text: "Understood. Generating your care route and specialist suggestion.",
    typingMs: 1500,
    pauseMs: 600,
  },
];

const triageResult: TriageResult = {
  urgency: "Moderate urgency",
  route: "Teleconsult within 1 hour. If breathing worsens, move to urgent in-person care.",
  specialist: "Primary care physician, with pulmonology follow-up if needed",
  reason: "Respiratory symptoms with asthma history require same-day clinician review.",
};

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="inline-flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current [animation-delay:120ms]" />
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current [animation-delay:240ms]" />
      </span>
      <span className="text-xs opacity-80">typing...</span>
    </span>
  );
}

export function HeroChatDemo() {
  const [playbackKey, setPlaybackKey] = useState(0);

  return <HeroChatDemoPlayback key={playbackKey} onReplay={() => setPlaybackKey((prev) => prev + 1)} />;
}

type HeroChatDemoPlaybackProps = {
  onReplay: () => void;
};

function HeroChatDemoPlayback({ onReplay }: HeroChatDemoPlaybackProps) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [typingRole, setTypingRole] = useState<ChatRole | null>(null);
  const [showResult, setShowResult] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const visibleMessages = useMemo(() => demoScript.slice(0, visibleCount), [visibleCount]);

  useEffect(() => {
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    let timeline = 500;

    demoScript.forEach((entry, index) => {
      timers.push(
        setTimeout(() => {
          if (cancelled) return;
          setTypingRole(entry.role);
        }, timeline),
      );

      timeline += entry.typingMs;

      timers.push(
        setTimeout(() => {
          if (cancelled) return;
          setTypingRole(null);
          setVisibleCount(index + 1);
        }, timeline),
      );

      timeline += entry.pauseMs;
    });

    timers.push(
      setTimeout(() => {
        if (cancelled) return;
        setShowResult(true);
      }, timeline + 200),
    );

    timers.push(
      setTimeout(() => {
        if (cancelled) return;
        onReplay();
      }, timeline + 7000),
    );

    return () => {
      cancelled = true;
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [onReplay]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  }, [showResult, typingRole, visibleCount]);

  return (
    <div className="overflow-hidden rounded-2xl border border-[#d0dcf0] bg-white shadow-[0_8px_30px_rgba(30,58,138,0.08)]">
      <div className="border-b border-[#e2e8f0] bg-[#f8fafc] px-4 py-2.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#ef4444]" />
            <span className="h-2 w-2 rounded-full bg-[#f59e0b]" />
            <span className="h-2 w-2 rounded-full bg-[#22c55e]" />
            <span className="ml-3 text-xs font-medium text-[#64748b]">AI Chatbot Demo</span>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.07em] text-[#2563eb]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#2563eb]" />
            Auto replay
          </span>
        </div>
      </div>

      <div className="p-4">
        <div ref={scrollContainerRef} className="h-[320px] space-y-3 overflow-y-auto pr-1">
          <div className="space-y-2.5">
          {visibleMessages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={
                message.role === "user"
                  ? "ml-auto w-fit max-w-[80%] rounded-2xl bg-[#1e3a8a] px-4 py-2.5 text-sm !text-white"
                  : "w-fit max-w-[82%] rounded-2xl bg-[#eff6ff] px-4 py-2.5 text-sm text-[#1e293b]"
              }
            >
              {message.text}
            </div>
          ))}

          {typingRole ? (
            <div
              className={
                typingRole === "user"
                  ? "ml-auto w-fit rounded-2xl bg-[#1e3a8a] px-4 py-2.5 text-sm !text-white"
                  : "w-fit rounded-2xl bg-[#eff6ff] px-4 py-2.5 text-sm text-[#1e293b]"
              }
            >
              <TypingDots />
            </div>
          ) : null}
          </div>

          {showResult ? (
            <div className="rounded-xl border border-[#dbeafe] bg-[#f8fbff] p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#2563eb]">{triageResult.urgency}</p>
              <p className="mt-1 text-sm font-semibold text-[#0f172a]">Recommended care route</p>
              <p className="text-sm text-[#334155]">{triageResult.route}</p>
              <p className="mt-2 text-sm font-semibold text-[#0f172a]">Specialist suggestion</p>
              <p className="text-sm text-[#334155]">{triageResult.specialist}</p>
              <p className="mt-2 text-xs text-[#64748b]">{triageResult.reason}</p>
              <div className="mt-3 flex items-center gap-2">
                <a
                  href="#waitlist"
                  className="inline-flex h-8 items-center rounded-lg bg-[#1e3a8a] px-3 text-xs font-bold !text-white transition hover:bg-[#1d4ed8]"
                >
                  Join Waitlist
                </a>
                <button
                  type="button"
                  onClick={onReplay}
                  className="inline-flex h-8 items-center rounded-lg border border-[#cbd5e1] bg-white px-3 text-xs font-semibold text-[#334155] transition hover:bg-[#f8fafc]"
                >
                  Replay now
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-[#e2e8f0] bg-white px-3 py-2 text-xs text-[#64748b]">
              Autoplaying recorded demo. No input needed.
            </div>
          )}
        </div>

        <p className="mt-3 text-[11px] text-[#94a3b8]">Demo only. Decision support, not diagnosis.</p>
      </div>
    </div>
  );
}
