import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { AITriageForm } from "@/components/forms/ai-triage-form";

export default function AIDoctorPage() {
  return (
    <PageShell
      title="AI Doctor"
      description="Describe your symptoms and receive structured triage guidance instantly. High-risk findings can be escalated into doctor consultations from the same flow."
      primaryCta={{ label: "Open Consultations", href: "/consultations" }}
      secondaryCta={{ label: "View Pricing", href: "/pricing" }}
    >
      <div className="grid gap-6 md:grid-cols-2 md:items-start">
        <div className="rounded-3xl border border-stone-200/80 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="font-serif text-2xl text-stone-900">Symptom Intake</h2>
          <p className="mt-2 text-sm text-stone-500">
            Provide concise symptom details, duration, and risk factors for better triage quality.
          </p>
          <div className="mt-5">
            <AITriageForm />
          </div>
        </div>

        <div className="space-y-4">
          <article className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-sm">
            <h3 className="font-serif text-xl text-stone-900">Safety first</h3>
            <p className="mt-2 text-sm leading-relaxed text-stone-500">
              The assistant is conservative. Severe chest pain, breathing difficulty, major bleeding, neurological
              changes, or altered consciousness should be treated as emergency care.
            </p>
          </article>

          <article className="rounded-3xl border border-[#7DB8D4]/20 bg-[#E8F4F8]/60 p-6">
            <h3 className="font-serif text-xl text-stone-900">Escalation workflow</h3>
            <ul className="mt-3 grid gap-2 text-sm text-stone-600">
              <li>- Medium/high severity can create a consultation in one click.</li>
              <li>- Doctor queue can assign and respond in `/doctor`.</li>
              <li>- Completion includes summary, notes, and optional prescription artifacts.</li>
            </ul>
            <Link href="/doctor" className="mt-4 inline-block text-sm font-medium text-[#5A9AB8]">
              Open Doctor Workspace
            </Link>
          </article>
        </div>
      </div>
    </PageShell>
  );
}
