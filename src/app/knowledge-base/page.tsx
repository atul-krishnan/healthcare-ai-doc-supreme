import { AppPageLayout } from "@/components/app-page-layout";
import { KnowledgeBasePanel } from "@/components/panels/knowledge-base-panel";
import { requireUser } from "@/lib/server/require-user";

export default async function KnowledgeBasePage() {
  const user = await requireUser();

  return (
    <AppPageLayout
      title="Knowledge Base"
      description="The medical knowledge powering your AI consultations."
      email={user?.email ?? null}
    >
      <KnowledgeBasePanel />
    </AppPageLayout>
  );
}
