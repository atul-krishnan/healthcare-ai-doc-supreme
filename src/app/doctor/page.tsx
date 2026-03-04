import { redirect } from "next/navigation";
import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { DoctorQueuePanel } from "@/components/panels/doctor-queue-panel";
import { DoctorAvailabilityPanel } from "@/components/panels/doctor-availability-panel";
import { DoctorQuickcheckPanel } from "@/components/yourdoc/doctor-quickcheck-panel";
import { requireUser } from "@/lib/server/require-user";
import { getUserRole } from "@/lib/server/roles";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getActiveDoctorRow } from "@/lib/server/yourdoc/doctors";

export default async function DoctorPage() {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  if (!user || !supabase) {
    redirect("/login");
  }

  const role = await getUserRole(supabase, user.id);
  const activeDoctor = role === "doctor" ? await getActiveDoctorRow(supabase, user.id) : null;

  if ((role === "doctor" && !activeDoctor) || (role !== "doctor" && role !== "admin")) {
    return (
      <PageShell
        title="Doctor Workspace"
        description="This area is for verified medical professionals only."
      >
        <div className="grid gap-3">
          <p className="rounded-lg bg-[var(--surface-alt)] p-4 text-sm text-[var(--muted)]">
            Your account needs approved doctor access to use this workspace.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/doctor/apply"
              className="rounded-xl bg-[var(--brand-600)] px-4 py-2 text-sm font-semibold text-white"
            >
              Apply as doctor
            </Link>
            <Link href="/profile" className="rounded-xl border border-[var(--line)] px-4 py-2 text-sm font-semibold">
              Back to profile
            </Link>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Doctor Workspace"
      description="Quick Check calls and consultation queue in one place."
    >
      <div className="grid gap-8">
        {role === "doctor" ? <DoctorAvailabilityPanel /> : null}

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
