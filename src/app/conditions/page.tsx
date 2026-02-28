import Link from "next/link";
import { PageShell } from "@/components/page-shell";

const conditions = [
  "fever",
  "cold-and-cough",
  "migraine",
  "urinary-tract-infection",
  "thyroid-disorder",
  "pcos",
];

export default function ConditionsPage() {
  return (
    <PageShell
      title="Common Conditions"
      description="Learn about common health conditions and when to see a doctor."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {conditions.map((condition) => (
          <Link
            key={condition}
            href={`/compare/${condition}-vs-flu`}
            className="rounded-xl border border-[var(--line)] p-4 text-sm capitalize hover:border-[var(--brand-400)]"
          >
            {condition.replaceAll("-", " ")}
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
