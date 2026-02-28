import { AppPageLayout } from "@/components/app-page-layout";
import { HealthRecordsPanel } from "@/components/panels/health-records-panel";
import { requireUser } from "@/lib/server/require-user";

export default async function HealthRecordsPage() {
  const user = await requireUser();

  return (
    <AppPageLayout
      title="Health Records"
      description="Upload, scan, normalize, and export your medical records from one workspace."
      email={user?.email ?? null}
    >
      <HealthRecordsPanel />
    </AppPageLayout>
  );
}
