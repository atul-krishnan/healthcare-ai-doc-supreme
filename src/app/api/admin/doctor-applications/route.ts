import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/server/request-context";
import { getUserRole } from "@/lib/server/roles";
import { validateRequestOrigin } from "@/lib/server/csrf";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { writeAuditEvent } from "@/lib/server/audit";

const reviewSchema = z.object({
  applicationId: z.string().uuid(),
  decision: z.enum(["approved", "rejected", "disabled"]),
  rejectionReason: z.string().trim().max(500).optional(),
});

function parseAvailabilityWindow(value: string | null | undefined) {
  const fallback = { start: "19:00:00", end: "22:00:00" };
  if (!value) {
    return fallback;
  }

  const [start, end] = value.split("-");
  if (!start || !end) {
    return fallback;
  }

  const startValue = start.trim();
  const endValue = end.trim();
  if (!/^\d{2}:\d{2}$/.test(startValue) || !/^\d{2}:\d{2}$/.test(endValue)) {
    return fallback;
  }

  return {
    start: `${startValue}:00`,
    end: `${endValue}:00`,
  };
}

export async function GET(request: Request) {
  const auth = await requireApiUser();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  const role = await getUserRole(auth.context.supabase, auth.context.userId);
  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Supabase admin is not configured." }, { status: 503 });
  }

  const status = new URL(request.url).searchParams.get("status")?.trim().toLowerCase();

  let query = admin
    .from("doctor_applications")
    .select(
      "id, auth_user_id, full_name, specialization, languages, registration_number, registration_council, years_experience, city, phone, whatsapp, quickcheck_opt_in, availability_days, availability_window, terms_accepted, status, reviewed_at, reviewed_by, rejection_reason, created_at, updated_at",
    )
    .order("created_at", { ascending: true })
    .limit(300);

  if (status && ["pending", "approved", "rejected", "disabled"].includes(status)) {
    query = query.eq("status", status as "pending" | "approved" | "rejected" | "disabled");
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ applications: data ?? [] });
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
  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Supabase admin is not configured." }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const parsed = reviewSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid review payload." }, { status: 400 });
  }

  const { data: application, error: appError } = await admin
    .from("doctor_applications")
    .select(
      "id, auth_user_id, full_name, specialization, languages, registration_number, registration_council, years_experience, city, phone, quickcheck_opt_in, availability_days, availability_window, status",
    )
    .eq("id", parsed.data.applicationId)
    .maybeSingle();

  if (appError) {
    return NextResponse.json({ error: appError.message }, { status: 500 });
  }

  if (!application) {
    return NextResponse.json({ error: "Application not found." }, { status: 404 });
  }

  const reviewedAt = new Date().toISOString();

  if (parsed.data.decision === "approved") {
    const availability = parseAvailabilityWindow(application.availability_window);

    const { error: doctorError } = await admin.from("doctors").upsert(
      {
        auth_user_id: application.auth_user_id,
        name: application.full_name,
        phone: application.phone,
        specialization: application.specialization,
        languages: application.languages,
        years_experience: application.years_experience,
        city: application.city,
        registration_number: application.registration_number,
        registration_council: application.registration_council,
        availability_enabled: application.quickcheck_opt_in,
        availability_days: application.availability_days,
        availability_start_time: availability.start,
        availability_end_time: availability.end,
        role: "doctor",
        active: true,
        updated_at: reviewedAt,
      },
      { onConflict: "auth_user_id" },
    );

    if (doctorError) {
      return NextResponse.json({ error: doctorError.message }, { status: 500 });
    }

    const { error: profileError } = await admin
      .from("profiles")
      .update({
        role: "doctor",
        full_name: application.full_name,
        updated_at: reviewedAt,
      })
      .eq("id", application.auth_user_id);

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    const { error: reviewError } = await admin
      .from("doctor_applications")
      .update({
        status: "approved",
        reviewed_by: auth.context.userId,
        reviewed_at: reviewedAt,
        rejection_reason: null,
        updated_at: reviewedAt,
      })
      .eq("id", application.id);

    if (reviewError) {
      return NextResponse.json({ error: reviewError.message }, { status: 500 });
    }
  } else {
    const { error: reviewError } = await admin
      .from("doctor_applications")
      .update({
        status: parsed.data.decision,
        reviewed_by: auth.context.userId,
        reviewed_at: reviewedAt,
        rejection_reason: parsed.data.rejectionReason ?? null,
        updated_at: reviewedAt,
      })
      .eq("id", application.id);

    if (reviewError) {
      return NextResponse.json({ error: reviewError.message }, { status: 500 });
    }

    const { error: disableDoctorError } = await admin
      .from("doctors")
      .update({
        active: false,
        updated_at: reviewedAt,
      })
      .eq("auth_user_id", application.auth_user_id);

    if (disableDoctorError) {
      return NextResponse.json({ error: disableDoctorError.message }, { status: 500 });
    }

    const { error: profileError } = await admin
      .from("profiles")
      .update({
        role: "patient",
        updated_at: reviewedAt,
      })
      .eq("id", application.auth_user_id);

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }
  }

  await writeAuditEvent(admin, {
    actorUserId: auth.context.userId,
    action: `doctor_application_${parsed.data.decision}`,
    resourceType: "doctor_application",
    resourceId: application.id,
    metadata: {
      doctorUserId: application.auth_user_id,
      previousStatus: application.status,
      decision: parsed.data.decision,
      rejectionReason: parsed.data.rejectionReason ?? null,
    },
  });

  return NextResponse.json({ ok: true });
}
