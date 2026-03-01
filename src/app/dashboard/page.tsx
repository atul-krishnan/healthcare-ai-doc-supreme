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
        <Link href="/intake" className="rounded-2xl bg-[#2A9D8F] px-6 py-3 text-sm font-semibold text-white hover:bg-[#21867a] transition-colors">
          + New Intake
        </Link>
      }
    >
      <div className="grid gap-5">
        <section className="grid gap-4 md:grid-cols-4">
          <article className="rounded-2xl border border-[#D8E6E6] bg-white p-5">
            <p className="text-xs uppercase tracking-wide text-[#64748B]">Care Guides</p>
            <p className="mt-2 font-serif text-[2.4rem] leading-none text-[#22211f]">{data?.triageCount ?? 0}</p>
          </article>
          <article className="rounded-2xl border border-[#D8E6E6] bg-white p-5">
            <p className="text-xs uppercase tracking-wide text-[#8d8881]">Total Visits</p>
            <p className="mt-2 font-serif text-[2.4rem] leading-none text-[#1D3557]">{data?.consultationCount ?? 0}</p>
          </article>
          <article className="rounded-2xl border border-[#e6e2dc] bg-white p-5">
            <p className="text-xs uppercase tracking-wide text-[#8d8881]">Active Visits</p>
            <p className="mt-2 font-serif text-[2.4rem] leading-none text-[#1D3557]">{data?.activeVisits ?? 0}</p>
          </article>
          <article className="rounded-2xl border border-[#D8E6E6] bg-[#E6F2F0] p-5">
            <p className="text-xs uppercase tracking-wide text-[#21867a]">Plan</p>
            <p className="mt-2 text-lg font-semibold capitalize text-[#1a6b62]">{data?.subscriptionStatus ?? "free"}</p>
            <Link href="/pay" className="mt-2 inline-block text-sm text-[#2A9D8F] hover:text-[#21867a]">
              Manage subscription
            </Link>
          </article>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-2xl border border-[#D8E6E6] bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-base font-semibold text-[#1D3557]">Recent Visits</p>
              <Link href="/consultations" className="text-sm text-[#2A9D8F] hover:text-[#21867a]">
                View all
              </Link>
            </div>
            <div className="grid gap-2">
              {(data?.recentConsultations.length ?? 0) === 0 ? (
                <p className="text-sm text-[#8899a8]">No visits yet. Start your first consultation.</p>
              ) : (
                data?.recentConsultations.map((item) => (
                  <article key={item.id} className="rounded-xl border border-[#D8E6E6] bg-[#F8FCFF] p-3">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-[#1D3557]">{item.chief_complaint}</p>
                      <span className="text-xs uppercase text-[#64748B]">{item.status}</span>
                    </div>
                    <p className="text-xs text-[#8899a8]">Priority: {item.priority}</p>
                  </article>
                ))
              )}
            </div>
          </article>

          <article className="rounded-2xl border border-[#D8E6E6] bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-base font-semibold text-[#1D3557]">Clinical Alerts</p>
            </div>
            <div className="grid gap-2">
              {(data?.driftAlerts.length ?? 0) === 0 ? (
                <p className="text-sm text-[#8899a8]">No alerts yet.</p>
              ) : (
                data?.driftAlerts.map((alert) => (
                  <article key={alert.id} className="rounded-xl border border-[#D8E6E6] bg-[#F0F8FF] p-3">
                    <p className="text-sm font-medium text-[#1D3557]">{alert.title}</p>
                    <p className="text-xs text-[#8899a8]">{new Date(alert.created_at).toLocaleString()}</p>
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
                className="rounded-2xl border border-[#D8E6E6] bg-white p-5 transition-colors hover:border-[#d7d3cd]"
              >
                <p className="text-base font-semibold text-[#1D3557]">{card.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-[#667f94]">{card.body}</p>
              </Link>
            ) : (
              <article key={card.title} className="rounded-2xl border border-[#D8E6E6] bg-white p-5">
                <p className="text-base font-semibold text-[#1D3557]">{card.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-[#7e7972]">{card.body}</p>
              </article>
            )
          ))}
        </section>
      </div>
    </AppPageLayout>
  );
}
