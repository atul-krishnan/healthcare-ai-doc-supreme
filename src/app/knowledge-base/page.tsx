import { AppPageLayout } from "@/components/app-page-layout";
import { KnowledgeBasePanel } from "@/components/panels/knowledge-base-panel";
import { requireUser } from "@/lib/server/require-user";

export default async function KnowledgeBasePage() {
  const user = await requireUser();

  return (
    <AppPageLayout
      title="Knowledge Base"
      description="Clinical guideline retrieval layer backing triage and assistant responses."
      email={user?.email ?? null}
    >
      <KnowledgeBasePanel />
    </AppPageLayout>
  );
}
