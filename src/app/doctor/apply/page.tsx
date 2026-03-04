import { AppPageLayout } from "@/components/app-page-layout";
import { DoctorApplyPanel } from "@/components/panels/doctor-apply-panel";
import { requireUser } from "@/lib/server/require-user";

export default async function DoctorApplyPage() {
  const user = await requireUser();

  return (
    <AppPageLayout
      title="Doctor Application"
      description="Apply for doctor access. Approved doctors can access the doctor-only queue and outcomes workspace."
      email={user?.email ?? null}
    >
      <DoctorApplyPanel />
    </AppPageLayout>
  );
}
