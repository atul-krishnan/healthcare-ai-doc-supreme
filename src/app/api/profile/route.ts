import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireApiUser } from "@/lib/server/request-context";
import type { Database } from "@/lib/supabase/types";
import { validateRequestOrigin } from "@/lib/server/csrf";

const updateProfileSchema = z.object({
  fullName: z.string().max(120),
  phone: z.string().max(40),
  country: z.string().max(80),
  timezone: z.string().max(80),
  dailySummary: z.boolean(),
  consultationUpdates: z.boolean(),
  email: z.string().email().nullable().optional(),
});

async function readProfile(userId: string, supabase: SupabaseClient<Database>, email: string | null) {
  const [{ data: profile }, { data: preferences }] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, phone, country, timezone")
      .eq("id", userId)
      .maybeSingle(),
    supabase
      .from("notification_preferences")
      .select("daily_summary, consultation_updates")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  return {
    fullName: profile?.full_name ?? "",
    phone: profile?.phone ?? "",
    country: profile?.country ?? "India",
    timezone: profile?.timezone ?? "Asia/Kolkata",
    dailySummary: preferences?.daily_summary ?? true,
    consultationUpdates: preferences?.consultation_updates ?? true,
    email,
  };
}

export async function GET() {
  const auth = await requireApiUser();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  const profile = await readProfile(auth.context.userId, auth.context.supabase, auth.context.email);

  return NextResponse.json({ profile });
}

export async function PUT(request: Request) {
  const originError = validateRequestOrigin(request);
  if (originError) {
    return originError;
  }

  const auth = await requireApiUser();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  const body = await request.json().catch(() => null);
  const parsed = updateProfileSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid profile payload" }, { status: 400 });
  }

  const profileUpdate = auth.context.supabase.from("profiles").upsert(
    {
      id: auth.context.userId,
      full_name: parsed.data.fullName,
      phone: parsed.data.phone,
      country: parsed.data.country,
      timezone: parsed.data.timezone,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "id",
    },
  );

  const preferenceUpdate = auth.context.supabase.from("notification_preferences").upsert(
    {
      user_id: auth.context.userId,
      daily_summary: parsed.data.dailySummary,
      consultation_updates: parsed.data.consultationUpdates,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id",
    },
  );

  const [profileResult, preferenceResult] = await Promise.all([profileUpdate, preferenceUpdate]);

  if (profileResult.error || preferenceResult.error) {
    return NextResponse.json(
      {
        error: profileResult.error?.message ?? preferenceResult.error?.message ?? "Unable to update profile",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
