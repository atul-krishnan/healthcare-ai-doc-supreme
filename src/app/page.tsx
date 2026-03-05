import type { Metadata } from "next";
import Image from "next/image";
import { HeroChatDemo } from "@/components/waitlist/hero-chat-demo";
import { WaitlistForm } from "@/components/waitlist/waitlist-form";

export const metadata: Metadata = {
  title: "AayuSmart | Your Family's Unified Health Ecosystem",
  description:
    "Join the founding waitlist for AayuSmart — urgency routing, specialist matching, lab analysis, family EHR vault, and recovery support in one care system.",
};

/* ─── Data ──────────────────────────────────────────────── */

const journeySteps = [
  {
    num: 1,
    title: "Describe Symptoms",
    subtitle: "(AI Care Taker)",
    body: "Describe your symptoms, emotions, or timeline — no medical jargon required.",
  },
  {
    num: 2,
    title: "Get Advice & Consult",
    subtitle: "(Virtual or In-Person)",
    body: "Connect to verified teleconsults, local clinics, or emergency care routes instantly.",
    active: true,
  },
  {
    num: 3,
    title: "Smart Insights",
    subtitle: "(Lab Check & Analyze)",
    body: "Get plain-language lab report explanations and check if prescribed tests are relevant.",
  },
  {
    num: 4,
    title: "Your Family's Unified Vault",
    subtitle: "(EHR & Wearables Dashboard)",
    body: "Store records, track wearable data, and manage health timelines for your entire family.",
  },
];

const comparisonLeft = [
  "Scattered results in WhatsApp forwards",
  "Confusing health journey with no guidance",
  "Confusing prescriptions and follow-up",
  "Separate apps for tracking, records, and consults",
  "Uncoordinated family health data",
];

const comparisonRight = [
  "Digital records and context captured securely",
  "Smart routing to the right care option",
  "Clear prescription summaries with reminders",
  "One unified dashboard for everything",
  "Family profiles with shared health timelines",
];

const featureChecklist = [
  "AI Care Taker",
  "Virtual/Offline Consults",
  "Family EHR Vault",
  "Lab Report Analysis",
  "Wearable Data Sync",
];

const featureCards = [
  {
    icon: "🤖",
    title: "AI Care Taker",
    body: "Always-on support for first guidance, follow-up nudges, and your next best care step.",
  },
  {
    icon: "🩺",
    title: "Virtual Consult",
    body: "Connect to a virtual consult, virtual/offline EHR vault, and persistent onboarding.",
  },
  {
    icon: "🔒",
    title: "EHR Vault",
    body: "Lab Checker Analysis, Lab Report Analysis — all centralized and mobile-ready.",
  },
  {
    icon: "💊",
    title: "Medicine Reminder",
    body: "Never miss a medicine intake — reminders via WhatsApp and offline messages.",
  },
];

/* ─── Inline SVG icons ──────────────────────────────────── */

function CheckCircle() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function XCircle() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

/* ─── Page ──────────────────────────────────────────────── */

