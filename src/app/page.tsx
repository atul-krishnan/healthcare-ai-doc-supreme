import Link from "next/link";

const trustCards = [
  {
    title: "Private by default",
    body: "Your conversations stay in your account with strict data boundaries and audited access logs.",
  },
  {
    title: "Always available",
    body: "Get medical triage support at any hour, then escalate to a doctor visit when needed.",
  },
  {
    title: "Expert-backed",
    body: "AI responses are grounded in a curated medical knowledge base and doctor-reviewed workflows.",
  },
];

const pricing = [
  {
    name: "Free",
    price: "$0",
    highlights: ["AI symptom guidance", "Basic visit creation", "Health records timeline"],
    cta: "Get Started Free",
  },
  {
    name: "YourDoc Monthly",
    price: "$30",
    highlights: ["Everything in Free", "Health dashboard", "Smart chat", "Priority support"],
    cta: "Start 3-Day Trial",
    featured: true,
  },
  {
    name: "YourDoc Yearly",
    price: "$229",
    highlights: ["Everything in Monthly", "Wearable sync", "Annual savings", "Faster visit response"],
    cta: "Start 3-Day Trial",
  },
];

export default function Home() {
  return (
    <div className="px-4 pb-20 md:px-8">
      <section className="mx-auto max-w-4xl pt-16 text-center md:pt-24">
        <h1 className="font-serif text-[3.2rem] leading-[0.95] tracking-[-0.02em] text-[#1e1d1a] md:text-[4.4rem]">
          Welcome to <span className="text-[#73b2ce]">YourDoc</span>
        </h1>
        <p className="mt-3 text-lg text-[#7f7a73]">Your 24/7 AI Doctor</p>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-[#8e8982] md:text-base">
          After we chat, connect with a board-certified physician to manage your care.
        </p>

        <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-[#e6e4e1] bg-white p-3 shadow-[0_14px_32px_rgba(0,0,0,0.04)]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              readOnly
              value="Tell us what you're feeling or health concerns"
              className="h-12 flex-1 rounded-xl border border-[#efedeb] bg-[#fafaf9] px-4 text-sm text-[#97938d]"
            />
            <Link
              href="/ai-doctor"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-[#76b8d4] px-5 text-sm font-semibold text-white hover:bg-[#5c9dbb]"
            >
              Start your free AI consult
            </Link>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-[#7f7a73]">
          <span className="rounded-full border border-[#e6e3de] bg-white px-3 py-1.5">Lock in my records</span>
          <span className="rounded-full border border-[#e6e3de] bg-white px-3 py-1.5">Get a doctor</span>
          <span className="rounded-full border border-[#e6e3de] bg-white px-3 py-1.5">Request a lab</span>
          <span className="rounded-full border border-[#e6e3de] bg-white px-3 py-1.5">HIPAA-ready</span>
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-5xl">
        <h2 className="text-center font-serif text-[2.4rem] text-[#1e1d1a]">Why people trust us</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {trustCards.map((card) => (
            <article key={card.title} className="rounded-2xl border border-[#e8e6e3] bg-white p-6">
              <h3 className="text-base font-semibold text-[#23211f]">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#807b74]">{card.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-20 grid max-w-5xl gap-8 md:grid-cols-2 md:items-center">
        <article>
          <h3 className="font-serif text-[2rem] text-[#1f1d1a]">Talk naturally</h3>
          <p className="mt-3 text-sm leading-relaxed text-[#7e7971]">
            No medical jargon required. Just describe how you&apos;re feeling and YourDoc guides next steps.
          </p>
        </article>
        <article className="rounded-2xl border border-[#e7e5e2] bg-white p-6 shadow-[0_10px_24px_rgba(0,0,0,0.05)]">
          <p className="text-sm text-[#6f6a64]">What brings you in today?</p>
          <div className="mt-3 flex justify-end">
            <p className="rounded-2xl bg-[#78b9d5] px-3 py-2 text-sm text-white">I&apos;ve had a headache for 3 days</p>
          </div>
          <p className="mt-4 text-xs text-[#98948d]">AI consult in progress...</p>
        </article>
      </section>

      <section className="mx-auto mt-14 max-w-5xl rounded-3xl bg-[#1f1c1a] p-8 text-white shadow-[0_16px_44px_rgba(0,0,0,0.24)] md:flex md:items-center md:justify-between">
        <div>
          <h3 className="font-serif text-[2rem] leading-none">Real doctors, when you need them</h3>
          <ul className="mt-4 grid gap-2 text-sm text-[#dbd7d2]">
            <li>- Async and live doctor visits</li>
            <li>- Prescriptions sent to your pharmacy</li>
            <li>- No insurance required</li>
          </ul>
        </div>
        <Link href="/consultations" className="mt-6 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#1f1c1a] md:mt-0">
          Book a Visit
        </Link>
      </section>

      <section className="mx-auto mt-14 max-w-5xl rounded-3xl border border-[#dfeef5] bg-[#eaf6fc] px-6 py-10 text-center">
        <p className="inline-flex rounded-full border border-[#cbe3ef] bg-white px-3 py-1 text-xs font-semibold text-[#5f9fbd]">Prana+</p>
        <h3 className="mt-4 font-serif text-[2.2rem] text-[#1f1d1a]">Unlock the full experience</h3>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-[#6f6a64]">
          Get your personal health dashboard, smart AI conversations, and easy doctor follow-up from one place.
        </p>
        <div className="mx-auto mt-6 grid max-w-3xl gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-white p-4 text-sm">Health Dashboard</div>
          <div className="rounded-xl bg-white p-4 text-sm">Smarter Chat</div>
          <div className="rounded-xl bg-white p-4 text-sm">₹20 Doctor Visits</div>
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-6xl">
        <h3 className="text-center font-serif text-[2.4rem] text-[#1f1d1a]">Simple, transparent pricing</h3>
        <p className="mt-2 text-center text-sm text-[#7f7a73]">Start free, upgrade when you&apos;re ready for deeper care support.</p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {pricing.map((plan) => (
            <article
              key={plan.name}
              className={`rounded-2xl border bg-white p-6 ${
                plan.featured ? "border-[#7fbdd8] shadow-[0_18px_35px_rgba(114,172,198,0.24)]" : "border-[#e6e3de]"
              }`}
            >
              <p className="text-sm font-semibold text-[#4a4742]">{plan.name}</p>
              <p className="mt-2 font-serif text-[2.7rem] leading-none text-[#1f1d1a]">{plan.price}</p>
              <ul className="mt-4 grid gap-2 text-sm text-[#726d66]">
                {plan.highlights.map((item) => (
                  <li key={item}>- {item}</li>
                ))}
              </ul>
              <Link
                href="/pay"
                className={`mt-6 inline-flex rounded-xl px-4 py-2 text-sm font-semibold ${
                  plan.featured ? "bg-[#74b7d3] text-white" : "border border-[#ddd9d3] text-[#282521]"
                }`}
              >
                {plan.cta}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-5xl rounded-3xl border border-[#dcecf4] bg-[#eff8fd] p-9 text-center">
        <h3 className="font-serif text-[2.2rem] text-[#1f1d1a]">Ready to get started?</h3>
        <div className="mx-auto mt-5 max-w-xl rounded-2xl border border-[#e0edf4] bg-white p-3">
          <div className="flex gap-2">
            <input
              readOnly
              value="Describe your symptoms"
              className="h-11 flex-1 rounded-xl border border-[#efedeb] bg-[#fafafa] px-3 text-sm text-[#98948d]"
            />
            <Link
              href="/ai-doctor"
              className="inline-flex h-11 items-center rounded-xl bg-[#74b7d3] px-4 text-sm font-semibold text-white"
            >
              Start Consult
            </Link>
          </div>
        </div>
        <p className="mt-3 text-xs text-[#9a968f]">No payment required</p>
      </section>
    </div>
  );
}
