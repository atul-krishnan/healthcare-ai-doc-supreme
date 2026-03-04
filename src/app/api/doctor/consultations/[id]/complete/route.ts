import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/server/request-context";
import { getUserRole } from "@/lib/server/roles";
import { writeAuditEvent } from "@/lib/server/audit";
import { validateRequestOrigin } from "@/lib/server/csrf";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const completeConsultationSchema = z.object({
  clinicalSummary: z.string().min(10).max(4000),
  resolutionNotes: z.string().min(10).max(4000),
  prescriptions: z
    .array(
      z.object({
        medication: z.string().min(2).max(200),
        dosage: z.string().min(2).max(200),
        instructions: z.string().min(2).max(1000),
      }),
    )
    .max(20)
    .default([]),
});

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, { params }: Params) {
  const originError = validateRequestOrigin(request);
  if (originError) {
    return originError;
  }

  const auth = await requireApiUser();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  const role = await getUserRole(auth.context.supabase, auth.context.userId);

  if (role !== "doctor" && role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = role === "admin" ? createSupabaseAdminClient() : null;
  const queryClient = admin ?? auth.context.supabase;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = completeConsultationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid completion payload." }, { status: 400 });
  }

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

  if (role === "admin" && !existing.doctor_id) {
    return NextResponse.json({ error: "Assign a doctor before completing this consultation." }, { status: 400 });
  }

  const actorDoctorUserId = role === "doctor" ? auth.context.userId : existing.doctor_id;

  const { data: consultation, error: consultationError } = await queryClient
    .from("consultations")
    .update({
      doctor_id: actorDoctorUserId,
      status: "completed",
      clinical_summary: parsed.data.clinicalSummary,
      resolution_notes: parsed.data.resolutionNotes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("id, patient_id, doctor_id, status, clinical_summary, resolution_notes, updated_at")
    .maybeSingle();

  if (consultationError) {
    return NextResponse.json({ error: consultationError.message }, { status: 500 });
  }

  if (!consultation) {
    return NextResponse.json({ error: "Consultation not found." }, { status: 404 });
  }

  if (parsed.data.prescriptions.length > 0 && actorDoctorUserId) {
    const rows = parsed.data.prescriptions.map((item) => ({
      consultation_id: consultation.id,
      patient_id: consultation.patient_id,
      doctor_id: actorDoctorUserId,
      medication: item.medication,
      dosage: item.dosage,
      instructions: item.instructions,
      status: "issued" as const,
    }));

    const { error: prescriptionError } = await queryClient.from("prescriptions").insert(rows);

    if (prescriptionError) {
      return NextResponse.json({ error: prescriptionError.message }, { status: 500 });
    }
  }

  await writeAuditEvent(queryClient, {
    actorUserId: auth.context.userId,
    action: "consultation_completed",
    resourceType: "consultation",
    resourceId: consultation.id,
    metadata: {
      prescriptionCount: parsed.data.prescriptions.length,
      actorRole: role,
      linkedDoctorUserId: actorDoctorUserId,
    },
  });

  return NextResponse.json({ consultation });
}
