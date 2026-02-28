import { AppPageLayout } from "@/components/app-page-layout";
import { ConsultationsPanel } from "@/components/panels/consultations-panel";
import { requireUser } from "@/lib/server/require-user";

export default async function ConsultationsPage() {
  const user = await requireUser();

  return (
    <AppPageLayout
      title="Doctor Visits"
      description="Track your telehealth consultations. Our doctors cover common acute issues and escalate urgent situations into the right care pathway."
      email={user?.email ?? null}
    >
      <ConsultationsPanel />
    </AppPageLayout>
  );
}
