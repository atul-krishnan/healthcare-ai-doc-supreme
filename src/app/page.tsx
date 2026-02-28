import Link from "next/link";
import { SymptomInput } from "@/components/forms/symptom-input";

/* ── Inline Animated SVG Components ─────────────────────────── */

function HeroIllustration() {
  return (
    <div className="relative w-full max-w-md mx-auto md:mx-0">
      <svg viewBox="0 0 400 340" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
        {/* Background circle */}
        <circle cx="200" cy="170" r="140" fill="#FFF3E6" />
        <circle cx="200" cy="170" r="110" fill="#FFE8CC" opacity="0.5" />

        {/* Desk */}
        <rect x="100" y="220" width="200" height="8" rx="4" fill="#FF6600" opacity="0.2" />
        <rect x="120" y="228" width="6" height="40" rx="3" fill="#E55C00" opacity="0.3" />
        <rect x="274" y="228" width="6" height="40" rx="3" fill="#E55C00" opacity="0.3" />

        {/* Laptop */}
        <rect x="145" y="185" width="90" height="35" rx="4" fill="#2D2D2D" />
        <rect x="149" y="189" width="82" height="27" rx="2" fill="#4ECDC4" opacity="0.8" />
        <rect x="135" y="220" width="110" height="5" rx="2" fill="#3D3D3D" />

        {/* Doctor character */}
        {/* Head */}
        <circle cx="200" cy="130" r="28" fill="#FFDBB5" />
        {/* Hair */}
        <path d="M175 118c0-16 12-28 25-28s25 12 25 28" fill="#2D2D2D" />
        {/* Eyes */}
        <circle cx="190" cy="132" r="3" fill="#2D2D2D" />
        <circle cx="210" cy="132" r="3" fill="#2D2D2D" />
        {/* Smile */}
        <path d="M192 142c4 4 12 4 16 0" stroke="#2D2D2D" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Glasses */}
        <circle cx="190" cy="132" r="8" stroke="#FF6600" strokeWidth="1.5" fill="none" />
        <circle cx="210" cy="132" r="8" stroke="#FF6600" strokeWidth="1.5" fill="none" />
        <line x1="198" y1="132" x2="202" y2="132" stroke="#FF6600" strokeWidth="1.5" />
        {/* Lab coat */}
        <path d="M172 158v62h56v-62c0 0-10-14-28-14s-28 14-28 14z" fill="white" stroke="#E8E8E8" strokeWidth="1" />
        <path d="M190 158v30" stroke="#FF6600" strokeWidth="1.5" strokeDasharray="4 3" />
        {/* Stethoscope */}
        <path d="M172 170c-10 0-16 8-16 16s6 16 16 16" stroke="#FF6600" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <circle cx="172" cy="202" r="4" fill="#FF6600" />

        {/* Floating medical icons */}
        <g className="anim-float">
          {/* Heart */}
          <path d="M310 90c-3-6-10-8-15-4l-5 4-5-4c-5-4-12-2-15 4-3 7 0 14 10 20l10 8 10-8c10-6 13-13 10-20z" fill="#FF6600" opacity="0.7" />
        </g>

        <g className="anim-float-delay">
          {/* Pill capsule */}
          <rect x="80" y="100" width="30" height="14" rx="7" fill="#FF6600" opacity="0.6" />
          <rect x="95" y="100" width="15" height="14" rx="7" fill="#E55C00" opacity="0.6" />
        </g>

        <g className="anim-float-slow">
          {/* DNA helix */}
          <path d="M330 150c0 0 10 10 0 20s-10 10 0 20" stroke="#FF6600" strokeWidth="2" fill="none" opacity="0.5" />
          <path d="M340 150c0 0-10 10 0 20s10 10 0 20" stroke="#E55C00" strokeWidth="2" fill="none" opacity="0.5" />
          <line x1="330" y1="160" x2="340" y2="160" stroke="#FF6600" strokeWidth="1.5" opacity="0.4" />
          <line x1="330" y1="170" x2="340" y2="170" stroke="#FF6600" strokeWidth="1.5" opacity="0.4" />
          <line x1="330" y1="180" x2="340" y2="180" stroke="#FF6600" strokeWidth="1.5" opacity="0.4" />
        </g>

        <g className="anim-bob">
          {/* Plus/medical cross */}
          <rect x="75" y="185" width="20" height="6" rx="3" fill="#FF6600" opacity="0.5" />
          <rect x="82" y="178" width="6" height="20" rx="3" fill="#FF6600" opacity="0.5" />
        </g>

        <g className="anim-float">
          {/* Shield / protection */}
          <path d="M320 230l-10-5v-12c0 0 4-3 10-3s10 3 10 3v12z" fill="#FF6600" opacity="0.4" />
          <path d="M316 222l4 4 8-8" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>

        {/* Molecule dots */}
        <g className="anim-pulse">
          <circle cx="70" cy="150" r="4" fill="#FF6600" opacity="0.4" />
          <circle cx="60" cy="140" r="3" fill="#E55C00" opacity="0.3" />
          <line x1="70" y1="150" x2="60" y2="140" stroke="#FF6600" strokeWidth="1" opacity="0.3" />
        </g>
      </svg>
    </div>
  );
}

