import { AppPageLayout } from "@/components/app-page-layout";
import { DoctorDirectoryPanel } from "@/components/panels/doctor-directory-panel";
import { requireUser } from "@/lib/server/require-user";

export default async function DoctorsPage() {
  const user = await requireUser();

  return (
    <AppPageLayout
      title="Find a Doctor"
      description="Browse verified doctors and start a consultation with the right specialist."
      email={user?.email ?? null}
    >
      <DoctorDirectoryPanel />
    </AppPageLayout>
  );
}
