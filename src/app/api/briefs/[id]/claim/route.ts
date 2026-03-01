import { NextResponse } from "next/server";
import { z } from "zod";
import { validateRequestOrigin } from "@/lib/server/csrf";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { logBriefEvent } from "@/lib/server/yourdoc/brief-events";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

const claimSchema = z.object({
  anonSessionId: z.string().min(8).max(120),
});

export async function POST(request: Request, { params }: Params) {
  const originError = validateRequestOrigin(request);
  if (originError) {
    return originError;
  }

  const admin = createSupabaseAdminClient();
  const supabase = await createSupabaseServerClient();

  if (!admin || !supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const user = (await supabase.auth.getUser()).data.user;
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = claimSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid claim payload." }, { status: 400 });
  }

  const { id } = await params;

  const { data: brief, error: briefError } = await admin
    .from("briefs")
    .select("id, user_id, anon_session_id")
    .eq("id", id)
    .maybeSingle();

  if (briefError) {
    return NextResponse.json({ error: briefError.message }, { status: 500 });
  }

  if (!brief) {
    return NextResponse.json({ error: "Brief not found." }, { status: 404 });
  }

  if (brief.user_id && brief.user_id !== user.id) {
    return NextResponse.json({ error: "This brief belongs to another account." }, { status: 403 });
  }

  if (!brief.user_id && brief.anon_session_id !== parsed.data.anonSessionId) {
    return NextResponse.json({ error: "Unable to verify anonymous session for this brief." }, { status: 403 });
  }

  await Promise.all([
    admin
      .from("briefs")
      .update({
        user_id: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id),
    admin
      .from("uploads")
      .update({
        user_id: user.id,
      })
      .eq("brief_id", id),
    admin
      .from("quickcheck_bookings")
      .update({
        user_id: user.id,
      })
      .eq("brief_id", id)
      .is("user_id", null),
  ]);

  await logBriefEvent(admin, {
    briefId: id,
    actorType: "user",
    actorId: user.id,
    eventType: "claimed",
    userAgent: request.headers.get("user-agent"),
  });

  return NextResponse.json({ ok: true });
}
