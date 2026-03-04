import { redirect } from "next/navigation";
import Link from "next/link";
import { AppPageLayout } from "@/components/app-page-layout";
import { AdminDoctorApplicationsPanel } from "@/components/panels/admin-doctor-applications-panel";
import { requireUser } from "@/lib/server/require-user";
import { getUserRole } from "@/lib/server/roles";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminDoctorApplicationsPage() {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  if (!user || !supabase) {
    redirect("/login");
  }

  const role = await getUserRole(supabase, user.id);

  if (role !== "admin") {
    return (
      <AppPageLayout
        title="Doctor Applications"
        description="Admin-only area"
        email={user.email ?? null}
      >
        <p className="rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] p-4 text-sm text-[var(--muted)]">
          You need admin access to review doctor onboarding applications.
        </p>
      </AppPageLayout>
    );
  }

  return (
    <AppPageLayout
      title="Doctor Applications"
      description="Review and approve doctor onboarding requests."
      email={user.email ?? null}
      actions={
        <Link
          href="/admin/audit"
          className="rounded-xl border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--text)]"
        >
          View Audit Logs
        </Link>
      }
    >
      <AdminDoctorApplicationsPanel />
    </AppPageLayout>
  );
}
