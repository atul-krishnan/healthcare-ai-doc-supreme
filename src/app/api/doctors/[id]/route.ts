import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/server/request-context";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type Params = {
  params: Promise<{ id: string }>;
};

function parseTimeToMinutes(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const [hour, minute] = value.split(":").map(Number);
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) {
    return null;
  }

  return hour * 60 + minute;
}

function computeEveningBadge(start: string | null, end: string | null) {
  const startMinutes = parseTimeToMinutes(start);
  const endMinutes = parseTimeToMinutes(end);
  if (startMinutes === null || endMinutes === null) {
    return false;
  }

  const eveningStart = 18 * 60;
  const eveningEnd = 22 * 60;
  return startMinutes <= eveningStart && endMinutes >= eveningEnd;
}

export async function GET(_request: Request, { params }: Params) {
  const auth = await requireApiUser();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Supabase admin is not configured." }, { status: 503 });
  }

  const { id } = await params;

  const { data, error } = await admin
    .from("doctors")
    .select(
      "id, name, specialization, languages, city, years_experience, availability_enabled, availability_days, availability_start_time, availability_end_time, active",
    )
    .eq("id", id)
    .eq("active", true)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Doctor not found." }, { status: 404 });
  }

  return NextResponse.json({
    doctor: {
      id: data.id,
      name: data.name,
      specialization: data.specialization,
      languages: data.languages,
      city: data.city,
      yearsExperience: data.years_experience,
      quickcheckAvailable: data.availability_enabled,
      availabilityDays: data.availability_days,
      availabilityStartTime: data.availability_start_time?.slice(0, 5) ?? null,
      availabilityEndTime: data.availability_end_time?.slice(0, 5) ?? null,
      worksEvenings: computeEveningBadge(data.availability_start_time, data.availability_end_time),
      ratingLabel: "New on YourDoc",
      bookingHref: `/consultations?doctor=${data.id}`,
    },
  });
}
