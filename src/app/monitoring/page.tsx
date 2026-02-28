import { AppPageLayout } from "@/components/app-page-layout";
import { DriftMonitorPanel } from "@/components/panels/drift-monitor-panel";
import { requireUser } from "@/lib/server/require-user";

export default async function MonitoringPage() {
  const user = await requireUser();

  return (
    <AppPageLayout
      title="Clinical Monitoring"
      description="Run rolling physiological drift analysis to flag possible deterioration before doctor review."
      email={user?.email ?? null}
    >
      <DriftMonitorPanel />
    </AppPageLayout>
  );
}
