import { PageShell } from "@/components/page-shell";
import { ConsultationsPanel } from "@/components/panels/consultations-panel";
import { requireUser } from "@/lib/server/require-user";

export default async function ConsultationsPage() {
  await requireUser();

  return (
    <PageShell
      title="Consultations"
      description="Patient-facing doctor workflow: create consult request, message clinicians, and track status."
    >
      <ConsultationsPanel />
    </PageShell>
  );
}
