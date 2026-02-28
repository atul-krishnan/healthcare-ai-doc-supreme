import { notFound } from "next/navigation";
import { readFile } from "node:fs/promises";
import path from "node:path";

type DocPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const docMap: Record<string, string> = {
  "implementation-plan": "IMPLEMENTATION_PLAN.md",
  "india-eu-compliance": "INDIA_TO_EU_COMPLIANCE.md",
  "founder-skills": "FOUNDER_SKILLS.md",
  "local-setup": "LOCAL_SETUP.md",
  blockers: "BLOCKERS_REQUIRING_USER.md",
  "worklog-2026-02-28": "WORKLOG_2026-02-28.md",
  "deployment-checklist": "DEPLOYMENT_CHECKLIST.md",
  "ui-ux-alignment": "UI_UX_ALIGNMENT_PRANADOC.md",
  "security-testing-status": "SECURITY_TESTING_STATUS.md",
  "roadmap-gap-analysis": "ROADMAP_GAP_ANALYSIS_PRANADOC_STACK.md",
  "founder-input-tracker": "FOUNDER_INPUT_TRACKER.md",
  "knowledge-base-setup": "KNOWLEDGE_BASE_SETUP.md",
  "supabase-setup-2026-02-28": "SUPABASE_SETUP_2026-02-28.md",
};

export default async function DocPage({ params }: DocPageProps) {
  const { slug } = await params;
  const filename = docMap[slug];

  if (!filename) {
    notFound();
  }

  const absolutePath = path.join(process.cwd(), "docs", filename);
  const content = await readFile(absolutePath, "utf-8");

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
      <article className="rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm sm:p-8">
        <pre className="whitespace-pre-wrap text-sm leading-7">{content}</pre>
      </article>
    </section>
  );
}
