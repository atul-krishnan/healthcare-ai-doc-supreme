import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { validateRequestOrigin } from "@/lib/server/csrf";
import { logAnalyticsEvent } from "@/lib/server/yourdoc/analytics";

const startSchema = z.object({
  anonSessionId: z.string().min(8).max(120),
});

export async function POST(request: Request) {
  const originError = validateRequestOrigin(request);
  if (originError) {
    return originError;
  }

  const body = await request.json().catch(() => null);
  const parsed = startSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ ok: true });
  }

  await logAnalyticsEvent(admin, {
    eventName: "intake_started",
    anonSessionId: parsed.data.anonSessionId,
  });

  return NextResponse.json({ ok: true });
}
