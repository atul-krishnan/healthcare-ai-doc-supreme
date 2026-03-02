import { AppPageLayout } from "@/components/app-page-layout";
import { ProfilePanel } from "@/components/panels/profile-panel";
import { hasStripeEnv } from "@/lib/env";
import { requireUser } from "@/lib/server/require-user";

export default async function ProfilePage() {
  const user = await requireUser();

  return (
    <AppPageLayout
      title="Profile"
      description={user?.email ?? "Account settings, subscription, and notification controls."}
      email={user?.email ?? null}
    >
      <ProfilePanel billingEnabled={hasStripeEnv} />
    </AppPageLayout>
  );
}
