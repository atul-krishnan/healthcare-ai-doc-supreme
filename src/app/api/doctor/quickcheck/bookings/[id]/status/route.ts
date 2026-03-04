import { NextResponse } from "next/server";
import { z } from "zod";
import { validateRequestOrigin } from "@/lib/server/csrf";
import { requireApiUser } from "@/lib/server/request-context";
import { getUserRole } from "@/lib/server/roles";
import { getActiveDoctorRow } from "@/lib/server/yourdoc/doctors";
import { logAnalyticsEvent } from "@/lib/server/yourdoc/analytics";
import { careSettingValues, departmentBucketValues } from "@/lib/yourdoc/types";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

const updateSchema = z.object({
  action: z.enum(["start_call", "complete_call", "mark_no_show"]),
  notes: z.string().trim().max(4000).optional(),
  outcomeCareSetting: z.enum(careSettingValues).optional(),
  outcomeDepartmentBucket: z.enum(departmentBucketValues).optional(),
});

export async function PATCH(request: Request, { params }: Params) {
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

  const doctor = role === "doctor" ? await getActiveDoctorRow(auth.context.supabase, auth.context.userId) : null;
  if (role === "doctor" && !doctor) {
    return NextResponse.json({ error: "Doctor onboarding is pending approval or disabled." }, { status: 403 });
  }

  const admin = role === "admin" ? createSupabaseAdminClient() : null;
  const queryClient = admin ?? auth.context.supabase;

  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const { id } = await params;

  const { data: booking, error: bookingError } = await queryClient
    .from("quickcheck_bookings")
    .select("id, brief_id, slot_id, doctor_id, status")
    .eq("id", id)
    .maybeSingle();

  if (bookingError) {
    return NextResponse.json({ error: bookingError.message }, { status: 500 });
  }

  if (!booking) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  if (role === "doctor" && booking.doctor_id !== doctor!.id) {
    return NextResponse.json({ error: "This booking is not assigned to you." }, { status: 403 });
  }

  if (role === "admin" && !booking.doctor_id) {
    return NextResponse.json({ error: "Assign this booking to a doctor before changing status." }, { status: 400 });
  }

  const actorDoctorId = role === "doctor" ? doctor!.id : booking.doctor_id;
  let actorDoctorName = role === "doctor" ? doctor!.name : "Admin";

  if (role === "admin" && booking.doctor_id) {
    const { data: assignedDoctor } = await queryClient
      .from("doctors")
      .select("name")
      .eq("id", booking.doctor_id)
      .maybeSingle();
    actorDoctorName = assignedDoctor?.name ?? actorDoctorName;
  }

  if (parsed.data.action === "start_call") {
    const { data: slot } = await queryClient
      .from("quickcheck_slots")
      .select("start_time")
      .eq("id", booking.slot_id)
      .maybeSingle();

    const delayMs = slot ? Date.now() - new Date(slot.start_time).getTime() : 0;

    await queryClient
      .from("quickcheck_bookings")
      .update({
        doctor_id: actorDoctorId,
        notes: parsed.data.notes ?? "Doctor started call.",
        updated_at: new Date().toISOString(),
      })
      .eq("id", booking.id);

    await logAnalyticsEvent(auth.context.supabase, {
      eventName: "doctor_call_started",
      briefId: booking.brief_id,
      userId: auth.context.userId,
      metadata: {
        bookingId: booking.id,
      },
    });

    if (delayMs > 10 * 60 * 1000) {
      await Promise.all([
        auth.context.supabase.from("support_tickets").insert({
          booking_id: booking.id,
          ticket_type: "doctor_delay_credit_refund",
          notes: "Doctor delay exceeded 10 minutes.",
          metadata: {
            delayMinutes: Math.round(delayMs / 60000),
          },
        }),
        logAnalyticsEvent(auth.context.supabase, {
          eventName: "refund_requested/support_ticket",
          briefId: booking.brief_id,
          userId: auth.context.userId,
          metadata: {
            bookingId: booking.id,
            reason: "doctor_delay_gt_10_minutes",
          },
        }),
      ]);
    }

    return NextResponse.json({ ok: true });
  }

  if (parsed.data.action === "mark_no_show") {
    await queryClient
      .from("quickcheck_bookings")
      .update({
        status: "no_show",
        notes: parsed.data.notes ?? "Marked as no-show by doctor.",
        doctor_id: actorDoctorId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", booking.id);

    await queryClient.from("quickcheck_slots").update({ is_booked: false }).eq("id", booking.slot_id);

    return NextResponse.json({ ok: true });
  }

  if (!parsed.data.outcomeCareSetting || !parsed.data.outcomeDepartmentBucket) {
    return NextResponse.json({ error: "Outcome care setting and department are required." }, { status: 400 });
  }

  const { data: brief } = await queryClient
    .from("briefs")
    .select("summary_json")
    .eq("id", booking.brief_id)
    .maybeSingle();

  const currentSummary =
    brief?.summary_json && typeof brief.summary_json === "object" && !Array.isArray(brief.summary_json)
      ? brief.summary_json
      : {};

  const updatedSummary = {
    ...currentSummary,
    doctor_review_outcome: {
      care_setting: parsed.data.outcomeCareSetting,
      department_bucket: parsed.data.outcomeDepartmentBucket,
      notes: parsed.data.notes ?? "",
      reviewed_at: new Date().toISOString(),
      reviewer: actorDoctorName,
    },
  };

  await Promise.all([
    queryClient
      .from("quickcheck_bookings")
      .update({
        status: "completed",
        doctor_id: actorDoctorId,
        notes: parsed.data.notes ?? "Completed",
        updated_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      })
      .eq("id", booking.id),
    queryClient
      .from("briefs")
      .update({
        care_setting: parsed.data.outcomeCareSetting,
        department_bucket: parsed.data.outcomeDepartmentBucket,
        summary_json: updatedSummary,
        updated_at: new Date().toISOString(),
      })
      .eq("id", booking.brief_id),
    logAnalyticsEvent(auth.context.supabase, {
      eventName: "doctor_call_completed",
      briefId: booking.brief_id,
      userId: auth.context.userId,
      metadata: {
        bookingId: booking.id,
      },
    }),
    logAnalyticsEvent(auth.context.supabase, {
      eventName: "outcome_selected",
      briefId: booking.brief_id,
      userId: auth.context.userId,
      metadata: {
        bookingId: booking.id,
        careSetting: parsed.data.outcomeCareSetting,
        department: parsed.data.outcomeDepartmentBucket,
      },
    }),
  ]);

  if (actorDoctorId) {
    await auth.context.supabase.from("doctor_access_log").insert({
      doctor_id: actorDoctorId,
      brief_id: booking.brief_id,
      action: "changed_outcome",
    });
  }

  await queryClient.from("quickcheck_slots").update({ is_booked: false }).eq("id", booking.slot_id);

  return NextResponse.json({ ok: true });
}
