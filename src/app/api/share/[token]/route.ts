import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logBriefEvent } from "@/lib/server/yourdoc/brief-events";
import { getClientIp } from "@/lib/server/yourdoc/access";
import { verifySharePin } from "@/lib/server/yourdoc/share";
import type { BriefOutput, ShareBriefResponse } from "@/lib/yourdoc/types";

type Params = {
  params: Promise<{
    token: string;
  }>;
};

const payloadSchema = z.object({
  pin: z.string().trim().optional(),
});

const bucket = "brief-files";

function sanitizeSummary(summary: BriefOutput & { intake_snapshot?: unknown }): BriefOutput {
  const {
    care_setting,
    department_bucket,
    brief_title,
    next_steps,
    red_flags_checked,
    confidence_notes,
    doctor_summary_sections,
  } = summary;

  return {
    care_setting,
    department_bucket,
    brief_title,
    next_steps,
    red_flags_checked,
    confidence_notes,
    doctor_summary_sections,
  };
}

export async function POST(request: Request, { params }: Params) {
  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Supabase admin not configured." }, { status: 503 });
  }

  const { token } = await params;
  const body = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(body ?? {});

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const { data: brief, error } = await admin
    .from("briefs")
    .select(
      "id, title, care_setting, department_bucket, summary_json, created_at, share_pin_hash, share_expires_at, revoked_at",
    )
    .eq("share_token", token)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!brief) {
    return NextResponse.json({ error: "Share link not found." }, { status: 404 });
  }

  if (brief.revoked_at) {
    return NextResponse.json({ error: "This share link has been revoked." }, { status: 410 });
  }

  if (brief.share_expires_at && new Date(brief.share_expires_at).getTime() < Date.now()) {
    return NextResponse.json({ error: "This share link has expired." }, { status: 410 });
  }

  if (!verifySharePin(parsed.data.pin ?? "", brief.share_pin_hash)) {
    return NextResponse.json({ error: "PIN is required or invalid." }, { status: 401 });
  }

  const { data: uploads } = await admin
    .from("uploads")
    .select("id, storage_path, mime_type, original_filename")
    .eq("brief_id", brief.id)
    .order("created_at", { ascending: true });

  const attachments = await Promise.all(
    (uploads ?? []).map(async (item) => {
      const signed = await admin.storage.from(bucket).createSignedUrl(item.storage_path, 15 * 60);

      return {
        id: item.id,
        fileName: item.original_filename ?? "attachment",
        mimeType: item.mime_type,
        downloadUrl: signed.data?.signedUrl ?? null,
      };
    }),
  );

  await logBriefEvent(admin, {
    briefId: brief.id,
    actorType: "public_link",
    eventType: "viewed",
    ip: getClientIp(request),
    userAgent: request.headers.get("user-agent"),
  });

  const response: ShareBriefResponse = {
    brief: {
      id: brief.id,
      title: brief.title,
      careSetting: brief.care_setting,
      departmentBucket: brief.department_bucket,
      summary: sanitizeSummary(brief.summary_json as BriefOutput),
      createdAt: brief.created_at,
    },
    attachments,
    disclaimer: "This is not a diagnosis.",
    disclaimerHi: "Yeh diagnosis nahi hai.",
  };

  return NextResponse.json(response);
}
