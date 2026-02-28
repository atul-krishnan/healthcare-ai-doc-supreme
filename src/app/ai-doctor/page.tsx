import Link from "next/link";
import { AppPageLayout } from "@/components/app-page-layout";
import { AITriageForm } from "@/components/forms/ai-triage-form";
import { requireUser } from "@/lib/server/require-user";

export default async function AIDoctorPage() {
  const user = await requireUser();

  return (
    <AppPageLayout
      title="Tell us what's wrong."
      subtitle="We'll guide you."
      description="Describe your symptoms below. Our AI will assess them — and a real doctor is always available if you need one."
      email={user?.email ?? null}
      showSidebar={false}
    >
      <div className="grid gap-8">
        <div className="mx-auto w-full max-w-3xl rounded-2xl border border-[#D8E6E6] bg-white p-5 shadow-[0_12px_28px_rgba(42,157,143,0.05)]">
          <p className="mb-3 text-sm font-medium text-[#635f58]">What&apos;s going on? Describe it in your own words.</p>
          <AITriageForm />
        </div>

        <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center justify-center gap-2 text-xs text-[#7d7972]">
          <Link href="/health-records" className="rounded-full border border-[#D8E6E6] bg-white px-3 py-1.5">
            Secure records
          </Link>
          <Link href="/consultations" className="rounded-full border border-[#D8E6E6] bg-white px-3 py-1.5">
            See a doctor
          </Link>
          <Link href="/health-records" className="rounded-full border border-[#e1dfda] bg-white px-3 py-1.5">
            Lab requests
          </Link>
        </div>

        <section className="mx-auto mt-3 grid w-full max-w-5xl gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-[#D8E6E6] bg-white p-5">
            <p className="text-sm font-semibold text-[#2c2925]">Your data stays yours</p>
            <p className="mt-2 text-sm text-[#64748B]">End-to-end encryption, strict access controls, and zero data selling.</p>
          </article>
          <article className="rounded-2xl border border-[#D8E6E6] bg-white p-5">
            <p className="text-sm font-semibold text-[#2c2925]">Care that never clocks out</p>
            <p className="mt-2 text-sm text-[#64748B]">Get answers at 2 AM or 2 PM. A real doctor is just a tap away.</p>
          </article>
          <article className="rounded-2xl border border-[#D8E6E6] bg-white p-5">
            <p className="text-sm font-semibold text-[#2c2925]">Clinically grounded</p>
            <p className="mt-2 text-sm text-[#64748B]">Every response is built on peer-reviewed guidelines and physician review.</p>
          </article>
        </section>

        <section className="mx-auto w-full max-w-5xl rounded-3xl bg-[#1f1b19] p-8 text-white md:flex md:items-center md:justify-between">
          <div>
            <h2 className="font-serif text-[2rem]">Real doctors. Real prescriptions.</h2>
            <ul className="mt-4 grid gap-2 text-sm text-[#d8d3ce]">
              <li>- Message or video-call a licensed physician</li>
              <li>- Prescriptions sent to your pharmacy same-day</li>
              <li>- No insurance needed — pay per visit or subscribe</li>
            </ul>
          </div>
          <Link href="/consultations" className="mt-5 inline-flex rounded-xl bg-[#2A9D8F] px-5 py-3 text-sm font-semibold text-white hover:bg-[#21867a] transition-colors md:mt-0">
            Book a Visit
          </Link>
        </section>
      </div>
    </AppPageLayout>
  );
}
