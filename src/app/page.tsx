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

const flowSteps = [
  {
    title: "Start with a symptom",
    body: "Describe what you feel in plain language. Attach reports or photos if helpful.",
  },
  {
    title: "Chat-guided intake",
    body: "Care Guide asks structured follow-up questions so details are complete and clinically useful.",
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
      <svg viewBox="0 0 400 340" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-auto w-full">
        <circle cx="200" cy="170" r="140" fill="#E6F2F0" />
        <circle cx="200" cy="170" r="110" fill="#FFE8CC" opacity="0.45" />

        <rect x="100" y="220" width="200" height="8" rx="4" fill="#2A9D8F" opacity="0.2" />
        <rect x="120" y="228" width="6" height="40" rx="3" fill="#21867a" opacity="0.3" />
        <rect x="274" y="228" width="6" height="40" rx="3" fill="#21867a" opacity="0.3" />

        <rect x="145" y="185" width="90" height="35" rx="4" fill="#2D2D2D" />
        <rect x="149" y="189" width="82" height="27" rx="2" fill="#4ECDC4" opacity="0.8" />
        <rect x="135" y="220" width="110" height="5" rx="2" fill="#3D3D3D" />

        <g className="anim-bob">
          <circle cx="200" cy="130" r="28" fill="#FFDBB5" />
          <path d="M175 118c0-16 12-28 25-28s25 12 25 28" fill="#2D2D2D" />
          <circle cx="190" cy="132" r="3" fill="#2D2D2D" />
          <circle cx="210" cy="132" r="3" fill="#2D2D2D" />
          <path d="M192 142c4 4 12 4 16 0" stroke="#2D2D2D" strokeWidth="2" strokeLinecap="round" fill="none" />
          <circle cx="190" cy="132" r="8" stroke="#2A9D8F" strokeWidth="1.5" fill="none" />
          <circle cx="210" cy="132" r="8" stroke="#2A9D8F" strokeWidth="1.5" fill="none" />
          <line x1="198" y1="132" x2="202" y2="132" stroke="#2A9D8F" strokeWidth="1.5" />
          <path
            d="M172 158v62h56v-62c0 0-10-14-28-14s-28 14-28 14z"
            fill="white"
            stroke="#E8E8E8"
            strokeWidth="1"
          />
          <path d="M190 158v30" stroke="#2A9D8F" strokeWidth="1.5" strokeDasharray="4 3" />
          <path
            d="M172 170c-10 0-16 8-16 16s6 16 16 16"
            stroke="#2A9D8F"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="172" cy="202" r="4" fill="#2A9D8F" />
        </g>

        <g className="anim-float">
          <path
            d="M310 90c-3-6-10-8-15-4l-5 4-5-4c-5-4-12-2-15 4-3 7 0 14 10 20l10 8 10-8c10-6 13-13 10-20z"
            fill="#2A9D8F"
            opacity="0.7"
          />
        </g>

        <g className="anim-float-delay">
          <rect x="80" y="100" width="30" height="14" rx="7" fill="#2A9D8F" opacity="0.6" />
          <rect x="95" y="100" width="15" height="14" rx="7" fill="#21867a" opacity="0.6" />
        </g>

        <g className="anim-float-slow">
          <path
            d="M330 150c0 0 10 10 0 20s-10 10 0 20"
            stroke="#2A9D8F"
            strokeWidth="2"
            fill="none"
            opacity="0.5"
          />
          <path
            d="M340 150c0 0-10 10 0 20s10 10 0 20"
            stroke="#21867a"
            strokeWidth="2"
            fill="none"
            opacity="0.5"
          />
          <line x1="330" y1="160" x2="340" y2="160" stroke="#2A9D8F" strokeWidth="1.5" opacity="0.4" />
          <line x1="330" y1="170" x2="340" y2="170" stroke="#2A9D8F" strokeWidth="1.5" opacity="0.4" />
          <line x1="330" y1="180" x2="340" y2="180" stroke="#2A9D8F" strokeWidth="1.5" opacity="0.4" />
        </g>

        <g className="anim-pulse">
          <rect x="75" y="185" width="20" height="6" rx="3" fill="#2A9D8F" opacity="0.5" />
          <rect x="82" y="178" width="6" height="20" rx="3" fill="#2A9D8F" opacity="0.5" />
        </g>

        <g className="anim-float">
          <path d="M320 230l-10-5v-12c0 0 4-3 10-3s10 3 10 3v12z" fill="#2A9D8F" opacity="0.4" />
          <path d="M316 222l4 4 8-8" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
      </svg>

      <div className="anim-float absolute left-2 top-3 rounded-xl border border-[#D8E6E6] bg-white px-3 py-2 text-xs font-medium text-[#2A9D8F] shadow-md">
        AI Doctor
      </div>
      <div className="anim-float-delay absolute bottom-2 right-2 rounded-xl border border-[#D8E6E6] bg-white px-3 py-2 text-xs font-medium text-[#1D3557] shadow-md">
        Always Available
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="px-4 pb-20 md:px-8">
      <section className="mx-auto max-w-6xl pt-10 md:pt-14">
        <div className="anim-gradient-pan relative overflow-hidden rounded-[2rem] border border-[#D8E6E6] bg-gradient-to-br from-[#F8FCFF] via-white to-[#ECF8F3] p-6 shadow-[0_18px_56px_rgba(42,157,143,0.12)] md:p-10">
          <div className="anim-orb-drift absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,#A5DCD3_0%,rgba(165,220,211,0)_65%)]" />
          <div className="anim-orb-drift-delay absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,#D7EFFF_0%,rgba(215,239,255,0)_68%)]" />

          <div className="relative grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="anim-slide-in text-sm font-semibold uppercase tracking-[0.14em] text-[#2A9D8F]">
                YourDoc Care Guide
              </p>
              <h1 className="anim-slide-in-d1 mt-4 font-serif text-[2.7rem] leading-[0.95] tracking-[-0.02em] text-[#1d1d1b] md:text-[4.35rem]">
                Your health,
                <br />
                <span className="text-[#2A9D8F]">answered</span>
              </h1>
              <p className="anim-slide-in-d2 mt-4 max-w-xl text-base text-[#5f778f] md:text-lg">
                Free AI checkups. Guided chat intake. Doctor-ready brief in minutes.
                Start with symptoms and move to the right care setting confidently.
              </p>

              <div className="anim-slide-in-d3 mt-6 max-w-2xl rounded-2xl border border-[#D8E6E6] bg-white p-4 shadow-[0_4px_20px_rgba(42,157,143,0.08)] md:p-5">
                <SymptomInput
                  placeholder="What are you feeling today?"
                  buttonText="Check my symptoms"
                  showQuickActions
                />
              </div>

              <div className="anim-slide-in-d4 mt-4 flex flex-wrap gap-2">
                {valuePills.map((pill) => (
                  <span
                    key={pill}
                    className="rounded-full border border-[#D8E6E6] bg-white/85 px-3 py-1.5 text-xs font-medium text-[#5f768b]"
                  >
                    {pill}
                  </span>
                ))}
              </div>
            </div>

            <HeroDoctorCharacter />
          </div>
          <div className="relative mt-8 grid gap-3 rounded-2xl border border-[#D8E6E6] bg-white/85 p-4 sm:grid-cols-3 sm:gap-4">
            <div className="rounded-xl border border-[#E3EEEE] bg-[#F8FCFF] px-4 py-3">
              <p className="text-xs text-[#6f879e]">Avg intake completion</p>
              <p className="mt-1 text-xl font-semibold text-[#1D3557]">~3 mins</p>
            </div>
            <div className="rounded-xl border border-[#E3EEEE] bg-[#F8FCFF] px-4 py-3">
              <p className="text-xs text-[#6f879e]">Generated output</p>
              <p className="mt-1 text-xl font-semibold text-[#1D3557]">Doctor Brief</p>
            </div>
            <div className="rounded-xl border border-[#E3EEEE] bg-[#F8FCFF] px-4 py-3">
              <p className="text-xs text-[#6f879e]">Care setting guidance</p>
              <p className="mt-1 text-xl font-semibold text-[#1D3557]">Self-care to ER</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-6xl">
        <h2 className="text-center font-serif text-[2rem] text-[#1D3557] md:text-[2.4rem]">Built for your peace of mind</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {trustCards.map((card) => (
            <article
              key={card.title}
              className="hover-lift mt-5 rounded-2xl border border-[#D8E6E6] bg-gradient-to-br from-white to-[#F8FCFF] p-6 shadow-[0_8px_24px_rgba(42,157,143,0.05)]"
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

      <section className="mx-auto mt-14 max-w-6xl rounded-3xl border border-[#D8E6E6] bg-white/90 p-6 md:p-8">
        <h2 className="font-serif text-[2rem] text-[#1D3557] md:text-[2.35rem]">How it works</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {flowSteps.map((step, index) => (
            <article key={step.title} className="rounded-2xl border border-[#D8E6E6] bg-[#F8FCFF] p-5">
              <p className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#2A9D8F] text-sm font-semibold text-white">
                {index + 1}
              </p>
              <h3 className="mt-3 text-base font-semibold text-[#1D3557]">{step.title}</h3>
              <p className="mt-2 text-sm text-[#5f758b]">{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-6xl overflow-hidden rounded-3xl border border-[#1a3a50] bg-gradient-to-br from-[#1D3557] via-[#1a2f4a] to-[#0f1f33] p-7 text-white md:flex md:items-center md:justify-between">
        <div className="max-w-2xl">
          <h3 className="font-serif text-[2rem] leading-tight">Need clinician support after your brief?</h3>
          <p className="mt-3 text-sm text-[#a8c4d8]">
            YourDoc routes you from AI guidance into real doctor follow-up for treatment decisions and reassurance.
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

      <section className="mx-auto mt-14 max-w-6xl rounded-3xl border border-[#D8E6E6] bg-gradient-to-br from-[#F7FCFF] to-[#EEF8F2] p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#2A9D8F]">YourDoc Plus</p>
            <h3 className="mt-2 font-serif text-[1.9rem] text-[#1D3557] md:text-[2.3rem]">Do more with one care workspace</h3>
          </div>
          <Link
            href="/pricing"
            className="rounded-xl border border-[#2A9D8F] bg-white px-5 py-2.5 text-sm font-semibold text-[#2A9D8F] transition-colors hover:bg-[#2A9D8F] hover:text-white"
          >
            View plans
          </Link>
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <article className="rounded-2xl border border-[#D8E6E6] bg-white p-4">
            <p className="text-sm font-semibold text-[#1D3557]">Health Dashboard</p>
            <p className="mt-1 text-sm text-[#60788f]">Track AI checkups, monitor history, and keep progress in one place.</p>
          </article>
          <article className="rounded-2xl border border-[#D8E6E6] bg-white p-4">
            <p className="text-sm font-semibold text-[#1D3557]">Smart Chat Memory</p>
            <p className="mt-1 text-sm text-[#60788f]">Carry context from previous conversations into future guidance.</p>
          </article>
          <article className="rounded-2xl border border-[#D8E6E6] bg-white p-4">
            <p className="text-sm font-semibold text-[#1D3557]">Doctor Visits</p>
            <p className="mt-1 text-sm text-[#60788f]">Escalate quickly with your brief already prepared for the clinician.</p>
          </article>
        </div>
      </section>
    </div>
  );
}
