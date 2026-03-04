import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/server/request-context";
import { validateRequestOrigin } from "@/lib/server/csrf";
import { getUserRole } from "@/lib/server/roles";
import { writeAuditEvent } from "@/lib/server/audit";

const dayValues = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

const doctorApplySchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  specialization: z.string().trim().min(2).max(120),
  languages: z.array(z.string().trim().min(2).max(40)).min(1).max(8),
  registrationNumber: z.string().trim().min(3).max(80),
  registrationCouncil: z.string().trim().min(3).max(120),
  yearsExperience: z.number().int().min(0).max(80),
  city: z.string().trim().min(2).max(120),
  phone: z.string().trim().regex(/^[+0-9()\-\s]{8,20}$/),
  whatsapp: z
    .string()
    .trim()
    .regex(/^[+0-9()\-\s]{8,20}$/)
    .optional()
    .or(z.literal("")),
  quickcheckOptIn: z.boolean().default(true),
  availabilityDays: z.array(z.enum(dayValues)).min(1).max(7),
  availabilityWindow: z.string().trim().regex(/^\d{2}:\d{2}-\d{2}:\d{2}$/),
  termsAccepted: z.literal(true),
});

export async function GET() {
  const auth = await requireApiUser();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  const role = await getUserRole(auth.context.supabase, auth.context.userId);

  const [{ data: application, error: appError }, { data: doctor, error: doctorError }] = await Promise.all([
    auth.context.supabase
      .from("doctor_applications")
      .select(
        "id, full_name, specialization, languages, registration_number, registration_council, years_experience, city, phone, whatsapp, quickcheck_opt_in, availability_days, availability_window, terms_accepted, status, rejection_reason, reviewed_at, created_at, updated_at",
      )
      .eq("auth_user_id", auth.context.userId)
      .maybeSingle(),
    auth.context.supabase
      .from("doctors")
      .select(
        "id, active, role, name, specialization, languages, years_experience, city, registration_number, registration_council, availability_enabled, availability_days, availability_start_time, availability_end_time",
      )
      .eq("auth_user_id", auth.context.userId)
      .maybeSingle(),
  ]);

  if (appError) {
    return NextResponse.json({ error: appError.message }, { status: 500 });
  }

  if (doctorError) {
    return NextResponse.json({ error: doctorError.message }, { status: 500 });
  }

  return NextResponse.json({
    role,
    application,
    doctor,
  });
}

export async function POST(request: Request) {
  const originError = validateRequestOrigin(request);
  if (originError) {
    return originError;
  }

  const auth = await requireApiUser();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  const body = await request.json().catch(() => null);
  const parsed = doctorApplySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid doctor application payload." }, { status: 400 });
  }

  const { data: activeDoctor } = await auth.context.supabase
    .from("doctors")
    .select("id, active")
    .eq("auth_user_id", auth.context.userId)
    .eq("active", true)
    .maybeSingle();

  if (activeDoctor?.id) {
    return NextResponse.json({ error: "Your doctor profile is already active." }, { status: 409 });
  }

  const { data: existing, error: existingError } = await auth.context.supabase
    .from("doctor_applications")
    .select("id, status")
    .eq("auth_user_id", auth.context.userId)
    .maybeSingle();

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 500 });
  }

  if (existing && existing.status !== "pending") {
    return NextResponse.json(
      { error: `Application cannot be edited in ${existing.status} state. Contact admin to reopen.` },
      { status: 409 },
    );
  }

  const payload = {
    auth_user_id: auth.context.userId,
    full_name: parsed.data.fullName,
    specialization: parsed.data.specialization,
    languages: parsed.data.languages,
    registration_number: parsed.data.registrationNumber,
    registration_council: parsed.data.registrationCouncil,
    years_experience: parsed.data.yearsExperience,
    city: parsed.data.city,
    phone: parsed.data.phone,
    whatsapp: parsed.data.whatsapp || null,
    quickcheck_opt_in: parsed.data.quickcheckOptIn,
    availability_days: parsed.data.availabilityDays,
    availability_window: parsed.data.availabilityWindow,
    terms_accepted: parsed.data.termsAccepted,
    status: "pending" as const,
    rejection_reason: null,
    reviewed_at: null,
    reviewed_by: null,
    updated_at: new Date().toISOString(),
  };

  const { data: application, error: saveError } = await auth.context.supabase
    .from("doctor_applications")
    .upsert(payload, { onConflict: "auth_user_id" })
    .select(
      "id, status, full_name, specialization, languages, registration_number, registration_council, years_experience, city, phone, whatsapp, quickcheck_opt_in, availability_days, availability_window, reviewed_at, rejection_reason",
    )
    .single();

  if (saveError) {
    return NextResponse.json({ error: saveError.message }, { status: 500 });
  }

  await auth.context.supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      phone: parsed.data.phone,
      updated_at: new Date().toISOString(),
    })
    .eq("id", auth.context.userId);

  await writeAuditEvent(auth.context.supabase, {
    actorUserId: auth.context.userId,
    action: "doctor_application_submitted",
    resourceType: "doctor_application",
    resourceId: application.id,
    metadata: {
      specialization: parsed.data.specialization,
      quickcheckOptIn: parsed.data.quickcheckOptIn,
    },
  });

  return NextResponse.json({ application }, { status: 201 });
}
