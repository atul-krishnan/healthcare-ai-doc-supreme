import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/server/request-context";
import { getOrCreateDoctorRow } from "@/lib/server/yourdoc/doctors";
import { logBriefEvent } from "@/lib/server/yourdoc/brief-events";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

const bucket = "brief-files";

export async function GET(request: Request, { params }: Params) {
  const auth = await requireApiUser();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }
  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Supabase admin is not configured." }, { status: 503 });
  }

  const doctor = await getOrCreateDoctorRow(auth.context.supabase, auth.context.userId);
  if (!doctor) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const { data: booking, error: bookingError } = await auth.context.supabase
    .from("quickcheck_bookings")
    .select("id, brief_id, slot_id, doctor_id, status, phone, language, notes")
    .eq("id", id)
    .maybeSingle();

  if (bookingError) {
    return NextResponse.json({ error: bookingError.message }, { status: 500 });
  }

  if (!booking) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  if (booking.doctor_id && booking.doctor_id !== doctor.id) {
    return NextResponse.json({ error: "Booking is assigned to another doctor." }, { status: 403 });
  }

  if (!booking.doctor_id) {
    const { error: assignError } = await auth.context.supabase
      .from("quickcheck_bookings")
      .update({ doctor_id: doctor.id, updated_at: new Date().toISOString() })
      .eq("id", booking.id)
      .is("doctor_id", null);

    if (assignError) {
      return NextResponse.json({ error: assignError.message }, { status: 409 });
    }
  }

  const { data: brief, error: briefError } = await auth.context.supabase
    .from("briefs")
    .select("id, title, care_setting, department_bucket, summary_json, created_at")
    .eq("id", booking.brief_id)
    .maybeSingle();

  if (briefError) {
    return NextResponse.json({ error: briefError.message }, { status: 500 });
  }

  if (!brief) {
    return NextResponse.json({ error: "Brief not found." }, { status: 404 });
  }

  const { data: uploads } = await auth.context.supabase
    .from("uploads")
    .select("id, storage_path, mime_type, original_filename")
    .eq("brief_id", brief.id)
    .order("created_at", { ascending: true });

  const attachments = await Promise.all(
    (uploads ?? []).map(async (item) => {
      const signed = await admin.storage.from(bucket).createSignedUrl(item.storage_path, 30 * 60);
      return {
        id: item.id,
        fileName: item.original_filename ?? "attachment",
        mimeType: item.mime_type,
        downloadUrl: signed.data?.signedUrl ?? null,
      };
    }),
  );

  await Promise.all([
    auth.context.supabase.from("doctor_access_log").insert({
      doctor_id: doctor.id,
      brief_id: brief.id,
      action: "viewed_brief",
    }),
    logBriefEvent(auth.context.supabase, {
      briefId: brief.id,
      actorType: "doctor",
      actorId: auth.context.userId,
      eventType: "viewed",
      userAgent: request.headers.get("user-agent"),
    }),
  ]);

  return NextResponse.json({
    booking: {
      id: booking.id,
      status: booking.status,
      language: booking.language,
      phone: booking.phone,
      notes: booking.notes,
      brief,
      attachments,
    },
  });
}
