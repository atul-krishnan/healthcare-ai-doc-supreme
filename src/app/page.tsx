import Link from "next/link";

const valuePills = ["24/7 AI guidance", "Doctor consult workflow", "Unified records", "India-first launch"];

const trustStats = [
  { label: "AI triage response", value: "< 30 sec" },
  { label: "Consult workflow", value: "end-to-end" },
  { label: "Regions", value: "India → Europe" },
];

const sections = [
  {
    title: "Describe symptoms",
    body: "Patients start with AI intake and receive structured severity guidance with red-flag warnings.",
  },
  {
    title: "Escalate to doctor",
    body: "Medium/high-risk cases move into consultation queue with messaging and assignment flow.",
  },
  {
    title: "Close with records",
    body: "Clinical notes, prescriptions, and health records are persisted and export-ready.",
  },
];

export default function Home() {
  return (
    <div className="px-4 md:px-6">
      <section className="mx-auto max-w-6xl pt-28 pb-12 text-center md:pt-40 md:pb-16">
        <div className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm text-stone-600">
          <span className="h-2 w-2 rounded-full bg-[#7DB8D4]" />
          YourDoc Telemedicine Platform
        </div>

        <h1 className="mx-auto mt-6 max-w-5xl font-serif text-[2.75rem] leading-[1.05] tracking-[-0.02em] text-stone-900 md:text-[4rem]">
          Free AI Doctor Guidance, then real doctor consultations in one care flow.
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-base text-stone-500 md:text-lg">
          UI and workflow are now aligned to the current PranaDoc-style structure for validation: same visual rhythm,
          spacing style, and conversion-oriented page flow.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <Link
            href="/ai-doctor"
            className="rounded-2xl bg-[#7DB8D4] px-8 py-4 text-sm font-medium text-white shadow-lg transition-all hover:bg-[#5A9AB8] hover:shadow-xl"
          >
            Talk to AI Doctor
          </Link>
          <Link
            href="/consultations"
            className="rounded-2xl border border-stone-200 bg-white px-8 py-4 text-sm font-medium text-stone-700 shadow-lg transition-all hover:border-[#7DB8D4] hover:text-[#5A9AB8]"
          >
            Start Consultation
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-stone-500">
          {valuePills.map((pill) => (
            <span key={pill} className="rounded-full border border-stone-200 bg-white px-3 py-1.5">
              {pill}
            </span>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-4xl gap-4 border-y border-stone-200/60 py-10 md:grid-cols-3">
        {trustStats.map((item) => (
          <article key={item.label} className="rounded-2xl border border-stone-200/80 bg-white p-5 text-center">
            <p className="font-serif text-3xl text-stone-900">{item.value}</p>
            <p className="mt-1 text-sm text-stone-500">{item.label}</p>
          </article>
        ))}
      </section>

      <section className="mx-auto max-w-6xl py-16 md:py-24">
        <h2 className="mb-10 text-center font-serif text-[1.97rem] text-stone-900 md:text-[2.5rem]">How it works</h2>
        <div className="grid gap-5 md:grid-cols-3">
          {sections.map((item, index) => (
            <article
              key={item.title}
              className="rounded-3xl border border-stone-200/80 bg-white p-7 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#E8F4F8] text-xs font-semibold text-[#5A9AB8]">
                {index + 1}
              </div>
              <h3 className="font-serif text-2xl text-stone-900">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-stone-500">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl pb-16 md:pb-24">
        <div className="rounded-[2rem] border border-[#7DB8D4]/20 bg-gradient-to-br from-[#E8F4F8] via-white to-[#E8F4F8] p-10 text-center md:p-14">
          <h2 className="font-serif text-2xl text-stone-900 md:text-3xl">Ready to validate the full product flow?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-stone-500 md:text-base">
            Use `/ai-doctor`, `/consultations`, `/doctor`, `/health-records`, and `/pay` to validate the complete UX,
            frontend/backend integration, and operational lifecycle.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-full bg-[#7DB8D4] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#5A9AB8]"
            >
              Open Dashboard
            </Link>
            <Link
              href="/docs"
              className="rounded-full border border-stone-200 bg-white px-5 py-2.5 text-sm font-medium text-stone-700 transition-colors hover:border-[#7DB8D4] hover:text-[#5A9AB8]"
            >
              Review Docs and Blockers
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
