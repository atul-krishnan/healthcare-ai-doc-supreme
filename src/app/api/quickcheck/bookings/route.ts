import { NextResponse } from "next/server";
import { z } from "zod";
import { validateRequestOrigin } from "@/lib/server/csrf";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireApiUser } from "@/lib/server/request-context";
import { canViewerAccessBrief, getViewerIdentity } from "@/lib/server/yourdoc/access";
import { logAnalyticsEvent } from "@/lib/server/yourdoc/analytics";
import { pickAvailableDoctorForSlot } from "@/lib/server/yourdoc/doctors";

const bookingSchema = z.object({
  briefId: z.string().uuid(),
  slotId: z.string().uuid(),
  phone: z.string().trim().regex(/^[+0-9()\-\s]{8,20}$/),
  language: z.enum(["english", "hindi"]).default("english"),
  consentToCall: z.boolean(),
});

export async function GET() {
  const auth = await requireApiUser();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  const { data, error } = await auth.context.supabase
    .from("quickcheck_bookings")
    .select("id, brief_id, slot_id, phone, language, status, notes, created_at")
    .eq("user_id", auth.context.userId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ bookings: data ?? [] });
}

export async function POST(request: Request) {
  const originError = validateRequestOrigin(request);
  if (originError) {
    return originError;
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Supabase admin not configured." }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const parsed = bookingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid booking payload." }, { status: 400 });
  }

  if (!parsed.data.consentToCall) {
    return NextResponse.json({ error: "Consent is required to book Quick Check." }, { status: 400 });
  }

  const identity = await getViewerIdentity(request);
  const canAccess = await canViewerAccessBrief(admin, parsed.data.briefId, identity);

  if (!canAccess) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: slot, error: slotError } = await admin
    .from("quickcheck_slots")
    .select("id, start_time")
    .eq("id", parsed.data.slotId)
    .maybeSingle();

  if (slotError) {
    return NextResponse.json({ error: slotError.message }, { status: 500 });
  }

  if (!slot) {
    return NextResponse.json({ error: "Slot not found." }, { status: 404 });
  }

  if (new Date(slot.start_time).getTime() < Date.now()) {
    return NextResponse.json({ error: "This slot has already started." }, { status: 400 });
  }

  const { data: existingSlotBooking } = await admin
    .from("quickcheck_bookings")
    .select("id")
    .eq("slot_id", parsed.data.slotId)
    .eq("status", "booked")
    .maybeSingle();

  if (existingSlotBooking) {
    return NextResponse.json({ error: "Slot already booked. Please choose another slot." }, { status: 409 });
  }

  const assignedDoctorId = await pickAvailableDoctorForSlot(admin, slot.start_time);

  const { data: booking, error: bookingError } = await admin
    .from("quickcheck_bookings")
    .insert({
      slot_id: parsed.data.slotId,
      brief_id: parsed.data.briefId,
      user_id: identity.userId,
      anon_session_id: identity.anonSessionId,
      phone: parsed.data.phone,
      language: parsed.data.language,
      consent_to_call: true,
      status: "booked",
      doctor_id: assignedDoctorId,
    })
    .select("id, slot_id, brief_id, status, created_at")
    .single();

  if (bookingError || !booking) {
    return NextResponse.json({ error: bookingError?.message ?? "Unable to book slot." }, { status: 500 });
  }

  await admin.from("quickcheck_slots").update({ is_booked: true }).eq("id", parsed.data.slotId);

  await Promise.all([
    logAnalyticsEvent(admin, {
      eventName: "slot_selected",
      briefId: parsed.data.briefId,
      userId: identity.userId,
      anonSessionId: identity.anonSessionId,
      metadata: {
        slotId: parsed.data.slotId,
      },
    }),
    logAnalyticsEvent(admin, {
      eventName: "booking_confirmed",
      briefId: parsed.data.briefId,
      userId: identity.userId,
      anonSessionId: identity.anonSessionId,
      metadata: {
        bookingId: booking.id,
        assignedDoctorId,
      },
    }),
  ]);

  return NextResponse.json({ booking }, { status: 201 });
}
