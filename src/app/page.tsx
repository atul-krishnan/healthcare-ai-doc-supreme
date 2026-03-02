import Link from "next/link";
import { SymptomInput } from "@/components/forms/symptom-input";

const trustCards = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    title: "Guided, not diagnostic",
    body: "YourDoc Guide helps you decide the right care setting and prepares a clean summary for your doctor.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
      </svg>
    ),
    title: "Private by default",
    body: "Uploads are stored in private storage and attached to your intake and brief only.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    title: "Doctor follow-up when needed",
    body: "Move from your brief into a real doctor visit when urgency, uncertainty, or preference calls for it.",
  },
];

const flowSteps = [
  {
    title: "Start with a symptom",
    body: "Describe what you feel in plain language. Attach reports or photos if helpful.",
  },
  {
    title: "Chat-guided intake",
    body: "YourDoc Guide asks structured follow-up questions so details are complete and clinically useful.",
  },
  {
    title: "Get your doctor brief",
    body: "Receive a clean summary, care-setting guidance, and next steps you can share with a doctor.",
  },
];

const valuePills = [
  "Free AI symptom check",
  "Chat-first intake with auto form",
  "Private record attachments",
  "Doctor follow-up available",
];

function HeroDoctorCharacter() {
  return (
    <div className="relative mx-auto w-full max-w-[430px]">
      <svg viewBox="0 0 400 340" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-auto w-full drop-shadow-xl">
        {/* Soft Corporate Blue Background Circles */}
        <circle cx="200" cy="170" r="140" fill="var(--brand-100)" />
        <circle cx="200" cy="170" r="110" fill="var(--brand-200)" opacity="0.4" />

        <rect x="100" y="220" width="200" height="8" rx="4" fill="var(--brand-600)" opacity="0.1" />
        <rect x="120" y="228" width="6" height="40" rx="3" fill="var(--brand-600)" opacity="0.15" />
        <rect x="274" y="228" width="6" height="40" rx="3" fill="var(--brand-600)" opacity="0.15" />

        <rect x="145" y="185" width="90" height="35" rx="4" fill="#1e293b" />
        <rect x="149" y="189" width="82" height="27" rx="2" fill="var(--brand-400)" opacity="0.9" />
        <rect x="135" y="220" width="110" height="5" rx="2" fill="#0f172a" />

        <g className="anim-bob">
          <circle cx="200" cy="130" r="28" fill="#FFDBB5" />
          <path d="M175 118c0-16 12-28 25-28s25 12 25 28" fill="#0f172a" />
          <circle cx="190" cy="132" r="3" fill="#0f172a" />
          <circle cx="210" cy="132" r="3" fill="#0f172a" />
          <path d="M192 142c4 4 12 4 16 0" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" fill="none" />

          <circle cx="190" cy="132" r="8" stroke="var(--brand-600)" strokeWidth="1.5" fill="none" />
          <circle cx="210" cy="132" r="8" stroke="var(--brand-600)" strokeWidth="1.5" fill="none" />
          <line x1="198" y1="132" x2="202" y2="132" stroke="var(--brand-600)" strokeWidth="1.5" />

          {/* Doctor Coat */}
          <path
            d="M172 158v62h56v-62c0 0-10-14-28-14s-28 14-28 14z"
            fill="white"
            stroke="var(--line)"
            strokeWidth="1"
          />
          <path d="M190 158v30" stroke="var(--brand-600)" strokeWidth="1.5" strokeDasharray="4 3" />

          {/* Stethoscope */}
          <path
            d="M172 170c-10 0-16 8-16 16s6 16 16 16"
            stroke="var(--brand-500)"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="172" cy="202" r="4" fill="var(--brand-700)" />
        </g>

        {/* Floating cross/plus elements */}
        <g className="anim-float">
          <path
            d="M310 90c-3-6-10-8-15-4l-5 4-5-4c-5-4-12-2-15 4-3 7 0 14 10 20l10 8 10-8c10-6 13-13 10-20z"
            fill="var(--brand-500)"
            opacity="0.8"
          />
        </g>

        {/* Digital elements */}
        <g className="anim-float-delay">
          <rect x="80" y="100" width="30" height="14" rx="7" fill="var(--brand-400)" opacity="0.8" />
          <rect x="95" y="100" width="15" height="14" rx="7" fill="var(--brand-600)" opacity="0.9" />
        </g>

        <g className="anim-float-slow">
          <path
            d="M330 150c0 0 10 10 0 20s-10 10 0 20"
            stroke="var(--brand-400)"
            strokeWidth="2"
            fill="none"
            opacity="0.7"
          />
          <path
            d="M340 150c0 0-10 10 0 20s10 10 0 20"
            stroke="var(--brand-600)"
            strokeWidth="2"
            fill="none"
            opacity="0.7"
          />
          <line x1="330" y1="160" x2="340" y2="160" stroke="var(--brand-500)" strokeWidth="1.5" opacity="0.5" />
          <line x1="330" y1="170" x2="340" y2="170" stroke="var(--brand-500)" strokeWidth="1.5" opacity="0.5" />
          <line x1="330" y1="180" x2="340" y2="180" stroke="var(--brand-500)" strokeWidth="1.5" opacity="0.5" />
        </g>

        <g className="anim-pulse">
          <rect x="75" y="185" width="20" height="6" rx="3" fill="var(--brand-500)" opacity="0.6" />
          <rect x="82" y="178" width="6" height="20" rx="3" fill="var(--brand-500)" opacity="0.6" />
        </g>

        <g className="anim-float">
          <path d="M320 230l-10-5v-12c0 0 4-3 10-3s10 3 10 3v12z" fill="var(--brand-500)" opacity="0.5" />
          <path d="M316 222l4 4 8-8" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
      </svg>

      <div className="anim-float absolute left-2 top-3 rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-xs font-medium text-[var(--brand-600)] shadow-lg shadow-[var(--brand-500)]/10 ring-1 ring-[var(--line)]">
        YourDoc Guide
      </div>
      <div className="anim-float-delay absolute bottom-2 right-2 rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-xs font-medium text-[#0f172a] shadow-lg shadow-[var(--brand-500)]/10 ring-1 ring-[var(--line)]">
        Guided Support
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="px-4 pb-20 md:px-8">
      {/* ── HERO SECTION ───────────────────────── */}
      <section className="mx-auto max-w-6xl pt-10 md:pt-14">
        {/* Soft, cool blue gradient pan background matching the new aesthetic */}
        <div className="anim-gradient-pan relative overflow-hidden rounded-[2rem] border border-[var(--line)] bg-gradient-to-br from-white via-[var(--brand-50)] to-[#f8fafc] p-6 shadow-xl shadow-[var(--brand-500)]/5 ring-1 ring-white/50 md:p-10">
          <div className="anim-orb-drift absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,var(--brand-100)_0%,transparent_70%)] opacity-80" />
          <div className="anim-orb-drift-delay absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,var(--brand-100)_0%,transparent_70%)] opacity-80" />

          <div className="relative grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="anim-slide-in text-sm font-semibold uppercase tracking-[0.14em] text-[var(--brand-600)]">
                YourDoc Guide
              </p>
              <h1 className="anim-slide-in-d1 mt-4 font-serif text-[2.7rem] leading-[1.05] tracking-[-0.02em] text-[#0f172a] md:text-[4.35rem]">
                Your health,
                <br />
                <span className="text-[var(--brand-600)]">answered</span>
              </h1>
              <p className="anim-slide-in-d2 mt-5 max-w-xl text-base text-[#475569] md:text-lg">
                Free AI checkups. Guided chat intake. Doctor-ready brief in minutes.
                Start with symptoms and move to the right care setting confidently.
              </p>

              <div className="anim-slide-in-d3 mt-8 max-w-2xl rounded-2xl border border-[var(--line)] bg-white p-4 shadow-lg shadow-[var(--brand-500)]/5 md:p-5">
                <SymptomInput
                  placeholder="What are you feeling today?"
                  buttonText="Check my symptoms"
                  showQuickActions
                />
              </div>

              <div className="anim-slide-in-d4 mt-5 flex flex-wrap gap-2">
                {valuePills.map((pill) => (
                  <span
                    key={pill}
                    className="rounded-full border border-[var(--line)] bg-white/85 px-3 py-1.5 text-xs font-medium text-[#475569]"
                  >
                    {pill}
                  </span>
                ))}
              </div>
            </div>

            <HeroDoctorCharacter />
          </div>
          <div className="relative mt-10 grid gap-3 sm:grid-cols-3 sm:gap-4">
            <div className="rounded-2xl border border-[var(--line)] bg-white/80 p-5 shadow-sm backdrop-blur-md">
              <p className="text-xs font-medium text-[#64748b] uppercase tracking-wider">Avg intake completion</p>
              <p className="mt-2 text-xl font-bold text-[#0f172a]">~3 mins</p>
            </div>
            <div className="rounded-2xl border border-[var(--line)] bg-white/80 p-5 shadow-sm backdrop-blur-md">
              <p className="text-xs font-medium text-[#64748b] uppercase tracking-wider">Generated output</p>
              <p className="mt-2 text-xl font-bold text-[#0f172a]">Doctor Brief</p>
            </div>
            <div className="rounded-2xl border border-[var(--line)] bg-white/80 p-5 shadow-sm backdrop-blur-md">
              <p className="text-xs font-medium text-[#64748b] uppercase tracking-wider">Care setting guidance</p>
              <p className="mt-2 text-xl font-bold text-[#0f172a]">Self-care to ER</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST & SAFETY (About Us style) ────── */}
      <section className="mx-auto mt-24 max-w-6xl">
        <h2 className="text-center font-serif text-[2.2rem] text-[#0f172a] md:text-[2.6rem]">Built for your peace of mind</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {trustCards.map((card) => (
            <article
              key={card.title}
              className="hover-lift flex flex-col items-center rounded-3xl border border-[var(--line)] bg-white p-8 text-center shadow-lg shadow-[var(--brand-500)]/5"
            >
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--brand-100)] text-[var(--brand-600)]">
                {card.icon}
              </div>
              <h3 className="text-lg font-bold text-[#0f172a]">{card.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#64748b]">{card.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS (Features Row Style) ──── */}
      <section className="mx-auto mt-24 max-w-6xl overflow-hidden rounded-[2.5rem] border border-[var(--line)] bg-white p-8 shadow-xl shadow-[var(--brand-500)]/5 md:p-12">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--brand-600)]">Process</p>
          <h2 className="mt-2 font-serif text-[2.2rem] text-[#0f172a] md:text-[2.6rem]">How it works</h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {flowSteps.map((step, index) => (
            <article key={step.title} className="rounded-2xl border border-[var(--line)] bg-[var(--surface-alt)] p-6 transition-colors hover:bg-[var(--brand-50)]">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand-500)] text-sm font-bold text-white shadow-md shadow-[var(--brand-500)]/30">
                {index + 1}
              </div>
              <h3 className="mt-5 text-lg font-bold text-[#0f172a]">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#64748b]">{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── CLINICIAN SUPPORT (CTA Style) ──────── */}
      <section className="mx-auto mt-24 max-w-6xl overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#020617] p-10 text-white md:flex md:items-center md:justify-between md:p-14 shadow-2xl">
        <div className="max-w-2xl">
          <h3 className="font-serif text-[2.2rem] leading-tight md:text-[2.8rem]">Need clinician support after your brief?</h3>
          <p className="mt-4 text-base text-[#94a3b8] md:text-lg">
            YourDoc routes you from AI guidance into real doctor follow-up for treatment decisions and reassurance.
          </p>
        </div>
        <Link
          href="/consultations"
          className="group mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--brand-500)] px-8 py-4 text-base font-semibold text-white shadow-lg shadow-[var(--brand-500)]/30 transition-all hover:scale-105 hover:bg-[var(--brand-600)] md:mt-0 whitespace-nowrap"
        >
          Talk to a doctor
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </section>

      {/* ── YOURDOC PLUS (Services Style) ──────── */}
      <section className="mx-auto mt-24 mb-10 max-w-6xl rounded-[2.5rem] border border-[var(--line)] bg-gradient-to-br from-[#f8fafc] to-[var(--brand-50)] p-8 md:p-12 shadow-xl shadow-[var(--brand-500)]/5">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--brand-600)]">YourDoc Plus</p>
            <h3 className="mt-3 font-serif text-[2.2rem] leading-tight text-[#0f172a] md:text-[2.8rem]">Do more with one<br />care workspace</h3>
          </div>
          <Link
            href="/pricing"
            className="inline-flex rounded-xl border-2 border-[var(--brand-300)] bg-white px-8 py-3.5 text-base font-semibold text-[var(--brand-700)] shadow-sm transition-all hover:border-[var(--brand-500)] hover:bg-[var(--brand-50)]"
          >
            View plans
          </Link>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <article className="hover-lift rounded-2xl border border-[var(--line)] bg-white p-6 shadow-md shadow-[var(--brand-500)]/5">
            <h4 className="text-lg font-bold text-[#0f172a]">Health Dashboard</h4>
            <p className="mt-2 text-sm leading-relaxed text-[#64748b]">Track AI checkups, monitor history, and keep progress in one place.</p>
          </article>
          <article className="hover-lift rounded-2xl border border-[var(--line)] bg-white p-6 shadow-md shadow-[var(--brand-500)]/5">
            <h4 className="text-lg font-bold text-[#0f172a]">Smart Chat Memory</h4>
            <p className="mt-2 text-sm leading-relaxed text-[#64748b]">Carry context from previous conversations into future guidance.</p>
          </article>
          <article className="hover-lift rounded-2xl border border-[var(--line)] bg-white p-6 shadow-md shadow-[var(--brand-500)]/5">
            <h4 className="text-lg font-bold text-[#0f172a]">Doctor Visits</h4>
            <p className="mt-2 text-sm leading-relaxed text-[#64748b]">Escalate quickly with your brief already prepared for the clinician.</p>
          </article>
        </div>
      </section>
    </div>
  );
}
