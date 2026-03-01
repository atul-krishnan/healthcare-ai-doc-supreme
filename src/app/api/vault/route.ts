import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/server/request-context";

function matchesQuery(value: string, query: string) {
  return value.toLowerCase().includes(query.toLowerCase());
}

export async function GET(request: Request) {
  const auth = await requireApiUser();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";

  const [briefsResult, uploadsResult] = await Promise.all([
    auth.context.supabase
      .from("briefs")
      .select("id, title, care_setting, department_bucket, summary_json, created_at")
      .eq("user_id", auth.context.userId)
      .order("created_at", { ascending: false })
      .limit(200),
    auth.context.supabase
      .from("uploads")
      .select("id, brief_id, original_filename, mime_type, doc_summary, ocr_text, created_at")
      .eq("user_id", auth.context.userId)
      .order("created_at", { ascending: false })
      .limit(300),
  ]);

  if (briefsResult.error) {
    return NextResponse.json({ error: briefsResult.error.message }, { status: 500 });
  }

  if (uploadsResult.error) {
    return NextResponse.json({ error: uploadsResult.error.message }, { status: 500 });
  }

  const briefs = briefsResult.data ?? [];
  const uploads = uploadsResult.data ?? [];

  const filteredBriefs =
    query.length === 0
      ? briefs
      : briefs.filter((item) =>
          matchesQuery(
            `${item.title} ${item.care_setting} ${item.department_bucket} ${JSON.stringify(item.summary_json)}`,
            query,
          ),
        );

  const filteredUploads =
    query.length === 0
      ? uploads
      : uploads.filter((item) =>
          matchesQuery(
            `${item.original_filename ?? ""} ${item.doc_summary ?? ""} ${item.ocr_text ?? ""}`,
            query,
          ),
        );

  return NextResponse.json({
    briefs: filteredBriefs,
    uploads: filteredUploads.map((item) => ({
      id: item.id,
      briefId: item.brief_id,
      fileName: item.original_filename,
      mimeType: item.mime_type,
      summary: item.doc_summary,
      createdAt: item.created_at,
    })),
  });
}
