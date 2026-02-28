import { PageShell } from "@/components/page-shell";

const articles = [
  "When to trust AI symptom guidance and when to see a doctor",
  "How to build a personal health timeline from disconnected records",
  "Telemedicine in India: practical patient safety checklist",
];

export default function BlogPage() {
  return (
    <PageShell
      title="Health Insights"
      description="Expert-written guides to help you make better health decisions."
    >
      <div className="grid gap-3">
        {articles.map((article) => (
          <article key={article} className="rounded-xl border border-[var(--line)] p-4 text-sm">
            {article}
          </article>
        ))}
      </div>
    </PageShell>
  );
}
