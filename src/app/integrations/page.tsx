import { AppPageLayout } from "@/components/app-page-layout";
import { IntegrationSyncPanel } from "@/components/panels/integration-sync-panel";
import { requireUser } from "@/lib/server/require-user";

export default async function IntegrationsPage() {
  const user = await requireUser();

  return (
    <AppPageLayout
      title="Integrations"
      description="Connect your devices and health apps to keep everything in sync."
      email={user?.email ?? null}
    >
      <IntegrationSyncPanel />
    </AppPageLayout>
  );
}
