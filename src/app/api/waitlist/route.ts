import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { validateRequestOrigin } from "@/lib/server/csrf";

const optionalString = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal(""));

const waitlistSchema = z.object({
  email: z.string().trim().email().max(255),
  name: optionalString(120),
  city: optionalString(120),
  language: optionalString(40),
  biggest_headache: optionalString(240),
  source: optionalString(80),
});

function cleanOptional(value?: string) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function POST(request: Request) {
  const originError = validateRequestOrigin(request);
  if (originError) {
    return originError;
  }

  const body = await request.json().catch(() => null);
  const parsed = waitlistSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid waitlist payload." }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Supabase admin not configured." }, { status: 503 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const payload = {
    email,
    full_name: cleanOptional(parsed.data.name),
    city: cleanOptional(parsed.data.city),
    preferred_language: cleanOptional(parsed.data.language),
    biggest_healthcare_headache: cleanOptional(parsed.data.biggest_headache),
    source: cleanOptional(parsed.data.source) ?? "landing_page_waitlist",
    metadata: {
      userAgent: request.headers.get("user-agent"),
    },
    updated_at: new Date().toISOString(),
  };

  const { data: existing, error: existingError } = await admin
    .from("waitlist_leads")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 500 });
  }

  if (existing?.id) {
    const updatePayload: {
      full_name?: string;
      city?: string;
      preferred_language?: string;
      biggest_healthcare_headache?: string;
      source: string;
      metadata: { userAgent: string | null };
      updated_at: string;
    } = {
      source: payload.source,
      metadata: payload.metadata,
      updated_at: payload.updated_at,
    };

    if (payload.full_name) {
      updatePayload.full_name = payload.full_name;
    }
    if (payload.city) {
      updatePayload.city = payload.city;
    }
    if (payload.preferred_language) {
      updatePayload.preferred_language = payload.preferred_language;
    }
    if (payload.biggest_healthcare_headache) {
      updatePayload.biggest_healthcare_headache = payload.biggest_healthcare_headache;
    }

    const { error: updateError } = await admin.from("waitlist_leads").update(updatePayload).eq("id", existing.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, status: "updated" });
  }

  const { error: insertError } = await admin.from("waitlist_leads").insert(payload);

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, status: "created" }, { status: 201 });
}
