import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/server/request-context";
import { getUserRole } from "@/lib/server/roles";
import { getActiveDoctorRow } from "@/lib/server/yourdoc/doctors";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logBriefEvent } from "@/lib/server/yourdoc/brief-events";

type Params = {
  params: Promise<{
    id: string;
    uploadId: string;
  }>;
};

const bucket = "brief-files";

export async function GET(request: Request, { params }: Params) {
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

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Supabase admin is not configured." }, { status: 503 });
  }

  const { id, uploadId } = await params;

  const { data: booking, error: bookingError } = await admin
    .from("quickcheck_bookings")
    .select("id, brief_id, doctor_id")
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

  const { data: upload, error: uploadError } = await admin
    .from("uploads")
    .select("id, brief_id, storage_path")
    .eq("id", uploadId)
    .maybeSingle();

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  if (!upload || upload.brief_id !== booking.brief_id) {
    return NextResponse.json({ error: "Attachment not found for this booking." }, { status: 404 });
  }

  const signed = await admin.storage.from(bucket).createSignedUrl(upload.storage_path, 10 * 60);
  if (signed.error || !signed.data?.signedUrl) {
    return NextResponse.json({ error: signed.error?.message ?? "Unable to prepare download." }, { status: 500 });
  }

  const logTasks: Array<Promise<unknown>> = [
    logBriefEvent(auth.context.supabase, {
      briefId: booking.brief_id,
      actorType: role === "doctor" ? "doctor" : "user",
      actorId: auth.context.userId,
      eventType: "downloaded",
      userAgent: request.headers.get("user-agent"),
    }),
  ];

  if (role === "doctor" && doctor) {
    logTasks.push(
      (async () => {
        await auth.context.supabase.from("doctor_access_log").insert({
          doctor_id: doctor.id,
          brief_id: booking.brief_id,
          action: "downloaded_attachment",
        });
      })(),
    );
  }

  await Promise.all(logTasks);

  return NextResponse.redirect(signed.data.signedUrl, { status: 302 });
}
