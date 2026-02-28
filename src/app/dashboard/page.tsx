import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { requireUser } from "@/lib/server/require-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type DashboardMetric = {
  label: string;
  value: string;
};

async function getMetrics(userId: string): Promise<DashboardMetric[]> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [
      { label: "Configuration", value: "Supabase env missing" },
      { label: "Triage Sessions", value: "-" },
      { label: "Consultations", value: "-" },
      { label: "Health Records", value: "-" },
    ];
  }

  const [triageResult, consultationResult, recordsResult, subscriptionResult] = await Promise.all([
    supabase
      .from("triage_sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("consultations")
      .select("id", { count: "exact", head: true })
      .eq("patient_id", userId),
    supabase
      .from("health_records")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("subscriptions")
      .select("status")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  return [
    { label: "Triage Sessions", value: String(triageResult.count ?? 0) },
    { label: "Consultations", value: String(consultationResult.count ?? 0) },
    { label: "Health Records", value: String(recordsResult.count ?? 0) },
    { label: "Plan Status", value: subscriptionResult.data?.status ?? "none" },
  ];
}

const quickActions = [
  { label: "Ask AI Doctor", href: "/ai-doctor" },
  { label: "Consult a Doctor", href: "/consultations" },
  { label: "Open Legacy Chat", href: "/chat" },
  { label: "Manage Health Records", href: "/health-records" },
  { label: "Billing and Plan", href: "/pay" },
  { label: "Doctor Workspace", href: "/doctor" },
  { label: "Profile and Preferences", href: "/profile" },
];

export default async function DashboardPage() {
  const user = await requireUser();
  const metrics = user ? await getMetrics(user.id) : [];

  return (
    <PageShell
      title="Patient Dashboard"
      description="Operational cockpit for AI triage, doctor conversations, records, and subscriptions."
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <article key={metric.label} className="rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] p-4">
            <p className="text-xs uppercase tracking-wide text-[var(--muted)]">{metric.label}</p>
            <p className="mt-1 text-2xl font-semibold">{metric.value}</p>
          </article>
        ))}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="rounded-xl border border-[var(--line)] p-4 text-sm font-semibold hover:border-[var(--brand-400)]"
          >
            {action.label}
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
