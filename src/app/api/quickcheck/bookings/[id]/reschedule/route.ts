import { NextResponse } from "next/server";
import { z } from "zod";
import { validateRequestOrigin } from "@/lib/server/csrf";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getViewerIdentity } from "@/lib/server/yourdoc/access";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

const rescheduleSchema = z.object({
  newSlotId: z.string().uuid(),
});

export async function POST(request: Request, { params }: Params) {
  const originError = validateRequestOrigin(request);
  if (originError) {
    return originError;
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Supabase admin not configured." }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const parsed = rescheduleSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const { id } = await params;
  const identity = await getViewerIdentity(request);

  const { data: booking, error: bookingError } = await admin
    .from("quickcheck_bookings")
    .select("id, slot_id, brief_id, user_id, anon_session_id, phone, language, consent_to_call, reschedule_count, status")
    .eq("id", id)
    .maybeSingle();

  if (bookingError) {
    return NextResponse.json({ error: bookingError.message }, { status: 500 });
  }

  if (!booking) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  const isOwner =
    (identity.userId && booking.user_id === identity.userId) ||
    (!booking.user_id && identity.anonSessionId && booking.anon_session_id === identity.anonSessionId);

  if (!isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (booking.reschedule_count >= 1) {
    return NextResponse.json({ error: "You can reschedule only once for this booking." }, { status: 400 });
  }

  if (booking.status !== "booked" && booking.status !== "rescheduled") {
    return NextResponse.json({ error: "Only active bookings can be rescheduled." }, { status: 400 });
  }

  const { data: originalSlot } = await admin
    .from("quickcheck_slots")
    .select("start_time")
    .eq("id", booking.slot_id)
    .maybeSingle();

  if (!originalSlot) {
    return NextResponse.json({ error: "Original slot not found." }, { status: 404 });
  }

  const graceCutoff = new Date(originalSlot.start_time).getTime() + 5 * 60 * 1000;
  if (Date.now() < graceCutoff) {
    return NextResponse.json({ error: "Reschedule is available after a 5-minute grace period." }, { status: 400 });
  }

  const { data: targetSlot } = await admin
    .from("quickcheck_slots")
    .select("id, start_time")
    .eq("id", parsed.data.newSlotId)
    .maybeSingle();

  if (!targetSlot) {
    return NextResponse.json({ error: "Target slot not found." }, { status: 404 });
  }

  if (new Date(targetSlot.start_time).getTime() < Date.now()) {
    return NextResponse.json({ error: "Cannot reschedule to a past slot." }, { status: 400 });
  }

  const { data: targetTaken } = await admin
    .from("quickcheck_bookings")
    .select("id")
    .eq("slot_id", targetSlot.id)
    .eq("status", "booked")
    .maybeSingle();

  if (targetTaken) {
    return NextResponse.json({ error: "Target slot is already booked." }, { status: 409 });
  }

  const { error: oldBookingError } = await admin
    .from("quickcheck_bookings")
    .update({
      status: "rescheduled",
      reschedule_count: booking.reschedule_count + 1,
      updated_at: new Date().toISOString(),
      notes: "User rescheduled after grace period.",
    })
    .eq("id", booking.id);

  if (oldBookingError) {
    return NextResponse.json({ error: oldBookingError.message }, { status: 500 });
  }

  const { data: newBooking, error: newBookingError } = await admin
    .from("quickcheck_bookings")
    .insert({
      slot_id: targetSlot.id,
      brief_id: booking.brief_id,
      user_id: booking.user_id,
      anon_session_id: booking.anon_session_id,
      phone: booking.phone,
      language: booking.language,
      consent_to_call: booking.consent_to_call,
      status: "booked",
      reschedule_count: booking.reschedule_count + 1,
    })
    .select("id, slot_id, status, created_at")
    .single();

  if (newBookingError || !newBooking) {
    return NextResponse.json({ error: newBookingError?.message ?? "Unable to create rescheduled booking." }, { status: 500 });
  }

  await Promise.all([
    admin.from("quickcheck_slots").update({ is_booked: false }).eq("id", booking.slot_id),
    admin.from("quickcheck_slots").update({ is_booked: true }).eq("id", targetSlot.id),
  ]);

  return NextResponse.json({ booking: newBooking });
}
