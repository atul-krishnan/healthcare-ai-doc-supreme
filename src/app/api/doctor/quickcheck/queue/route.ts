import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/server/request-context";
import { getOrCreateDoctorRow } from "@/lib/server/yourdoc/doctors";

export async function GET() {
  const auth = await requireApiUser();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  const doctor = await getOrCreateDoctorRow(auth.context.supabase, auth.context.userId);
  if (!doctor) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const now = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

  const { data: bookings, error } = await auth.context.supabase
    .from("quickcheck_bookings")
    .select("id, brief_id, slot_id, status, language, phone, doctor_id, created_at")
    .in("status", ["booked", "rescheduled", "completed", "no_show"])
    .gte("created_at", now)
    .or(`doctor_id.is.null,doctor_id.eq.${doctor.id}`)
    .order("created_at", { ascending: false })
    .limit(150);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const slotIds = (bookings ?? []).map((item) => item.slot_id);
  const { data: slots } = slotIds.length
    ? await auth.context.supabase
        .from("quickcheck_slots")
        .select("id, start_time, end_time")
        .in("id", slotIds)
    : { data: [] };

  const slotById = new Map((slots ?? []).map((slot) => [slot.id, slot]));

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
    })),
    doctor: {
      id: doctor.id,
      name: doctor.name,
      role: doctor.role,
    },
  });
}
