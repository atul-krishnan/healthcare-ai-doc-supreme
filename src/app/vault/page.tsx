import { AppPageLayout } from "@/components/app-page-layout";
import { VaultPanel } from "@/components/yourdoc/vault-panel";
import { requireUser } from "@/lib/server/require-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function VaultPage() {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  const [briefsResult, uploadsResult] =
    user && supabase
      ? await Promise.all([
          supabase
            .from("briefs")
            .select("id, title, care_setting, department_bucket, summary_json, created_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(200),
          supabase
            .from("uploads")
            .select("id, brief_id, original_filename, mime_type, doc_summary, created_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(300),
        ])
      : [{ data: [] }, { data: [] }];

  const initialBriefs = briefsResult.data ?? [];
  const initialUploads = (uploadsResult.data ?? []).map((item) => ({
    id: item.id,
    briefId: item.brief_id,
    fileName: item.original_filename,
    mimeType: item.mime_type,
    summary: item.doc_summary,
    createdAt: item.created_at,
  }));

  return (
    <AppPageLayout
      title="Health Vault"
      description="All your briefs and uploaded reports in one searchable timeline."
      email={user?.email ?? null}
    >
      <VaultPanel initialBriefs={initialBriefs} initialUploads={initialUploads} />
    </AppPageLayout>
  );
}
