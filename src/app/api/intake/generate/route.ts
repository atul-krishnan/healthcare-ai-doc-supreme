import { NextResponse } from "next/server";
import { intakeSchema } from "@/lib/yourdoc/types";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { validateRequestOrigin } from "@/lib/server/csrf";
import { generateClinicalBrief } from "@/lib/server/yourdoc/brief";
import { mandatoryDisclaimers } from "@/lib/server/yourdoc/safety";
import { logAnalyticsEvent } from "@/lib/server/yourdoc/analytics";
import { logBriefEvent } from "@/lib/server/yourdoc/brief-events";
import { evaluateQuickcheckCta } from "@/lib/server/yourdoc/quickcheck";

export async function POST(request: Request) {
  const originError = validateRequestOrigin(request);
  if (originError) {
    return originError;
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Supabase admin is not configured." }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const parsed = intakeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid intake payload.",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  if (!parsed.data.consentAccepted) {
    return NextResponse.json({ error: "Consent is required." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const userId = supabase ? (await supabase.auth.getUser()).data.user?.id ?? null : null;

  const uploadIds = parsed.data.uploadIds;
  const uploads =
    uploadIds.length > 0
      ? await admin
          .from("uploads")
          .select("id, user_id, anon_session_id, original_filename, doc_summary")
          .in("id", uploadIds)
      : { data: [], error: null };

  if (uploads.error) {
    return NextResponse.json({ error: uploads.error.message }, { status: 500 });
  }

  const uploadRows = uploads.data ?? [];

  const unauthorizedUpload = uploadRows.find((item) => {
    if (item.user_id && userId) {
      return item.user_id !== userId;
    }

    if (!item.user_id) {
      return item.anon_session_id !== parsed.data.anonSessionId;
    }

    return true;
  });

  if (unauthorizedUpload) {
    return NextResponse.json({ error: "One or more uploads are not accessible." }, { status: 403 });
  }

  const generated = await generateClinicalBrief(
    parsed.data,
    uploadRows.map((item) => ({
      id: item.id,
      fileName: item.original_filename ?? "attachment",
      summary: item.doc_summary,
    })),
  );

  const summaryJson = {
    ...generated.output,
    intake_snapshot: {
      chiefComplaint: parsed.data.chiefComplaint,
      timeline: parsed.data.timeline,
      severity: parsed.data.severity,
      age: parsed.data.age,
      sexAtBirth: parsed.data.sexAtBirth,
      pregnancyStatus: parsed.data.pregnancyStatus,
      conditions: parsed.data.conditions,
      medications: parsed.data.medications,
      allergies: parsed.data.allergies,
      vitals: parsed.data.vitals,
      language: parsed.data.language,
      stillUnsure: parsed.data.stillUnsure,
      wantsDoctor: parsed.data.wantsDoctor,
    },
  };

  const { data: brief, error: briefError } = await admin
    .from("briefs")
    .insert({
      user_id: userId,
      anon_session_id: parsed.data.anonSessionId,
      title: generated.output.brief_title,
      care_setting: generated.output.care_setting,
      department_bucket: generated.output.department_bucket,
      summary_json: summaryJson,
      confidence_notes: generated.output.confidence_notes,
      attachment_count: uploadRows.length,
      generated_by_model: generated.model,
    })
    .select("id, title, care_setting, department_bucket, created_at")
    .single();

  if (briefError || !brief) {
    return NextResponse.json({ error: briefError?.message ?? "Unable to create brief." }, { status: 500 });
  }

  if (uploadRows.length > 0) {
    await admin
      .from("uploads")
      .update({
        brief_id: brief.id,
        user_id: userId,
      })
      .in("id", uploadRows.map((item) => item.id));
  }

  await Promise.all([
    logBriefEvent(admin, {
      briefId: brief.id,
      actorType: userId ? "user" : "system",
      actorId: userId,
      eventType: "created",
      userAgent: request.headers.get("user-agent"),
    }),
    logAnalyticsEvent(admin, {
      eventName: "intake_completed",
      briefId: brief.id,
      userId,
      anonSessionId: parsed.data.anonSessionId,
      metadata: {
        careSetting: generated.output.care_setting,
      },
    }),
    logAnalyticsEvent(admin, {
      eventName: "brief_generated",
      briefId: brief.id,
      userId,
      anonSessionId: parsed.data.anonSessionId,
      metadata: {
        model: generated.model,
      },
    }),
  ]);

  return NextResponse.json({
    brief: {
      id: brief.id,
      title: brief.title,
      careSetting: brief.care_setting,
      departmentBucket: brief.department_bucket,
      summary: generated.output,
      createdAt: brief.created_at,
      model: generated.model,
      disclaimers: {
        notDiagnosis: mandatoryDisclaimers.notDiagnosis,
        emergency: mandatoryDisclaimers.erNow,
      },
      quickcheck: evaluateQuickcheckCta(generated.output.care_setting, {
        stillUnsure: parsed.data.stillUnsure,
        wantsDoctor: parsed.data.wantsDoctor,
        confidenceNotes: generated.output.confidence_notes,
      }),
    },
  });
}
