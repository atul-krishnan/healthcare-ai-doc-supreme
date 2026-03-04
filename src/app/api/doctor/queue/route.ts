import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/server/request-context";
import { getUserRole } from "@/lib/server/roles";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getActiveDoctorRow } from "@/lib/server/yourdoc/doctors";

export async function GET() {
  const auth = await requireApiUser();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  const role = await getUserRole(auth.context.supabase, auth.context.userId);

  if (role !== "doctor" && role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (role === "doctor") {
    const doctor = await getActiveDoctorRow(auth.context.supabase, auth.context.userId);
    if (!doctor) {
      return NextResponse.json({ error: "Doctor onboarding is pending approval or disabled." }, { status: 403 });
    }
  }

  const admin = role === "admin" ? createSupabaseAdminClient() : null;
  const queryClient = admin ?? auth.context.supabase;
  const baseQuery = queryClient
    .from("consultations")
    .select("id, patient_id, doctor_id, status, priority, chief_complaint, created_at, updated_at")
    .in("status", ["open", "assigned", "in_progress"])
    .order("updated_at", { ascending: false })
    .limit(100);

  const query = role === "doctor" ? baseQuery.eq("doctor_id", auth.context.userId) : baseQuery;
  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const assignableDoctorsResult =
    role === "admin"
      ? await queryClient
          .from("doctors")
          .select("id, auth_user_id, name, specialization, availability_enabled")
          .eq("active", true)
          .order("name", { ascending: true })
      : { data: [], error: null };

  if (assignableDoctorsResult.error) {
    return NextResponse.json({ error: assignableDoctorsResult.error.message }, { status: 500 });
  }

  return NextResponse.json({
    queue: data ?? [],
    role,
    assignableDoctors: (assignableDoctorsResult.data ?? []).map((item) => ({
      doctorId: item.id,
      doctorUserId: item.auth_user_id,
      name: item.name,
      specialization: item.specialization,
      availabilityEnabled: item.availability_enabled,
    })),
  });
}
