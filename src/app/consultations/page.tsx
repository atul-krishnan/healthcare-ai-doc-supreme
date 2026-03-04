import { AppPageLayout } from "@/components/app-page-layout";
import { ConsultationsPanel } from "@/components/panels/consultations-panel";
import { requireUser } from "@/lib/server/require-user";

type SearchParams = Promise<{
  doctor?: string;
}>;

export default async function ConsultationsPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requireUser();
  const params = await searchParams;
  const preferredDoctorId = params?.doctor?.trim() || null;

  return (
    <AppPageLayout
      title="Doctor Visits"
      description="Your doctor visits and Quick Check callbacks — past, present, and upcoming — all in one place."
      email={user?.email ?? null}
    >
      <ConsultationsPanel preferredDoctorId={preferredDoctorId} />
    </AppPageLayout>
  );
}
