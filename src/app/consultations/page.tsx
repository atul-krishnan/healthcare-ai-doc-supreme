import { AppPageLayout } from "@/components/app-page-layout";
import { ConsultationsPanel } from "@/components/panels/consultations-panel";
import { requireUser } from "@/lib/server/require-user";

export default async function ConsultationsPage() {
  const user = await requireUser();

  return (
    <AppPageLayout
      title="Doctor Visits"
      description="Your doctor visits — past, present, and upcoming — all in one place."
      email={user?.email ?? null}
    >
      <ConsultationsPanel />
    </AppPageLayout>
  );
}
