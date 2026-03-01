import { NextResponse } from "next/server";
import { validateRequestOrigin } from "@/lib/server/csrf";
import { requireApiUser } from "@/lib/server/request-context";
import { getOrCreateDoctorRow } from "@/lib/server/yourdoc/doctors";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, { params }: Params) {
  const originError = validateRequestOrigin(request);
  if (originError) {
    return originError;
  }

  const auth = await requireApiUser();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  const doctor = await getOrCreateDoctorRow(auth.context.supabase, auth.context.userId);
  if (!doctor) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const { data, error } = await auth.context.supabase
    .from("quickcheck_bookings")
    .update({
      doctor_id: doctor.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .or(`doctor_id.is.null,doctor_id.eq.${doctor.id}`)
    .select("id, doctor_id, status")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Unable to assign this booking." }, { status: 409 });
  }

  return NextResponse.json({ booking: data });
}
