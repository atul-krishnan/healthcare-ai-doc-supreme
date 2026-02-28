import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/server/request-context";
import { getUserRole } from "@/lib/server/roles";
import { writeAuditEvent } from "@/lib/server/audit";
import { validateRequestOrigin } from "@/lib/server/csrf";

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

  if (role === "patient" && parsed.data.status !== "cancelled") {
    return NextResponse.json({ error: "Patients can only cancel consultations." }, { status: 403 });
  }

  const updatePayload: {
    status: "assigned" | "in_progress" | "completed" | "cancelled";
    updated_at: string;
    doctor_id?: string;
    clinical_summary?: string;
    resolution_notes?: string;
  } = {
    status: parsed.data.status,
    updated_at: new Date().toISOString(),
  };

  if (role === "doctor" || role === "admin") {
    updatePayload.doctor_id = auth.context.userId;

    if (parsed.data.clinicalSummary) {
      updatePayload.clinical_summary = parsed.data.clinicalSummary;
    }

    if (parsed.data.resolutionNotes) {
      updatePayload.resolution_notes = parsed.data.resolutionNotes;
    }
  }

  const { data, error } = await auth.context.supabase
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
      status: data.status,
    },
  });

  return NextResponse.json({ consultation: data });
}
