import { NextResponse } from "next/server";
import { z } from "zod";
import { validateRequestOrigin } from "@/lib/server/csrf";
import { requireApiUser } from "@/lib/server/request-context";
import { getUserRole } from "@/lib/server/roles";
import { getActiveDoctorRow } from "@/lib/server/yourdoc/doctors";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

const adminAssignSchema = z.object({
  doctorId: z.string().uuid(),
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
    const doctor = await getActiveDoctorRow(auth.context.supabase, auth.context.userId);
    if (!doctor) {
      return NextResponse.json({ error: "Doctor onboarding is pending approval or disabled." }, { status: 403 });
    }

    const { data, error } = await auth.context.supabase
      .from("quickcheck_bookings")
      .update({
        doctor_id: doctor.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .in("status", ["booked", "rescheduled"])
      .is("doctor_id", null)
      .select("id, doctor_id, status")
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Unable to assign this booking. It may already be assigned." }, { status: 409 });
    }

    return NextResponse.json({ booking: data });
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Supabase admin is not configured." }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const parsed = adminAssignSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "doctorId is required for admin assignment." }, { status: 400 });
  }

  const { data: targetDoctor, error: targetError } = await admin
    .from("doctors")
    .select("id, active")
    .eq("id", parsed.data.doctorId)
    .maybeSingle();

  if (targetError) {
    return NextResponse.json({ error: targetError.message }, { status: 500 });
  }

  if (!targetDoctor || !targetDoctor.active) {
    return NextResponse.json({ error: "Target doctor is not active." }, { status: 400 });
  }

  const { data, error } = await admin
    .from("quickcheck_bookings")
    .update({
      doctor_id: targetDoctor.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .in("status", ["booked", "rescheduled"])
    .select("id, doctor_id, status")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Unable to assign this booking." }, { status: 404 });
  }

  return NextResponse.json({ booking: data });
}
