import Link from "next/link";
import { PageShell } from "@/components/page-shell";

const docs = [
  {
    title: "Implementation Plan",
    slug: "implementation-plan",
    description: "Feature parity roadmap and build sequence.",
  },
  {
    title: "India to EU Compliance Notes",
    slug: "india-eu-compliance",
    description: "Regulatory milestones and architecture implications.",
  },
  {
    title: "Founder Skills Map",
    slug: "founder-skills",
    description: "Skills to develop to manage this platform effectively.",
  },
  {
    title: "Local Setup",
    slug: "local-setup",
    description: "Environment, Supabase migration, Stripe webhook, and OpenAI setup.",
  },
  {
    title: "Blockers Requiring User",
    slug: "blockers",
    description: "Items that require your credentials, approvals, or decisions.",
  },
  {
    title: "Worklog (2026-02-28)",
    slug: "worklog-2026-02-28",
    description: "Detailed implementation log from this execution pass.",
  },
  {
    title: "Deployment Checklist",
    slug: "deployment-checklist",
    description: "Go-live checklist for infrastructure, compliance, and verification.",
  },
  {
    title: "UI/UX Alignment",
    slug: "ui-ux-alignment",
    description: "Notes on PranaDoc-style layout, fonts, spacing, and theming alignment.",
  },
  {
    title: "Security + Testing Status",
    slug: "security-testing-status",
    description: "Current hardening and automated testing status.",
  },
  {
    title: "Roadmap Gap Analysis",
    slug: "roadmap-gap-analysis",
    description: "Implemented vs required breakdown against your architecture roadmap.",
  },
  {
    title: "Founder Input Tracker",
    slug: "founder-input-tracker",
    description: "Single checklist of decisions, credentials, and approvals needed from you.",
  },
  {
    title: "Knowledge Base Setup",
    slug: "knowledge-base-setup",
    description: "V1 retrieval architecture, governance, and external research references.",
  },
  {
    title: "Supabase Setup (2026-02-28)",
    slug: "supabase-setup-2026-02-28",
    description: "Executed provisioning/migration log for the new Supabase project.",
  },
];

export default function DocsPage() {
  return (
    <PageShell title="Documentation" description="Guides and reference docs for the YourDoc platform.">
      <div className="grid gap-3">
        {docs.map((doc) => (
          <article key={doc.slug} className="rounded-xl border border-[var(--line)] p-4 text-sm">
            <p className="font-semibold">{doc.title}</p>
            <p className="mt-1 text-[var(--muted)]">{doc.description}</p>
            <Link className="mt-2 inline-block text-[var(--brand-700)]" href={`/docs/${doc.slug}`}>
              Open /docs/{doc.slug}
            </Link>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
