import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/server/request-context";
import { getUserRole } from "@/lib/server/roles";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getActiveDoctorRow, getDoctorRowByAuthUserId } from "@/lib/server/yourdoc/doctors";

function formatPatientAlias(fullName: string | null | undefined, userId: string | null, anonSessionId: string | null) {
  const trimmed = fullName?.trim() ?? "";
  if (trimmed) {
    return `${trimmed.charAt(0).toUpperCase()}.`;
  }

  if (userId) {
    return `P-${userId.slice(0, 4)}`;
  }

  if (anonSessionId) {
    return `Guest-${anonSessionId.slice(0, 4)}`;
  }

  return "Patient";
}

export async function GET() {
  const auth = await requireApiUser();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  const role = await getUserRole(auth.context.supabase, auth.context.userId);
  if (role !== "doctor" && role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const doctor =
    role === "doctor"
      ? await getActiveDoctorRow(auth.context.supabase, auth.context.userId)
      : await getDoctorRowByAuthUserId(auth.context.supabase, auth.context.userId);

  if (role === "doctor" && !doctor) {
    return NextResponse.json({ error: "Doctor onboarding is pending approval or disabled." }, { status: 403 });
  }

  const admin = createSupabaseAdminClient();
  const queryClient = admin ?? auth.context.supabase;
  const now = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

  const baseQuery = queryClient
    .from("quickcheck_bookings")
    .select("id, brief_id, slot_id, status, language, phone, doctor_id, user_id, anon_session_id, created_at")
    .in("status", ["booked", "rescheduled", "completed", "no_show"])
    .gte("created_at", now)
    .order("created_at", { ascending: false })
    .limit(150);

  const bookingQuery = role === "admin" ? baseQuery : baseQuery.eq("doctor_id", doctor!.id);
  const { data: bookings, error } = await bookingQuery;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const slotIds = (bookings ?? []).map((item) => item.slot_id);
  const briefIds = (bookings ?? []).map((item) => item.brief_id);

  const [slotResult, briefResult] = await Promise.all([
    slotIds.length
      ? queryClient
          .from("quickcheck_slots")
          .select("id, start_time, end_time")
          .in("id", slotIds)
      : Promise.resolve({ data: [], error: null }),
    briefIds.length
      ? queryClient
          .from("briefs")
          .select("id, user_id, care_setting, department_bucket")
          .in("id", briefIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (slotResult.error) {
    return NextResponse.json({ error: slotResult.error.message }, { status: 500 });
  }

  if (briefResult.error) {
    return NextResponse.json({ error: briefResult.error.message }, { status: 500 });
  }

  const profileIds = new Set<string>();
  for (const booking of bookings ?? []) {
    if (booking.user_id) {
      profileIds.add(booking.user_id);
    }
  }
  for (const brief of briefResult.data ?? []) {
    if (brief.user_id) {
      profileIds.add(brief.user_id);
    }
  }

  let profileById = new Map<string, { full_name: string | null }>();
  if (profileIds.size > 0) {
    const { data: profiles } = await queryClient
      .from("profiles")
      .select("id, full_name")
      .in("id", [...profileIds]);
    profileById = new Map((profiles ?? []).map((profile) => [profile.id, { full_name: profile.full_name }]));
  }

  const assignableDoctorsResult =
    role === "admin"
      ? await queryClient
          .from("doctors")
          .select("id, name, specialization, availability_enabled")
          .eq("active", true)
          .order("name", { ascending: true })
      : { data: [], error: null };

  if (assignableDoctorsResult.error) {
    return NextResponse.json({ error: assignableDoctorsResult.error.message }, { status: 500 });
  }

  const slotById = new Map((slotResult.data ?? []).map((slot) => [slot.id, slot]));
  const briefById = new Map((briefResult.data ?? []).map((brief) => [brief.id, brief]));

  return NextResponse.json({
    queue: (bookings ?? []).map((item) => ({
      id: item.id,
      briefId: item.brief_id,
      slotId: item.slot_id,
      status: item.status,
      language: item.language,
      phoneMasked: item.phone ? `xxxxxx${item.phone.slice(-4)}` : "",
      doctorId: item.doctor_id,
      startTime: slotById.get(item.slot_id)?.start_time ?? null,
      endTime: slotById.get(item.slot_id)?.end_time ?? null,
      createdAt: item.created_at,
      careSetting: briefById.get(item.brief_id)?.care_setting ?? null,
      departmentBucket: briefById.get(item.brief_id)?.department_bucket ?? null,
      patientAlias: formatPatientAlias(
        profileById.get(item.user_id ?? briefById.get(item.brief_id)?.user_id ?? "")?.full_name,
        item.user_id ?? briefById.get(item.brief_id)?.user_id ?? null,
        item.anon_session_id ?? null,
      ),
    })),
    doctor: doctor
      ? {
          id: doctor.id,
          name: doctor.name,
          role: doctor.role,
          availabilityEnabled: doctor.availability_enabled,
        }
      : null,
    role,
    assignableDoctors: (assignableDoctorsResult.data ?? []).map((item) => ({
      id: item.id,
      name: item.name,
      specialization: item.specialization,
      availabilityEnabled: item.availability_enabled,
    })),
  });
}
