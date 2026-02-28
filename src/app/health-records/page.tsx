import { PageShell } from "@/components/page-shell";
import { HealthRecordsPanel } from "@/components/panels/health-records-panel";
import { requireUser } from "@/lib/server/require-user";

export default async function HealthRecordsPage() {
  await requireUser();

  return (
    <PageShell
      title="Health Records"
      description="Upload and normalize records into one longitudinal timeline. CSV export is available through the API."
    >
      <HealthRecordsPanel />
    </PageShell>
  );
}
