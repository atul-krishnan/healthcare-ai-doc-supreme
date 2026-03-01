import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/types";
import { validateRequestOrigin } from "@/lib/server/csrf";
import { analyticsEventNames, logAnalyticsEvent } from "@/lib/server/yourdoc/analytics";
import { readAnonSessionId } from "@/lib/server/yourdoc/access";

const analyticsSchema = z.object({
  eventName: z.enum(analyticsEventNames),
  briefId: z.string().uuid().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: Request) {
  const originError = validateRequestOrigin(request);
  if (originError) {
    return originError;
  }

  const body = await request.json().catch(() => null);
  const parsed = analyticsSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid analytics payload." }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Supabase admin not configured." }, { status: 503 });
  }

  const supabase = await createSupabaseServerClient();
  const userId = supabase ? (await supabase.auth.getUser()).data.user?.id ?? null : null;

  await logAnalyticsEvent(admin, {
    eventName: parsed.data.eventName,
    briefId: parsed.data.briefId ?? null,
    userId,
    anonSessionId: readAnonSessionId(request),
    metadata: (parsed.data.metadata ?? {}) as Json,
  });

  return NextResponse.json({ ok: true });
}
