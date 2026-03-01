import { redirect } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { DoctorQueuePanel } from "@/components/panels/doctor-queue-panel";
import { DoctorQuickcheckPanel } from "@/components/yourdoc/doctor-quickcheck-panel";
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
      description="Quick Check calls and consultation queue in one place."
    >
      <div className="grid gap-8">
        <section className="grid gap-3">
          <h2 className="text-lg font-semibold text-[#1D3557]">Quick Check (10 min) Console</h2>
          <DoctorQuickcheckPanel />
        </section>

        <section className="grid gap-3">
          <h2 className="text-lg font-semibold text-[#1D3557]">Consultation Queue</h2>
          <DoctorQueuePanel />
        </section>
      </div>
    </PageShell>
  );
}
