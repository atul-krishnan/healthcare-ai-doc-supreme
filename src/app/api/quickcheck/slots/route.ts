import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { canViewerAccessBrief, getViewerIdentity } from "@/lib/server/yourdoc/access";
import { ensureQuickcheckSlots, formatSlotForUi } from "@/lib/server/yourdoc/slots";

const querySchema = z.object({
  briefId: z.string().uuid(),
});

export async function GET(request: Request) {
  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Supabase admin not configured." }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    briefId: searchParams.get("briefId"),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "briefId is required." }, { status: 400 });
  }

  const identity = await getViewerIdentity(request);
  const canAccess = await canViewerAccessBrief(admin, parsed.data.briefId, identity);

  if (!canAccess) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await ensureQuickcheckSlots(admin);

  const now = new Date().toISOString();
  const horizon = new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString();

  const [slotResult, bookingResult, yourBookingResult] = await Promise.all([
    admin
      .from("quickcheck_slots")
      .select("id, start_time, end_time")
      .gte("start_time", now)
      .lte("start_time", horizon)
      .order("start_time", { ascending: true }),
    admin
      .from("quickcheck_bookings")
      .select("slot_id")
      .eq("status", "booked")
      .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    admin
      .from("quickcheck_bookings")
      .select("id, slot_id, status, created_at")
      .eq("brief_id", parsed.data.briefId)
      .in("status", ["booked", "rescheduled", "completed", "no_show"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (slotResult.error) {
    return NextResponse.json({ error: slotResult.error.message }, { status: 500 });
  }

  if (bookingResult.error) {
    return NextResponse.json({ error: bookingResult.error.message }, { status: 500 });
  }

  const bookedSlotIds = new Set((bookingResult.data ?? []).map((item) => item.slot_id));

  return NextResponse.json({
    slots: (slotResult.data ?? []).map((slot) => ({
      id: slot.id,
      startTime: slot.start_time,
      endTime: slot.end_time,
      display: formatSlotForUi(slot.start_time, slot.end_time),
      isBooked: bookedSlotIds.has(slot.id),
    })),
    yourBooking: yourBookingResult.data
      ? {
          id: yourBookingResult.data.id,
          slotId: yourBookingResult.data.slot_id,
          status: yourBookingResult.data.status,
          createdAt: yourBookingResult.data.created_at,
        }
      : null,
  });
}
