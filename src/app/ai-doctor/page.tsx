import Link from "next/link";
import { AppPageLayout } from "@/components/app-page-layout";
import { AITriageForm } from "@/components/forms/ai-triage-form";
import { requireUser } from "@/lib/server/require-user";

export default async function AIDoctorPage() {
  const user = await requireUser();

  return (
    <AppPageLayout
      title="Welcome to"
      subtitle="YourDoc"
      description="After your chat, connect with a board-certified physician to manage your care."
      email={user?.email ?? null}
      showSidebar={false}
    >
      <div className="grid gap-8">
        <div className="mx-auto w-full max-w-3xl rounded-2xl border border-[#e5e2dd] bg-white p-5 shadow-[0_12px_28px_rgba(15,23,42,0.06)]">
          <p className="mb-3 text-sm font-medium text-[#635f58]">Tell us about your symptoms or health concerns</p>
          <AITriageForm />
        </div>

        <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center justify-center gap-2 text-xs text-[#7d7972]">
          <Link href="/health-records" className="rounded-full border border-[#e1dfda] bg-white px-3 py-1.5">
            Lock in my records
          </Link>
          <Link href="/consultations" className="rounded-full border border-[#e1dfda] bg-white px-3 py-1.5">
            Get a doctor
          </Link>
          <Link href="/health-records" className="rounded-full border border-[#e1dfda] bg-white px-3 py-1.5">
            Request a lab
          </Link>
        </div>

        <section className="mx-auto mt-3 grid w-full max-w-5xl gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-[#e7e4df] bg-white p-5">
            <p className="text-sm font-semibold text-[#2c2925]">Private by default</p>
            <p className="mt-2 text-sm text-[#7f7a73]">Your health data stays encrypted with strict access controls.</p>
          </article>
          <article className="rounded-2xl border border-[#e7e4df] bg-white p-5">
            <p className="text-sm font-semibold text-[#2c2925]">Always available</p>
            <p className="mt-2 text-sm text-[#7f7a73]">24/7 AI guidance with easy escalation into real doctor visits.</p>
          </article>
          <article className="rounded-2xl border border-[#e7e4df] bg-white p-5">
            <p className="text-sm font-semibold text-[#2c2925]">Expert-backed</p>
            <p className="mt-2 text-sm text-[#7f7a73]">Evidence-grounded responses with clinician review workflow.</p>
          </article>
        </section>

        <section className="mx-auto w-full max-w-5xl rounded-3xl bg-[#1f1b19] p-8 text-white md:flex md:items-center md:justify-between">
          <div>
            <h2 className="font-serif text-[2rem]">Real doctors, when you need them</h2>
            <ul className="mt-4 grid gap-2 text-sm text-[#d8d3ce]">
              <li>- Doctor visits and prescription follow-through</li>
              <li>- Async and live conversations</li>
              <li>- No insurance required</li>
            </ul>
          </div>
          <Link href="/consultations" className="mt-5 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#1f1b19] md:mt-0">
            Book a Visit
          </Link>
        </section>
      </div>
    </AppPageLayout>
  );
}
