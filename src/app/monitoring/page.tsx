import { AppPageLayout } from "@/components/app-page-layout";
import { DriftMonitorPanel } from "@/components/panels/drift-monitor-panel";
import { requireUser } from "@/lib/server/require-user";

export default async function MonitoringPage() {
  const user = await requireUser();

  return (
    <AppPageLayout
      title="Clinical Monitoring"
      description="We watch your health trends so you don't have to."
      email={user?.email ?? null}
    >
      <DriftMonitorPanel />
    </AppPageLayout>
  );
}