function ChatIllustration() {
  return (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[180px] mx-auto">
      {/* Chat bubbles */}
      <g className="anim-fade-in">
        <rect x="10" y="20" width="120" height="35" rx="12" fill="#FFF3E6" />
        <text x="25" y="42" fill="#7f7a73" fontSize="10" fontFamily="sans-serif">How are you feeling?</text>
      </g>
      <g className="anim-fade-in" style={{ animationDelay: '0.3s' }}>
        <rect x="60" y="65" width="130" height="35" rx="12" fill="#FF6600" />
        <text x="75" y="87" fill="white" fontSize="10" fontFamily="sans-serif">Headache for 3 days</text>
      </g>
      <g className="anim-float-slow">
        <circle cx="30" cy="130" r="6" fill="#FF6600" opacity="0.3" />
        <circle cx="50" cy="140" r="4" fill="#E55C00" opacity="0.2" />
        <circle cx="160" cy="125" r="5" fill="#FF6600" opacity="0.25" />
      </g>
    </svg>
  );
}

function DoctorAvatar() {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-16 h-16">
      <circle cx="40" cy="40" r="38" fill="#FF6600" opacity="0.15" />
      <g className="anim-pulse">
        <circle cx="40" cy="30" r="14" fill="#FFDBB5" />
        <path d="M28 25c0-8 6-14 12-14s12 6 12 14" fill="#2D2D2D" />
        <circle cx="35" cy="31" r="2" fill="#2D2D2D" />
        <circle cx="45" cy="31" r="2" fill="#2D2D2D" />
        <path d="M36 37c2 2 6 2 8 0" stroke="#2D2D2D" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M26 44v20h28v-20c0 0-5-6-14-6s-14 6-14 6z" fill="white" />
        <circle cx="40" cy="50" r="3" fill="#FF6600" />
      </g>
      {/* Pulse ring */}
      <circle cx="40" cy="40" r="36" stroke="#FF6600" strokeWidth="1.5" opacity="0.3" className="anim-pulse" />
    </svg>
  );
}

function FloatingIcons() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30" aria-hidden="true">
      <svg viewBox="0 0 600 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <g className="anim-float">
          <rect x="50" y="20" width="18" height="8" rx="4" fill="#FF6600" />
          <rect x="55" y="15" width="8" height="18" rx="4" fill="#FF6600" />
        </g>
        <g className="anim-float-delay">
          <circle cx="200" cy="50" r="5" fill="#FF6600" />
          <circle cx="212" cy="38" r="4" fill="#E55C00" />
          <line x1="200" y1="50" x2="212" y2="38" stroke="#FF6600" strokeWidth="1.5" />
        </g>
        <g className="anim-float-slow">
          <path d="M370 30c-2-5-7-6-11-3l-4 3-4-3c-4-3-9-2-11 3-2 5 0 10 7 15l8 6 8-6c7-5 9-10 7-15z" fill="#FF6600" />
        </g>
        <g className="anim-bob">
          <rect x="500" y="25" width="22" height="10" rx="5" fill="#FF6600" />
          <rect x="511" y="25" width="11" height="10" rx="5" fill="#E55C00" />
        </g>
      </svg>
    </div>
  );
}

