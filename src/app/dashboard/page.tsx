import Link from "next/link";
import { AppPageLayout } from "@/components/app-page-layout";
import { requireUser } from "@/lib/server/require-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type DashboardData = {
  triageCount: number;
  consultationCount: number;
  recordsCount: number;
  activeVisits: number;
  subscriptionStatus: string;
  recentConsultations: Array<{
    id: string;
    status: string;
    priority: string;
    chief_complaint: string;
    updated_at: string;
  }>;
  driftAlerts: Array<{
    id: string;
    title: string;
    created_at: string;
  }>;
};

async function getDashboardData(userId: string): Promise<DashboardData> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      triageCount: 0,
      consultationCount: 0,
      recordsCount: 0,
      activeVisits: 0,
      subscriptionStatus: "not configured",
      recentConsultations: [],
      driftAlerts: [],
    };
  }

  const [triageResult, consultationResult, recordsResult, activeVisitsResult, subscriptionResult, recentResult, alertResult] =
    await Promise.all([
      supabase.from("triage_sessions").select("id", { count: "exact", head: true }).eq("user_id", userId),
      supabase.from("consultations").select("id", { count: "exact", head: true }).eq("patient_id", userId),
      supabase.from("health_records").select("id", { count: "exact", head: true }).eq("user_id", userId),
      supabase
        .from("consultations")
        .select("id", { count: "exact", head: true })
        .eq("patient_id", userId)
        .in("status", ["open", "assigned", "in_progress"]),
      supabase.from("subscriptions").select("status").eq("user_id", userId).maybeSingle(),
      supabase
        .from("consultations")
        .select("id, status, priority, chief_complaint, updated_at")
        .eq("patient_id", userId)
        .order("updated_at", { ascending: false })
        .limit(4),
      supabase
        .from("health_records")
        .select("id, title, created_at")
        .eq("user_id", userId)
        .eq("record_type", "clinical_alert")
        .order("created_at", { ascending: false })
        .limit(4),
    ]);

  return {
    triageCount: triageResult.count ?? 0,
    consultationCount: consultationResult.count ?? 0,
    recordsCount: recordsResult.count ?? 0,
    activeVisits: activeVisitsResult.count ?? 0,
    subscriptionStatus: subscriptionResult.data?.status ?? "free",
    recentConsultations: recentResult.data ?? [],
    driftAlerts: (alertResult.data ?? []).map((item) => ({
      id: item.id,
      title: item.title,
      created_at: item.created_at,
    })),
  };
}

const actionCards = [
  {
    title: "Start Guided Intake",
    body: "Create a Doctor/Emergency Brief without waiting for login.",
    href: "/intake",
  },
  {
    title: "Quick Check Slots",
    body: "Book a 10-minute callback in evening slots.",
    href: "/consultations",
  },
  {
    title: "Open Health Vault",
    body: "Search briefs and uploaded records by keyword.",
    href: "/vault",
  },
  {
    title: "Wearables",
    body: "Wearables coming soon. Not connected yet — coming soon.",
  },
];

export default async function DashboardPage() {
  const user = await requireUser();
  const data = user ? await getDashboardData(user.id) : null;

  return (
    <AppPageLayout
      title="Dashboard"
      description="Everything about your health — at a glance."
      email={user?.email ?? null}
      actions={
        <Link href="/intake" className="rounded-xl bg-[var(--brand-600)] px-6 py-3 text-sm font-semibold text-white shadow-md shadow-[var(--brand-500)]/20 transition-colors hover:bg-[var(--brand-700)]">
          + New Intake
        </Link>
      }
    >
      <div className="grid gap-5">
        <section className="grid gap-4 md:grid-cols-4">
          <article className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Care Guides</p>
            <p className="mt-2 font-serif text-[2.4rem] leading-none text-[var(--text)]">{data?.triageCount ?? 0}</p>
          </article>
          <article className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Total Visits</p>
            <p className="mt-2 font-serif text-[2.4rem] leading-none text-[var(--text)]">{data?.consultationCount ?? 0}</p>
          </article>
          <article className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Active Visits</p>
            <p className="mt-2 font-serif text-[2.4rem] leading-none text-[var(--text)]">{data?.activeVisits ?? 0}</p>
          </article>
          <article className="rounded-2xl border border-[var(--line)] bg-[var(--brand-100)] p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-[var(--brand-700)]">Plan</p>
            <p className="mt-2 text-lg font-semibold capitalize text-[var(--brand-800)]">{data?.subscriptionStatus ?? "free"}</p>
            <Link href="/pay" className="mt-2 inline-block text-sm text-[var(--brand-600)] hover:text-[var(--brand-700)]">
              Manage subscription
            </Link>
          </article>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-base font-semibold text-[var(--text)]">Recent Visits</p>
              <Link href="/consultations" className="text-sm text-[var(--brand-600)] hover:text-[var(--brand-700)]">
                View all
              </Link>
            </div>
            <div className="grid gap-2">
              {(data?.recentConsultations.length ?? 0) === 0 ? (
                <p className="text-sm text-[var(--muted)]">No visits yet. Start your first consultation.</p>
              ) : (
                data?.recentConsultations.map((item) => (
                  <article key={item.id} className="rounded-xl border border-[var(--line)] bg-[var(--brand-50)] p-3">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-[var(--text)]">{item.chief_complaint}</p>
                      <span className="text-xs uppercase text-[var(--muted)]">{item.status}</span>
                    </div>
                    <p className="text-xs text-[var(--muted)]">Priority: {item.priority}</p>
                  </article>
                ))
              )}
            </div>
          </article>

          <article className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-base font-semibold text-[var(--text)]">Clinical Alerts</p>
            </div>
            <div className="grid gap-2">
              {(data?.driftAlerts.length ?? 0) === 0 ? (
                <p className="text-sm text-[var(--muted)]">No alerts yet.</p>
              ) : (
                data?.driftAlerts.map((alert) => (
                  <article key={alert.id} className="rounded-xl border border-[var(--line)] bg-[var(--brand-50)] p-3">
                    <p className="text-sm font-medium text-[var(--text)]">{alert.title}</p>
                    <p className="text-xs text-[var(--muted)]">{new Date(alert.created_at).toLocaleString()}</p>
                  </article>
                ))
              )}
            </div>
          </article>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {actionCards.map((card) => (
            card.href ? (
              <Link
                key={card.title}
                href={card.href}
                className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm transition-colors hover:border-[var(--brand-300)]"
              >
                <p className="text-base font-semibold text-[var(--text)]">{card.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{card.body}</p>
              </Link>
            ) : (
              <article key={card.title} className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
                <p className="text-base font-semibold text-[var(--text)]">{card.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{card.body}</p>
              </article>
            )
          ))}
        </section>
      </div>
    </AppPageLayout>
  );
}
