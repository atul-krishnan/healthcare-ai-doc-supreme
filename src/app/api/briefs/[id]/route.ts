import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getClientIp, getViewerIdentity, canViewerAccessBrief } from "@/lib/server/yourdoc/access";
import type { BriefOutput } from "@/lib/yourdoc/types";
import { mandatoryDisclaimers } from "@/lib/server/yourdoc/safety";
import { evaluateQuickcheckCta } from "@/lib/server/yourdoc/quickcheck";
import { logBriefEvent } from "@/lib/server/yourdoc/brief-events";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

const bucket = "brief-files";

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
    .select("id, title, care_setting, department_bucket, summary_json, created_at, user_id")
    .eq("id", id)
    .maybeSingle();

  if (briefError) {
    return NextResponse.json({ error: briefError.message }, { status: 500 });
  }

  if (!brief) {
    return NextResponse.json({ error: "Brief not found." }, { status: 404 });
  }

  const { data: uploads, error: uploadError } = await admin
    .from("uploads")
    .select("id, storage_path, mime_type, original_filename")
    .eq("brief_id", id)
    .order("created_at", { ascending: true });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const attachmentRows = await Promise.all(
    (uploads ?? []).map(async (item) => {
      const signed = await admin.storage.from(bucket).createSignedUrl(item.storage_path, 60 * 60);
      return {
        id: item.id,
        fileName: item.original_filename ?? "attachment",
        mimeType: item.mime_type,
        downloadUrl: signed.data?.signedUrl ?? null,
      };
    }),
  );

  const summary = brief.summary_json as unknown as BriefOutput & {
    intake_snapshot?: { stillUnsure?: boolean };
  };

  await logBriefEvent(admin, {
    briefId: brief.id,
    actorType: identity.userId ? "user" : "system",
    actorId: identity.userId,
    eventType: "viewed",
    ip: getClientIp(request),
    userAgent: request.headers.get("user-agent"),
  });

  return NextResponse.json({
    brief: {
      id: brief.id,
      title: brief.title,
      careSetting: brief.care_setting,
      departmentBucket: brief.department_bucket,
      summary,
      createdAt: brief.created_at,
      quickcheck: evaluateQuickcheckCta(brief.care_setting, Boolean(summary?.intake_snapshot?.stillUnsure)),
      disclaimers: {
        notDiagnosis: mandatoryDisclaimers.notDiagnosisEn,
        notDiagnosisHi: mandatoryDisclaimers.notDiagnosisHi,
        emergency: mandatoryDisclaimers.erNowEn,
        emergencyHi: mandatoryDisclaimers.erNowHi,
      },
    },
    attachments: attachmentRows,
  });
}