function ServiceIllustration({ type }: { type: 'research' | 'flask' | 'code' }) {
  const icons = {
    research: (
      <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mx-auto">
        <circle cx="30" cy="30" r="28" fill="#FFF3E6" />
        <g className="anim-float-slow">
          <circle cx="26" cy="26" r="10" stroke="#FF6600" strokeWidth="2.5" fill="none" />
          <line x1="33" y1="33" x2="42" y2="42" stroke="#FF6600" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="26" cy="26" r="4" fill="#FF6600" opacity="0.2" />
        </g>
      </svg>
    ),
    flask: (
      <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mx-auto">
        <circle cx="30" cy="30" r="28" fill="#FFF3E6" />
        <g className="anim-bob">
          <path d="M24 15h12v12l8 16c1 2-0.5 5-3 5H19c-2.5 0-4-3-3-5l8-16z" stroke="#FF6600" strokeWidth="2" fill="none" />
          <path d="M22 38h16" stroke="#FF6600" strokeWidth="1.5" />
          <rect x="26" y="15" width="8" height="4" rx="1" fill="#FF6600" opacity="0.3" />
          <circle cx="28" cy="40" r="2" fill="#FF6600" opacity="0.5" />
          <circle cx="33" cy="42" r="1.5" fill="#E55C00" opacity="0.4" />
        </g>
      </svg>
    ),
    code: (
      <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mx-auto">
        <circle cx="30" cy="30" r="28" fill="#FFF3E6" />
        <g className="anim-pulse">
          <rect x="14" y="18" width="32" height="24" rx="3" stroke="#FF6600" strokeWidth="2" fill="none" />
          <rect x="14" y="18" width="32" height="6" rx="3" fill="#FF6600" opacity="0.15" />
          <circle cx="19" cy="21" r="1.5" fill="#FF6600" opacity="0.6" />
          <circle cx="24" cy="21" r="1.5" fill="#E55C00" opacity="0.6" />
          <line x1="19" y1="30" x2="28" y2="30" stroke="#FF6600" strokeWidth="1.5" opacity="0.5" />
          <line x1="19" y1="34" x2="35" y2="34" stroke="#FF6600" strokeWidth="1.5" opacity="0.3" />
        </g>
      </svg>
    ),
  };
  return icons[type];
}

/* ── Data ────────────────────────────────────────────── */

const trustCards = [
  {
    icon: 'research' as const,
    title: "Your data stays yours",
    body: "End-to-end encryption, strict access controls, and zero data selling. Period.",
  },
  {
    icon: 'flask' as const,
    title: "Care that never clocks out",
    body: "Get answers at 2 AM or 2 PM. When you need more, a real doctor is just a tap away.",
  },
  {
    icon: 'code' as const,
    title: "Clinically grounded",
    body: "Every response is built on peer-reviewed guidelines and reviewed by practicing physicians.",
  },
];

const pricing = [
  {
    name: "Free",
    price: "$0",
    highlights: ["AI symptom check-ups", "Your symptom history", "5 free checks per month"],
    cta: "Get Started Free",
  },
  {
    name: "YourDoc Monthly",
    price: "$30",
    highlights: ["Everything in Free", "Health dashboard", "Priority AI", "Faster doctor access"],
    cta: "Start 3-Day Trial",
    featured: true,
  },
  {
    name: "YourDoc Yearly",
    price: "$229",
    highlights: ["Everything in Monthly", "Wearable sync", "Annual savings", "Priority doctor replies"],
    cta: "Start 3-Day Trial",
  },
];

/* ── Page ────────────────────────────────────────────── */

