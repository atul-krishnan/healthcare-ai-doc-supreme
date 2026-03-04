import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/server/request-context";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

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
  const eveningEnd = 23 * 60;
  return startMinutes <= eveningStart && endMinutes >= eveningEnd - 60;
}

export async function GET() {
  const auth = await requireApiUser();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Supabase admin is not configured." }, { status: 503 });
  }

  const { data, error } = await admin
    .from("doctors")
    .select(
      "id, name, specialization, languages, city, availability_enabled, availability_start_time, availability_end_time, active",
    )
    .eq("active", true)
    .order("name", { ascending: true })
    .limit(200);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    doctors: (data ?? []).map((item) => ({
      id: item.id,
      name: item.name,
      specialization: item.specialization,
      languages: item.languages,
      city: item.city,
      worksEvenings: computeEveningBadge(item.availability_start_time, item.availability_end_time),
      quickcheckAvailable: item.availability_enabled,
      ratingLabel: "New on YourDoc",
    })),
  });
}
