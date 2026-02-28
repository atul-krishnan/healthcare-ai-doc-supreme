import { PageShell } from "@/components/page-shell";
import { ProfilePanel } from "@/components/panels/profile-panel";
import { requireUser } from "@/lib/server/require-user";

export default async function ProfilePage() {
  await requireUser();

  return (
    <PageShell
      title="Profile"
      description="Account details, notification preferences, and logout controls."
    >
      <ProfilePanel />
    </PageShell>
  );
}