export default function Home() {
  return (
    <div className="px-4 pb-20 md:px-8">
      {/* ── Hero ─────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl pt-16 md:pt-24">
        <div className="grid md:grid-cols-2 md:items-center gap-8">
          <div className="text-center md:text-left">
            <h1 className="font-serif text-[3.2rem] leading-[0.95] tracking-[-0.02em] text-[#1e1d1a] md:text-[4.4rem]">
              Your health, <span className="text-[#FF6600]">answered</span>
            </h1>
            <p className="mt-3 text-lg text-[#7f7a73]">Free AI check-ups. Real doctors when you need them.</p>
            <p className="mx-auto md:mx-0 mt-2 max-w-2xl text-sm text-[#8e8982] md:text-base">
              Describe how you feel — our AI guides you in seconds, and a licensed doctor is always one tap away.
            </p>

            <div className="mt-8 rounded-2xl border border-[#f0e6db] bg-white p-3 shadow-[0_14px_32px_rgba(255,102,0,0.06)]">
              <SymptomInput placeholder="What's bothering you today?" buttonText="Check my symptoms" />
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs text-[#7f7a73]">
              <span className="rounded-full border border-[#f0e6db] bg-white px-3 py-1.5">Secure records</span>
              <span className="rounded-full border border-[#f0e6db] bg-white px-3 py-1.5">See a doctor</span>
              <span className="rounded-full border border-[#f0e6db] bg-white px-3 py-1.5">Lab requests</span>
              <span className="rounded-full border border-[#f0e6db] bg-white px-3 py-1.5">HIPAA-ready</span>
            </div>
          </div>

          <HeroIllustration />
        </div>
      </section>

      {/* ── Trust cards ──────────────────────────────── */}
      <section className="mx-auto mt-20 max-w-5xl">
        <h2 className="text-center font-serif text-[2.4rem] text-[#1e1d1a]">Built for your peace of mind</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {trustCards.map((card) => (
            <article
              key={card.title}
              className="rounded-2xl border border-[#f0e6db] bg-white p-6 hover:shadow-[0_8px_24px_rgba(255,102,0,0.08)] transition-shadow"
            >
              <ServiceIllustration type={card.icon} />
              <h3 className="mt-3 text-center text-base font-semibold text-[#FF6600]">{card.title}</h3>
              <p className="mt-2 text-center text-sm leading-relaxed text-[#807b74]">{card.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── Talk naturally ───────────────────────────── */}
      <section className="mx-auto mt-20 grid max-w-5xl gap-8 md:grid-cols-2 md:items-center">
        <article>
          <h3 className="font-serif text-[2rem] text-[#1f1d1a]">Just say how you feel</h3>
          <p className="mt-3 text-sm leading-relaxed text-[#7e7971]">
            Skip the Google spiral. Describe your symptoms in plain words — we handle the rest.
          </p>
          <ChatIllustration />
        </article>
        <article className="rounded-2xl border border-[#f0e6db] bg-white p-6 shadow-[0_10px_24px_rgba(255,102,0,0.06)]">
          <p className="text-sm text-[#6f6a64]">What brings you in today?</p>
          <div className="mt-3 flex justify-end">
            <p className="rounded-2xl bg-[#FF6600] px-3 py-2 text-sm text-white">I&apos;ve had a headache for 3 days</p>
          </div>
          <p className="mt-4 text-xs text-[#98948d]">AI consult in progress...</p>
        </article>
      </section>

      {/* ── Real doctors ─────────────────────────────── */}
      <section className="mx-auto mt-14 max-w-5xl rounded-3xl bg-[#1f1c1a] p-8 text-white shadow-[0_16px_44px_rgba(0,0,0,0.24)] md:flex md:items-center md:justify-between">
        <div className="flex items-start gap-5">
          <DoctorAvatar />
          <div>
            <h3 className="font-serif text-[2rem] leading-none">Real doctors. Real prescriptions.</h3>
            <ul className="mt-4 grid gap-2 text-sm text-[#dbd7d2]">
              <li>- Message or video-call a licensed physician</li>
              <li>- Prescriptions sent to your pharmacy same-day</li>
              <li>- No insurance needed — pay per visit or subscribe</li>
            </ul>
          </div>
        </div>
        <Link href="/consultations" className="mt-6 inline-flex rounded-xl bg-[#FF6600] px-5 py-3 text-sm font-semibold text-white hover:bg-[#E55C00] transition-colors md:mt-0">
          Book a Visit
        </Link>
      </section>

      {/* ── Prana+ upsell ────────────────────────────── */}
      <section className="mx-auto mt-14 max-w-5xl rounded-3xl border border-[#f0e6db] bg-[#FFF8F1] px-6 py-10 text-center relative overflow-hidden">
        <FloatingIcons />
        <p className="inline-flex rounded-full border border-[#f0e6db] bg-white px-3 py-1 text-xs font-semibold text-[#FF6600]">YourDoc+</p>
        <h3 className="mt-4 font-serif text-[2.2rem] text-[#1f1d1a]">Do more with YourDoc+</h3>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-[#6f6a64]">
          Your health dashboard, smarter AI conversations, and priority doctor access — all in one place.
        </p>
        <div className="mx-auto mt-6 grid max-w-3xl gap-3 sm:grid-cols-3 relative z-10">
          <div className="rounded-xl bg-white p-5 text-center border border-[#f0e6db] hover:border-[#FF6600] transition-colors">
            <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8 mx-auto mb-2"><rect x="4" y="4" width="12" height="12" rx="3" stroke="#FF6600" strokeWidth="2" /><rect x="20" y="4" width="8" height="12" rx="3" stroke="#FF6600" strokeWidth="2" /><rect x="4" y="20" width="8" height="8" rx="3" stroke="#FF6600" strokeWidth="2" /><rect x="16" y="20" width="12" height="8" rx="3" stroke="#FF6600" strokeWidth="2" /></svg>
            <p className="text-sm font-semibold text-[#2a2825]">Health Dashboard</p>
            <p className="mt-1 text-xs text-[#8a857f]">EHR &amp; wearable data in one place</p>
          </div>
          <div className="rounded-xl bg-white p-5 text-center border border-[#f0e6db] hover:border-[#FF6600] transition-colors">
            <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8 mx-auto mb-2"><path d="M6 22c0 0 4-8 10-8s10 8 10 8" stroke="#FF6600" strokeWidth="2" fill="none" strokeLinecap="round" /><circle cx="16" cy="14" r="4" stroke="#FF6600" strokeWidth="2" fill="none" /><path d="M16 4v4" stroke="#FF6600" strokeWidth="2" strokeLinecap="round" /></svg>
            <p className="text-sm font-semibold text-[#2a2825]">Smarter Chat</p>
            <p className="mt-1 text-xs text-[#8a857f]">AI powered by your health history</p>
          </div>
          <div className="rounded-xl bg-white p-5 text-center border border-[#f0e6db] hover:border-[#FF6600] transition-colors">
            <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8 mx-auto mb-2"><circle cx="16" cy="16" r="12" stroke="#FF6600" strokeWidth="2" fill="none" /><path d="M12 16l3 3 6-6" stroke="#FF6600" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <p className="text-sm font-semibold text-[#2a2825]">₹20 Doctor Visits</p>
            <p className="mt-1 text-xs text-[#8a857f]">Save on every visit</p>
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────── */}
      <section className="mx-auto mt-16 max-w-6xl relative">
        <h3 className="text-center font-serif text-[2.4rem] text-[#1f1d1a]">Plans that fit your life</h3>
        <p className="mt-2 text-center text-sm text-[#7f7a73]">Start free. Upgrade when you want priority care.</p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {pricing.map((plan) => (
            <article
              key={plan.name}
              className={`rounded-2xl border bg-white p-6 hover:shadow-[0_12px_28px_rgba(255,102,0,0.08)] transition-shadow ${plan.featured ? "border-[#FF6600] shadow-[0_18px_35px_rgba(255,102,0,0.15)]" : "border-[#f0e6db]"
                }`}
            >
              <p className="text-sm font-semibold text-[#4a4742]">{plan.name}</p>
              <p className="mt-2 font-serif text-[2.7rem] leading-none text-[#1f1d1a]">{plan.price}</p>
              <ul className="mt-4 grid gap-2 text-sm text-[#726d66]">
                {plan.highlights.map((item) => (
                  <li key={item}>
                    <span className="text-[#FF6600] mr-1.5">✓</span> {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/pay"
                className={`mt-6 inline-flex rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${plan.featured ? "bg-[#FF6600] text-white hover:bg-[#E55C00]" : "border border-[#f0e6db] text-[#282521] hover:border-[#FF6600] hover:text-[#FF6600]"
                  }`}
              >
                {plan.cta}
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* ── Personalized to you ────────────────────────── */}
      <section className="mx-auto mt-16 max-w-5xl">
        <div className="grid md:grid-cols-2 md:items-center gap-8">
          {/* Left: Wearable stats + logos */}
          <div className="rounded-3xl border border-[#f0e6db] bg-white p-6 shadow-[0_8px_24px_rgba(255,102,0,0.04)]">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-[#FFF0F0] p-4">
                <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 mb-2"><path d="M12 21c-5-4-9-8-9-12a5 5 0 0 1 9-2 5 5 0 0 1 9 2c0 4-4 8-9 12z" fill="#E55C60" opacity="0.8" /></svg>
                <p className="text-xs text-[#8a857f]">Heart Rate</p>
                <p className="mt-1 text-xl font-semibold text-[#1f1d1a]">72<span className="text-xs font-normal text-[#8a857f]">bpm</span></p>
              </div>
              <div className="rounded-2xl bg-[#EEF4FF] p-4">
                <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 mb-2"><path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" stroke="#5B8DEF" strokeWidth="2" fill="none" /><path d="M12 7v5l3 3" stroke="#5B8DEF" strokeWidth="2" strokeLinecap="round" /></svg>
                <p className="text-xs text-[#8a857f]">Sleep</p>
                <p className="mt-1 text-xl font-semibold text-[#1f1d1a]">7:23<span className="text-xs font-normal text-[#8a857f]">hrs</span></p>
              </div>
              <div className="rounded-2xl bg-[#EEFBF3] p-4">
                <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 mb-2"><polyline points="4 14 8 10 12 13 16 8 20 11" stroke="#3EBB73" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                <p className="text-xs text-[#8a857f]">Activity</p>
                <p className="mt-1 text-xl font-semibold text-[#1f1d1a]">8,432<span className="text-xs font-normal text-[#8a857f]">steps</span></p>
              </div>
            </div>
            <p className="mt-5 text-xs text-[#a09b95]">Connects to top wearables</p>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[#5a5650]">
              <span className="text-sm font-bold tracking-tight">fitbit</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.15em]">Garmin</span>
              <span className="text-[10px] font-medium uppercase tracking-wider">Oura</span>
              <span className="text-sm font-bold tracking-tight">dexcom</span>
              <span className="text-sm font-bold uppercase tracking-tight">Omron</span>
              <span className="text-xs font-black uppercase tracking-wider">Strava</span>
            </div>
          </div>
          {/* Right: Copy */}
          <div>
            <h3 className="font-serif text-[2.2rem] text-[#1f1d1a]">Personalized to you</h3>
            <p className="mt-3 text-sm leading-relaxed text-[#7e7971] max-w-md">
              Connect your wearables and health records for smarter, more relevant insights.
            </p>
          </div>
        </div>
      </section>

      {/* ── Proactive vitals monitoring ────────────────── */}
      <section className="mx-auto mt-16 max-w-5xl">
        <div className="grid md:grid-cols-2 md:items-center gap-8">
          <div>
            <h3 className="font-serif text-[2.2rem] text-[#1f1d1a]">We watch your vitals, so you don&apos;t have to</h3>
            <p className="mt-3 text-sm leading-relaxed text-[#7e7971] max-w-md">
              When we spot something unusual — like a sustained rise in resting heart rate or changes in your sleep patterns — we&apos;ll let you know before it becomes a problem.
            </p>
          </div>
          {/* Right: Notification mockup */}
          <div className="flex justify-center md:justify-end">
            <div className="w-full max-w-xs rounded-2xl border border-[#f0e6db] bg-white p-4 shadow-[0_12px_28px_rgba(255,102,0,0.06)]">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5 rounded-full bg-[#FFF3E6] p-2">
                  <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5"><path d="M10 2L3 9v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9z" stroke="#FF6600" strokeWidth="1.5" fill="none" /><path d="M8 17v-2a2 2 0 0 1 4 0v2" stroke="#FF6600" strokeWidth="1.5" /></svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#FF6600]">YourDoc Alert</p>
                  <p className="mt-1 text-sm text-[#4a4742] leading-snug">
                    Your resting heart rate has been elevated for 2 nights. Tap to review.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ───────────────────────────────── */}
      <section className="mx-auto mt-16 max-w-5xl rounded-3xl border border-[#f0e6db] bg-[#FFF8F1] p-9 text-center relative overflow-hidden">
        <FloatingIcons />
        <h3 className="font-serif text-[2.2rem] text-[#1f1d1a] relative z-10">Your health check is free</h3>
        <div className="mx-auto mt-5 max-w-xl rounded-2xl border border-[#f0e6db] bg-white p-3 relative z-10">
          <SymptomInput placeholder="I've been feeling..." buttonText="Check Symptoms" />
        </div>
        <p className="mt-3 text-xs text-[#9a968f] relative z-10">Free — no card, no commitment</p>
      </section>
    </div>
  );
}
