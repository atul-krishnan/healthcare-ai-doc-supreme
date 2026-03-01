import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { canViewerAccessBrief, getViewerIdentity } from "@/lib/server/yourdoc/access";
import { buildBriefPdf } from "@/lib/server/yourdoc/pdf";
import type { BriefOutput } from "@/lib/yourdoc/types";
import { logBriefEvent } from "@/lib/server/yourdoc/brief-events";
import { logAnalyticsEvent } from "@/lib/server/yourdoc/analytics";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: Request, { params }: Params) {
  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Supabase admin not configured." }, { status: 503 });
  }

  const { id } = await params;
  const identity = await getViewerIdentity(request);

  const canAccess = await canViewerAccessBrief(admin, id, identity);
  if (!canAccess) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: brief, error: briefError } = await admin
    .from("briefs")
    .select("id, title, care_setting, department_bucket, summary_json, created_at")
    .eq("id", id)
    .maybeSingle();

  if (briefError) {
    return NextResponse.json({ error: briefError.message }, { status: 500 });
  }

  if (!brief) {
    return NextResponse.json({ error: "Brief not found." }, { status: 404 });
  }

  const { data: uploads } = await admin
    .from("uploads")
    .select("original_filename")
    .eq("brief_id", id)
    .order("created_at", { ascending: true });

  const summary = brief.summary_json as BriefOutput;

  const pdfBytes = await buildBriefPdf({
    id: brief.id,
    title: brief.title,
    careSetting: brief.care_setting,
    departmentBucket: brief.department_bucket,
    createdAt: brief.created_at,
    summary,
    attachments: (uploads ?? []).map((item) => item.original_filename ?? "attachment"),
  });

  await Promise.all([
    logBriefEvent(admin, {
      briefId: brief.id,
      actorType: identity.userId ? "user" : "system",
      actorId: identity.userId,
      eventType: "downloaded",
      userAgent: request.headers.get("user-agent"),
    }),
    logAnalyticsEvent(admin, {
      eventName: "brief_shared_pdf",
      briefId: brief.id,
      userId: identity.userId,
      anonSessionId: identity.anonSessionId,
    }),
  ]);

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=yourdoc-brief-${brief.id.slice(0, 8)}.pdf`,
      "Cache-Control": "private, no-store",
    },
  });
}
