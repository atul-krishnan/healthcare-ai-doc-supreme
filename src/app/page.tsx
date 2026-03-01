import Link from "next/link";
import { SymptomInput } from "@/components/forms/symptom-input";

const trustCards = [
  {
    title: "Guided, not diagnostic",
    body: "YourDoc Guide helps you decide the right care setting and prepares a clean summary for your doctor.",
  },
  {
    title: "Private by default",
    body: "Uploads are stored in private storage and attached to your intake and brief only.",
  },
  {
    title: "Doctor follow-up when needed",
    body: "Move from your brief into a real doctor visit when urgency, uncertainty, or preference calls for it.",
  },
];

const careSettings = [
  "Self-care",
  "OPD in 24 to 72 hours",
  "Urgent clinic today",
  "ER now",
];

export default function Home() {
  return (
    <div className="px-4 pb-20 md:px-8">
      <section className="mx-auto max-w-6xl pt-14 md:pt-20">
        <div className="rounded-[2rem] border border-[#D8E6E6] bg-gradient-to-br from-[#F8FCFF] via-white to-[#F3FAF7] p-6 shadow-[0_16px_40px_rgba(42,157,143,0.08)] md:p-10">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#2A9D8F]">YourDoc Guide</p>
            <h1 className="mt-4 font-serif text-[2.8rem] leading-[0.95] tracking-[-0.02em] text-[#1d1d1b] md:text-[4.2rem]">
              Create a Doctor Brief in minutes
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-base text-[#61788f] md:text-lg">
              Describe your symptoms and upload records. We guide your intake, suggest the care setting, and generate a
              shareable brief for any doctor.
            </p>
          </div>

          <div className="mx-auto mt-8 max-w-4xl rounded-3xl border border-[#D8E6E6] bg-white p-4 md:p-5">
            <SymptomInput
              placeholder="Tell me about your symptoms or health concerns"
              buttonText="Create Doctor Brief"
              showQuickActions
            />
          </div>

          <div className="mx-auto mt-6 flex max-w-4xl flex-wrap items-center justify-center gap-2 text-xs text-[#5f768b]">
            {careSettings.map((item) => (
              <span key={item} className="rounded-full border border-[#D8E6E6] bg-white px-3 py-1.5">
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-6xl">
        <div className="grid gap-4 md:grid-cols-3">
          {trustCards.map((card) => (
            <article
              key={card.title}
              className="rounded-2xl border border-[#D8E6E6] bg-white p-5 shadow-[0_8px_24px_rgba(42,157,143,0.05)]"
            >
              <h2 className="text-base font-semibold text-[#1D3557]">{card.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#667f94]">{card.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-6xl rounded-3xl border border-[#D8E6E6] bg-[#1f1c1a] p-7 text-white md:flex md:items-center md:justify-between">
        <div className="max-w-2xl">
          <h3 className="font-serif text-[2rem] leading-tight">Need clinician support after your brief?</h3>
          <p className="mt-3 text-sm text-[#ddd7cf]">
            YourDoc can route you into a doctor visit for follow-up and treatment decisions.
          </p>
        </div>
        <Link
          href="/consultations"
          className="mt-5 inline-flex rounded-xl bg-[#2A9D8F] px-5 py-3 text-sm font-semibold text-white hover:bg-[#21867a] md:mt-0"
        >
          Talk to a doctor
        </Link>
      </section>
    </div>
  );
}
