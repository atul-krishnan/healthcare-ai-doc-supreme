import { redirect } from "next/navigation";
import { AppPageLayout } from "@/components/app-page-layout";
import { AdminDoctorAuditPanel } from "@/components/panels/admin-doctor-audit-panel";
import { requireUser } from "@/lib/server/require-user";
import { getUserRole } from "@/lib/server/roles";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminAuditPage() {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  if (!user || !supabase) {
    redirect("/login");
  }

  const role = await getUserRole(supabase, user.id);

  if (role !== "admin") {
    return (
      <AppPageLayout title="Audit Logs" description="Admin-only area" email={user.email ?? null}>
        <p className="rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] p-4 text-sm text-[var(--muted)]">
          You need admin access to view doctor access audit logs.
        </p>
      </AppPageLayout>
    );
  }

  return (
    <AppPageLayout
      title="Audit Logs"
      description="Chronological doctor access and workflow actions for compliance review."
      email={user.email ?? null}
    >
      <AdminDoctorAuditPanel />
    </AppPageLayout>
  );
}
