import { AppPageLayout } from "@/components/app-page-layout";
import { IntegrationSyncPanel } from "@/components/panels/integration-sync-panel";
import { requireUser } from "@/lib/server/require-user";

export default async function IntegrationsPage() {
  const user = await requireUser();

  return (
    <AppPageLayout
      title="Integrations"
      description="Wearables and EHR ingestion with FHIR normalization and mock fallback for local validation."
      email={user?.email ?? null}
    >
      <IntegrationSyncPanel />
    </AppPageLayout>
  );
}