export default function Home() {
  return (
    <div className="bg-white">

      {/* ━━━ SECTION 1 — Hero + Journey ━━━━━━━━━━━━━━━━━━ */}
      <section className="bg-[#f0f5ff]">
        <div className="mx-auto max-w-7xl px-4 pb-14 pt-10 md:px-8 md:pb-20 md:pt-14">
          {/* Hero row */}
          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-10">
            {/* Left copy */}
            <div className="anim-slide-in lg:max-w-[560px]">
              <h1 className="text-[2rem] font-bold leading-[1.12] tracking-[-0.02em] text-[#0f172a] md:text-[2.8rem]">
                The AI Care System
                <br />
                with{" "}
                <span className="text-[#2563eb]">Journey Timeline.</span>
              </h1>
              <p className="mt-4 max-w-lg text-[0.95rem] leading-relaxed text-[#475569]">
                AI Care Taker, Virtual/Offline Consults, Family EHR Vault,
                Lab Report Analysis, Wearable Data Sync.
              </p>
              <a
                href="#waitlist"
                className="mt-6 inline-flex h-11 items-center rounded-xl bg-[#1e3a8a] px-7 text-sm font-bold !text-white shadow-sm transition hover:bg-[#1d4ed8]"
              >
                Join Waitlist
              </a>
            </div>

            {/* Right — chat demo */}
            <div className="anim-slide-in-d2 w-full lg:max-w-[540px] lg:justify-self-end">
              <HeroChatDemo />
            </div>
          </div>

          {/* Journey timeline cards */}
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {journeySteps.map((step) => (
              <div
                key={step.num}
                className={`anim-slide-in-d${step.num} rounded-2xl border bg-white p-5 transition hover-lift ${step.active
                  ? "border-[#3b82f6]/40 shadow-[0_0_20px_rgba(59,130,246,0.1)]"
                  : "border-[#e2e8f0]"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${step.active
                      ? "bg-[#1d4ed8] text-white"
                      : "bg-[#eff6ff] text-[#1d4ed8]"
                      }`}
                  >
                    {step.num}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#0f172a]">{step.title}</p>
                    <p className="text-xs text-[#94a3b8]">{step.subtitle}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[#64748b]">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ SECTION 2 — Command Center Ecosystem ━━━━━━━━ */}
      <section id="features" className="scroll-mt-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-8 md:py-20">
          <h2 className="text-center text-[1.8rem] font-bold leading-tight text-[#0f172a] md:text-[2.6rem]">
            Command Center Ecosystem.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-[0.95rem] text-[#64748b]">
            One unified dashboard for your entire family&apos;s health — from triage to
            recovery.
          </p>

          {/* Dashboard image */}
          <div className="mx-auto mt-10 max-w-5xl">
            <Image
              src="/images/waitlist/command-center.png"
              alt="Family Health Command Center — unified dashboard with medication reminders, wearable trends, lab insights, care navigation, virtual consult, lab analysis, and health vault"
              width={1200}
              height={700}
              className="h-auto w-full rounded-2xl shadow-[0_8px_40px_rgba(30,58,138,0.12)]"
              priority
            />
          </div>
        </div>
      </section>

      {/* ━━━ SECTION 3 — Fragmented vs Unified ━━━━━━━━━━━ */}
      <section className="bg-[#f0f5ff]">
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-8 md:py-20">
          <h2 className="text-center text-[1.8rem] font-bold leading-tight text-[#0f172a] md:text-[2.6rem]">
            Fragmented, Confusing health journey?
          </h2>
          <p className="mx-auto mt-1 text-center text-[1.8rem] font-bold text-[#2563eb] md:text-[2.6rem]">
            Convert to the Unified Ecosystem.
          </p>

          <div className="mt-10 grid items-stretch gap-6 md:grid-cols-[1fr_auto_1fr]">
            {/* Old journey */}
            <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6 md:p-8">
              <div className="mb-4 flex justify-center">
                <Image
                  src="/images/waitlist/fragmented-journey.png"
                  alt="Fragmented health journey illustration"
                  width={400}
                  height={400}
                  className="h-auto w-40 md:w-48"
                />
              </div>
              <h3 className="text-center text-lg font-bold text-[#0f172a]">
                Old, Health Journey
              </h3>
              <p className="mt-2 text-center text-sm text-[#64748b]">
                Fragmented results in WhatsApp, confusing prescriptions, scattered health data and records.
              </p>
              <ul className="mt-4 space-y-2.5">
                {comparisonLeft.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-[#64748b]">
                    <span className="mt-0.5 flex-shrink-0"><XCircle /></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* VS */}
            <div className="flex items-center justify-center">
              <div className="vs-badge">VS</div>
            </div>

            {/* Unified */}
            <div className="rounded-2xl border-2 border-[#3b82f6]/30 bg-white p-6 shadow-[0_4px_20px_rgba(59,130,246,0.08)] md:p-8">
              <div className="mb-4 flex justify-center">
                <Image
                  src="/images/waitlist/unified-solution.png"
                  alt="Unified health solution"
                  width={400}
                  height={400}
                  className="h-auto w-40 md:w-48"
                />
              </div>
              <h3 className="text-center text-lg font-bold text-[#0f172a]">
                Your Unified Solution
              </h3>
              <p className="mt-2 text-center text-sm text-[#64748b]">
                Digital records, smart insights, connected devices — all in one unified care ecosystem.
              </p>
              <ul className="mt-4 space-y-2.5">
                {comparisonRight.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-[#334155]">
                    <span className="mt-0.5 flex-shrink-0"><CheckCircle /></span>
                    <span className="flex-1">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 text-center">
            <a
              href="#waitlist"
              className="inline-flex h-11 items-center rounded-xl bg-[#1e3a8a] px-8 text-sm font-bold !text-white transition hover:bg-[#1d4ed8]"
            >
              Join Waitlist
            </a>
            <p className="mt-3 text-xs text-[#64748b]">
              Already convinced?{" "}
              <a href="#waitlist" className="font-semibold text-[#2563eb] underline">
                Join now
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* ━━━ SECTION 4 — What if + Guided Support ━━━━━━━━ */}
      <section id="resources" className="scroll-mt-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-8 md:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            {/* Left — headline + illustration */}
            <div>
              <h2 className="text-[1.8rem] font-bold leading-tight text-[#0f172a] md:text-[2.6rem]">
                What if managing your
                <br />
                family&apos;s health was simple?
              </h2>
              <div className="mt-6 flex justify-center lg:justify-start">
                <Image
                  src="/images/waitlist/family-health.png"
                  alt="Family managing health together"
                  width={400}
                  height={400}
                  className="h-auto w-64"
                />
              </div>
            </div>

            {/* Right — guided support card */}
            <div className="rounded-2xl border border-[#d0dcf0] bg-[#f8fbff] p-6 md:p-8">
              <h3 className="text-xl font-bold text-[#0f172a]">Guided Support</h3>
              <p className="mt-2 text-sm text-[#64748b]">
                With a conversation as your starting point, your family&apos;s health gets a complete and minimal support system.
              </p>
              {/* Feature checklist */}
              <div className="mt-5 space-y-2.5">
                {featureChecklist.map((feature) => (
                  <div key={feature} className="flex items-center gap-2.5 text-[0.9375rem] text-[#1e293b]">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#dbeafe] text-xs font-bold text-[#1d4ed8]">✓</span>
                    {feature}
                  </div>
                ))}
              </div>

              {/* Founding member spot mini */}
              <div className="mt-6 rounded-xl border border-[#dbeafe] bg-[#eff6ff] p-4">
                <p className="text-sm font-bold text-[#0f172a]">
                  Founding Member Spot for Waitlist
                </p>
                <p className="mt-1 text-xs text-[#64748b]">
                  Guiding and managing your family&apos;s shared health — you may find no-cost
                  clinician access as a founding member.
                </p>
                <a
                  href="#waitlist"
                  className="mt-3 inline-flex h-9 items-center rounded-lg bg-[#1e3a8a] px-5 text-sm font-bold !text-white transition hover:bg-[#1d4ed8]"
                >
                  Join Waitlist
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ SECTION 5 — Waitlist Form ━━━━━━━━━━━━━━━━━━━ */}
      <section id="waitlist" className="scroll-mt-20 bg-[#f0f5ff]">
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-8 md:py-20">
          <div className="grid items-start gap-10 lg:grid-cols-2">
            {/* Left — form */}
            <div className="rounded-2xl border border-[#d0dcf0] bg-white p-6 shadow-sm md:p-8">
              <h3 className="text-2xl font-bold text-[#0f172a]">
                Founding Member Spot • Waitlist
              </h3>

              {/* Compact email */}
              <div className="mt-5 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-3">
                <WaitlistForm compact buttonLabel="Join Waitlist" />
              </div>

              {/* Full form */}
              <div className="mt-5">
                <WaitlistForm buttonLabel="Submit" />
              </div>

              <p className="mt-4 text-xs text-[#94a3b8]">
                Join the 500+ people waiting for smarter care.
              </p>
            </div>

            {/* Right — feature cards + trust */}
            <div>
              <h3 className="text-2xl font-bold text-[#0f172a]">
                What if managing your family&apos;s health was simple?
              </h3>
              <p className="mt-2 text-sm text-[#64748b]">
                While personalizing your family&apos;s health experience across
                reminders, consultants, and care navigation.
              </p>
              <div className="mt-4 rounded-xl border border-[#dbeafe] bg-[#eff6ff] p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#1d4ed8]">
                  Common Headaches We Hear
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="rounded-full border border-[#bfdbfe] bg-white px-3 py-1 text-xs text-[#334155]">
                    Reports samajh nahi aa rahe?
                  </span>
                  <span className="rounded-full border border-[#bfdbfe] bg-white px-3 py-1 text-xs text-[#334155]">
                    Kis specialist ko dikhaun?
                  </span>
                  <span className="rounded-full border border-[#bfdbfe] bg-white px-3 py-1 text-xs text-[#334155]">
                    Medicine timing clear nahi hai
                  </span>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {featureCards.map((card) => (
                  <div key={card.title} className="rounded-xl border border-[#e2e8f0] bg-white p-4 hover-lift">
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-[#eff6ff] text-xl">
                      {card.icon}
                    </div>
                    <p className="text-sm font-bold text-[#0f172a]">{card.title}</p>
                    <p className="mt-1 text-xs text-[#64748b]">{card.body}</p>
                  </div>
                ))}
              </div>

            </div>
          </div>

          {/* Safety guardrail */}
          <div className="mt-10 rounded-xl border border-[#bfdbfe] bg-[#eff6ff] p-4 text-center text-sm text-[#1e3a8a]">
            <strong>Safety guardrails:</strong> Non-diagnostic decision support • Clinician-informed logic • Hard red-flag escalation for emergencies
          </div>
        </div>
      </section>

      {/* ━━━ SECTION 6 — Final CTA ━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section id="contact" className="scroll-mt-20 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-14 text-center md:px-8 md:py-20">
          <h2 className="text-[1.8rem] font-bold leading-tight text-[#0f172a] md:text-[2.6rem]">
            What if managing your family&apos;s health was finally simple?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[0.95rem] text-[#64748b]">
            Join now for priority access, Hindi and English onboarding, and direct
            influence on our product roadmap.
          </p>
          <div className="mx-auto mt-6 max-w-md rounded-xl border border-[#d0dcf0] bg-[#f8fbff] p-4">
            <WaitlistForm compact buttonLabel="Reserve My Spot" />
          </div>

        </div>
      </section>
    </div>
  );
}
