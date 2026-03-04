import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/server/request-context";
import { getUserRole } from "@/lib/server/roles";
import { writeAuditEvent } from "@/lib/server/audit";
import { validateRequestOrigin } from "@/lib/server/csrf";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

const adminAssignSchema = z.object({
  doctorUserId: z.string().uuid(),
});

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

  const { id } = await params;

  if (role === "doctor") {
    const { data, error } = await auth.context.supabase
      .from("consultations")
      .update({
        doctor_id: auth.context.userId,
        status: "assigned",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .in("status", ["open", "assigned"])
      .is("doctor_id", null)
      .select("id, doctor_id, status, updated_at")
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Unable to assign this consultation. It may already be assigned." }, { status: 409 });
    }

    await writeAuditEvent(auth.context.supabase, {
      actorUserId: auth.context.userId,
      action: "consultation_assigned",
      resourceType: "consultation",
      resourceId: data.id,
      metadata: {
        assignedDoctorUserId: auth.context.userId,
      },
    });

    return NextResponse.json({ consultation: data });
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Supabase admin is not configured." }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const parsed = adminAssignSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "doctorUserId is required for admin assignment." }, { status: 400 });
  }

  const { data: doctorRow, error: doctorError } = await admin
    .from("doctors")
    .select("id, auth_user_id, active")
    .eq("auth_user_id", parsed.data.doctorUserId)
    .eq("active", true)
    .maybeSingle();

  if (doctorError) {
    return NextResponse.json({ error: doctorError.message }, { status: 500 });
  }

  if (!doctorRow) {
    return NextResponse.json({ error: "Selected doctor is not active." }, { status: 400 });
  }

  const { data, error } = await admin
    .from("consultations")
    .update({
      doctor_id: doctorRow.auth_user_id,
      status: "assigned",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .in("status", ["open", "assigned"])
    .select("id, doctor_id, status, updated_at")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Consultation not found." }, { status: 404 });
  }

  await writeAuditEvent(admin, {
    actorUserId: auth.context.userId,
    action: "consultation_assigned",
    resourceType: "consultation",
    resourceId: data.id,
    metadata: {
      assignedDoctorUserId: parsed.data.doctorUserId,
    },
  });

  return NextResponse.json({ consultation: data });
}
