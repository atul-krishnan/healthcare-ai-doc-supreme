import { AppPageLayout } from "@/components/app-page-layout";
import { DoctorProfilePanel } from "@/components/panels/doctor-profile-panel";
import { requireUser } from "@/lib/server/require-user";

type Params = {
  params: Promise<{ id: string }>;
};

export default async function DoctorProfilePage({ params }: Params) {
  const user = await requireUser();
  const { id } = await params;

  return (
    <AppPageLayout
      title="Doctor Profile"
      description="Doctor details visible to patients. Contact details stay private on this page."
      email={user?.email ?? null}
    >
      <DoctorProfilePanel doctorId={id} />
    </AppPageLayout>
  );
}
