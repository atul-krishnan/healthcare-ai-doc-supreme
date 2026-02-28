import Link from "next/link";
import { PageShell } from "@/components/page-shell";

const comparePages = [
  "uti-vs-std",
  "flu-vs-covid",
  "allergy-vs-cold",
  "migraine-vs-headache",
];

export default function ComparePage() {
  return (
    <PageShell
      title="Compare"
      description="High-intent comparison content pages with symptom tables and clear care-action guidance."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {comparePages.map((slug) => (
          <Link
            key={slug}
            href={`/compare/${slug}`}
            className="rounded-xl border border-[var(--line)] p-4 text-sm uppercase tracking-wide hover:border-[var(--brand-400)]"
          >
            {slug.replaceAll("-", " ")}
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
