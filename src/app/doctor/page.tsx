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
        description="This area is for verified medical professionals only."
      >
        <p className="rounded-lg bg-[var(--surface-alt)] p-4 text-sm text-[var(--muted)]">
          Your account needs doctor-level access to use this workspace. Contact your administrator to get set up.
        </p>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Doctor Workspace"
      description="Your patient queue, messages, and prescriptions — all in one workflow."
    >
      <DoctorQueuePanel />
    </PageShell>
  );
}
