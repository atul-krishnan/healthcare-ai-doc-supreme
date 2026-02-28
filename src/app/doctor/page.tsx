import { redirect } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { DoctorQueuePanel } from "@/components/panels/doctor-queue-panel";
import { requireUser } from "@/lib/server/require-user";
import { getUserRole } from "@/lib/server/roles";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function DoctorPage() {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  if (!user || !supabase) {
    redirect("/login");
  }

  const role = await getUserRole(supabase, user.id);

  if (role !== "doctor" && role !== "admin") {
    return (
      <PageShell
        title="Doctor Workspace"
        description="This area is restricted to doctor or admin roles."
      >
        <p className="rounded-lg bg-[var(--surface-alt)] p-4 text-sm text-[var(--muted)]">
          Assign your account `profiles.role` to `doctor` in Supabase to unlock this workspace.
        </p>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Doctor Workspace"
      description="Queue management, clinical messaging, and consultation closure with prescriptions."
    >
      <DoctorQueuePanel />
    </PageShell>
  );
}
