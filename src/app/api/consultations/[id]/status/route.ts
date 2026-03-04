import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/server/request-context";
import { getUserRole } from "@/lib/server/roles";
import { writeAuditEvent } from "@/lib/server/audit";
import { validateRequestOrigin } from "@/lib/server/csrf";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const updateStatusSchema = z.object({
  status: z.enum(["assigned", "in_progress", "completed", "cancelled"]),
  clinicalSummary: z.string().max(4000).optional(),
  resolutionNotes: z.string().max(4000).optional(),
});

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, { params }: Params) {
  const originError = validateRequestOrigin(request);
  if (originError) {
    return originError;
  }

  const auth = await requireApiUser();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = updateStatusSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status payload." }, { status: 400 });
  }

  const role = await getUserRole(auth.context.supabase, auth.context.userId);
  if (role !== "patient" && role !== "doctor" && role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (role === "patient" && parsed.data.status !== "cancelled") {
    return NextResponse.json({ error: "Patients can only cancel consultations." }, { status: 403 });
  }

  const admin = role === "admin" ? createSupabaseAdminClient() : null;
  if (role === "admin" && !admin) {
    return NextResponse.json({ error: "Supabase admin is not configured." }, { status: 503 });
  }

  const queryClient = admin ?? auth.context.supabase;

  const { data: existing, error: existingError } = await queryClient
    .from("consultations")
    .select("id, patient_id, doctor_id, status")
    .eq("id", id)
    .maybeSingle();

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 500 });
  }

  if (!existing) {
    return NextResponse.json({ error: "Consultation not found." }, { status: 404 });
  }

  if (role === "doctor" && existing.doctor_id !== auth.context.userId) {
    return NextResponse.json({ error: "This consultation is not assigned to you." }, { status: 403 });
  }

  if (role === "admin" && parsed.data.status !== "cancelled" && !existing.doctor_id) {
    return NextResponse.json(
      { error: "Assign a doctor before moving this consultation beyond open state." },
      { status: 409 },
    );
  }

  const updatePayload: {
    status: "assigned" | "in_progress" | "completed" | "cancelled";
    updated_at: string;
    clinical_summary?: string;
    resolution_notes?: string;
  } = {
    status: parsed.data.status,
    updated_at: new Date().toISOString(),
  };

  if ((role === "doctor" || role === "admin") && parsed.data.clinicalSummary) {
    updatePayload.clinical_summary = parsed.data.clinicalSummary;
  }

  if ((role === "doctor" || role === "admin") && parsed.data.resolutionNotes) {
    updatePayload.resolution_notes = parsed.data.resolutionNotes;
  }

  const { data, error } = await queryClient
    .from("consultations")
    .update(updatePayload)
    .eq("id", id)
    .select("id, status, doctor_id, clinical_summary, resolution_notes, updated_at")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Consultation not found." }, { status: 404 });
  }

  await writeAuditEvent(auth.context.supabase, {
    actorUserId: auth.context.userId,
    action: "consultation_status_updated",
    resourceType: "consultation",
    resourceId: data.id,
    metadata: {
      actorRole: role,
      status: data.status,
    },
  });

  return NextResponse.json({ consultation: data });
}
