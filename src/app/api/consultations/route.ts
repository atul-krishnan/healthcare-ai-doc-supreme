import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/server/request-context";
import { getUserRole } from "@/lib/server/roles";
import { writeAuditEvent } from "@/lib/server/audit";
import { validateRequestOrigin } from "@/lib/server/csrf";

const createConsultationSchema = z.object({
  chiefComplaint: z.string().min(10).max(5000),
  priority: z.enum(["normal", "urgent", "critical"]).default("normal"),
  triageSessionId: z.string().uuid().optional(),
  firstMessage: z.string().min(1).max(5000).optional(),
});

export async function GET() {
  const auth = await requireApiUser();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  const role = await getUserRole(auth.context.supabase, auth.context.userId);

  const baseQuery = auth.context.supabase
    .from("consultations")
    .select("id, patient_id, doctor_id, status, priority, chief_complaint, clinical_summary, resolution_notes, created_at, updated_at")
    .order("updated_at", { ascending: false })
    .limit(100);

  let query = baseQuery;

  if (role === "patient") {
    query = baseQuery.eq("patient_id", auth.context.userId);
  }

  if (role === "doctor" || role === "admin") {
    query = baseQuery.or(`doctor_id.eq.${auth.context.userId},doctor_id.is.null`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ consultations: data ?? [], role });
}

export async function POST(request: Request) {
  const originError = validateRequestOrigin(request);
  if (originError) {
    return originError;
  }

  const auth = await requireApiUser();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  const role = await getUserRole(auth.context.supabase, auth.context.userId);

  if (role !== "patient") {
    return NextResponse.json({ error: "Only patients can create consultations." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createConsultationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid consultation payload." }, { status: 400 });
  }

  const { data: consultation, error: createError } = await auth.context.supabase
    .from("consultations")
    .insert({
      patient_id: auth.context.userId,
      priority: parsed.data.priority,
      chief_complaint: parsed.data.chiefComplaint,
      triage_session_id: parsed.data.triageSessionId ?? null,
      status: "open",
    })
    .select("id, status, priority, chief_complaint, created_at")
    .single();

  if (createError || !consultation) {
    return NextResponse.json({ error: createError?.message ?? "Unable to create consultation." }, { status: 500 });
  }

  if (parsed.data.firstMessage) {
    await auth.context.supabase.from("consultation_messages").insert({
      consultation_id: consultation.id,
      sender_id: auth.context.userId,
      sender_role: "patient",
      content: parsed.data.firstMessage,
    });
  }

  await writeAuditEvent(auth.context.supabase, {
    actorUserId: auth.context.userId,
    action: "consultation_created",
    resourceType: "consultation",
    resourceId: consultation.id,
    metadata: {
      priority: consultation.priority,
    },
  });

  return NextResponse.json({ consultation }, { status: 201 });
}
