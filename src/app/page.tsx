import Link from "next/link";
import { SymptomInput } from "@/components/forms/symptom-input";

const trustCards = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2A9D8F" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    title: "Guided, not diagnostic",
    body: "YourDoc Guide helps you decide the right care setting and prepares a clean summary for your doctor.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2A9D8F" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
      </svg>
    ),
    title: "Private by default",
    body: "Uploads are stored in private storage and attached to your intake and brief only.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2A9D8F" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    title: "Doctor follow-up when needed",
    body: "Move from your brief into a real doctor visit when urgency, uncertainty, or preference calls for it.",
  },
];

export default function Home() {
  return (
    <div className="px-4 pb-20 md:px-8">
      {/* ── Hero Section ─────────────────────────────────── */}
      <section className="mx-auto max-w-6xl pt-14 md:pt-20">
        <div className="anim-glow rounded-[2rem] border border-[#D8E6E6] bg-gradient-to-br from-[#F8FCFF] via-white to-[#F3FAF7] p-6 shadow-[0_16px_48px_rgba(42,157,143,0.10)] md:p-10">
          <div className="mx-auto max-w-4xl text-center">
            {/* PranaDoc-style welcome header */}
            <p className="anim-slide-in text-sm font-semibold uppercase tracking-[0.14em] text-[#2A9D8F]">
              YourDoc Guide
            </p>
            <h1 className="anim-slide-in-d1 mt-4 font-serif text-[2.8rem] leading-[0.95] tracking-[-0.02em] text-[#1d1d1b] md:text-[4.2rem]">
              Welcome to <span className="text-[#2A9D8F]">YourDoc</span>
            </h1>
            <p className="anim-slide-in-d2 mt-3 text-lg font-medium text-[#1D3557] md:text-xl">
              Your 24/7 Health Assistant
            </p>
            <p className="anim-slide-in-d3 mx-auto mt-3 max-w-2xl text-base text-[#61788f]">
              Get a free consultation from our AI health expert — and bring a real
              doctor into the chat whenever you need.
            </p>
          </div>

          {/* ── Chat-style input card ──────────────────────── */}
          <div className="anim-slide-in-d3 mx-auto mt-8 max-w-3xl rounded-2xl border border-[#D8E6E6] bg-white p-4 shadow-[0_4px_20px_rgba(42,157,143,0.06)] md:p-5">
            <SymptomInput
              placeholder="Tell me about your symptoms or health concerns..."
              buttonText="Start your free AI consult"
              showQuickActions
            />
          </div>

          {/* ── Trust badges ──────────────────────────────── */}
          <div className="anim-slide-in-d4 mx-auto mt-5 flex max-w-4xl flex-wrap items-center justify-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D8E6E6] bg-white/80 px-3 py-1.5 text-xs font-medium text-[#5f768b]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2A9D8F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              HIPAA-Aligned
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D8E6E6] bg-white/80 px-3 py-1.5 text-xs font-medium text-[#5f768b]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2A9D8F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              AI-Powered
            </span>
          </div>
        </div>
      </section>

      {/* ── Trust Cards ──────────────────────────────────── */}
      <section className="mx-auto mt-14 max-w-6xl">
        <div className="grid gap-4 md:grid-cols-3">
          {trustCards.map((card) => (
            <article
              key={card.title}
              className="hover-lift rounded-2xl border border-[#D8E6E6] bg-gradient-to-br from-white to-[#F8FCFF] p-6 shadow-[0_8px_24px_rgba(42,157,143,0.05)]"
            >
              <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#E6F2F0]">
                {card.icon}
              </div>
              <h2 className="text-base font-semibold text-[#1D3557]">{card.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#667f94]">{card.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────── */}
      <section className="mx-auto mt-12 max-w-6xl overflow-hidden rounded-3xl border border-[#1a3a50] bg-gradient-to-br from-[#1D3557] via-[#1a2f4a] to-[#0f1f33] p-7 text-white md:flex md:items-center md:justify-between">
        <div className="max-w-2xl">
          <h3 className="font-serif text-[2rem] leading-tight">
            Need clinician support after your brief?
          </h3>
          <p className="mt-3 text-sm text-[#a8c4d8]">
            YourDoc can route you into a doctor visit for follow-up and treatment decisions.
          </p>
        </div>
        <Link
          href="/consultations"
          className="group mt-5 inline-flex items-center gap-2 rounded-xl bg-[#2A9D8F] px-6 py-3 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(42,157,143,0.3)] transition-all hover:bg-[#21867a] hover:shadow-[0_6px_20px_rgba(42,157,143,0.4)] md:mt-0"
        >
          Talk to a doctor
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </section>
    </div>
  );
}
