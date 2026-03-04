import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/server/request-context";
import { validateRequestOrigin } from "@/lib/server/csrf";
import { getUserRole } from "@/lib/server/roles";
import { getActiveDoctorRow } from "@/lib/server/yourdoc/doctors";
import { writeAuditEvent } from "@/lib/server/audit";

const dayValues = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

const availabilitySchema = z.object({
  availabilityEnabled: z.boolean(),
  availabilityDays: z.array(z.enum(dayValues)).min(1).max(7),
  availabilityStartTime: z.string().trim().regex(/^\d{2}:\d{2}$/),
  availabilityEndTime: z.string().trim().regex(/^\d{2}:\d{2}$/),
});

function timeToMinutes(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

export async function GET() {
  const auth = await requireApiUser();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  const role = await getUserRole(auth.context.supabase, auth.context.userId);
  if (role !== "doctor") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const doctor = await getActiveDoctorRow(auth.context.supabase, auth.context.userId);
  if (!doctor) {
    return NextResponse.json({ error: "Doctor onboarding is pending approval or disabled." }, { status: 403 });
  }

  return NextResponse.json({
    availability: {
      availabilityEnabled: doctor.availability_enabled,
      availabilityDays: doctor.availability_days,
      availabilityStartTime: doctor.availability_start_time?.slice(0, 5) ?? "19:00",
      availabilityEndTime: doctor.availability_end_time?.slice(0, 5) ?? "22:00",
    },
  });
}

export async function PATCH(request: Request) {
  const originError = validateRequestOrigin(request);
  if (originError) {
    return originError;
  }

  const auth = await requireApiUser();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  const role = await getUserRole(auth.context.supabase, auth.context.userId);
  if (role !== "doctor") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const doctor = await getActiveDoctorRow(auth.context.supabase, auth.context.userId);
  if (!doctor) {
    return NextResponse.json({ error: "Doctor onboarding is pending approval or disabled." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = availabilitySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid availability payload." }, { status: 400 });
  }

  const startMinutes = timeToMinutes(parsed.data.availabilityStartTime);
  const endMinutes = timeToMinutes(parsed.data.availabilityEndTime);

  if (startMinutes >= endMinutes) {
    return NextResponse.json({ error: "Availability end time must be after start time." }, { status: 400 });
  }

  const updatedAt = new Date().toISOString();
  const { data: updated, error } = await auth.context.supabase
    .from("doctors")
    .update({
      availability_enabled: parsed.data.availabilityEnabled,
      availability_days: parsed.data.availabilityDays,
      availability_start_time: `${parsed.data.availabilityStartTime}:00`,
      availability_end_time: `${parsed.data.availabilityEndTime}:00`,
      updated_at: updatedAt,
    })
    .eq("id", doctor.id)
    .select(
      "id, availability_enabled, availability_days, availability_start_time, availability_end_time, updated_at",
    )
    .single();

  if (error || !updated) {
    return NextResponse.json({ error: error?.message ?? "Unable to update availability." }, { status: 500 });
  }

  await writeAuditEvent(auth.context.supabase, {
    actorUserId: auth.context.userId,
    action: "doctor_availability_updated",
    resourceType: "doctor",
    resourceId: doctor.id,
    metadata: {
      availabilityEnabled: updated.availability_enabled,
      availabilityDays: updated.availability_days,
      availabilityStartTime: updated.availability_start_time,
      availabilityEndTime: updated.availability_end_time,
    },
  });

  return NextResponse.json({
    availability: {
      availabilityEnabled: updated.availability_enabled,
      availabilityDays: updated.availability_days,
      availabilityStartTime: updated.availability_start_time?.slice(0, 5) ?? "19:00",
      availabilityEndTime: updated.availability_end_time?.slice(0, 5) ?? "22:00",
    },
  });
}
