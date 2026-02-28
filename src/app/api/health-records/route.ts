import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/server/request-context";
import type { Json } from "@/lib/supabase/types";
import { validateRequestOrigin } from "@/lib/server/csrf";

const createRecordSchema = z.object({
  title: z.string().min(2).max(200),
  recordType: z.string().min(2).max(100),
  source: z.string().min(2).max(100).default("manual_upload"),
  observedAt: z.string().datetime().nullable().optional(),
  payload: z.record(z.string(), z.unknown()).default({}),
});

export async function GET() {
  const auth = await requireApiUser();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  const { data, error } = await auth.context.supabase
    .from("health_records")
    .select("id, title, record_type, source, observed_at, created_at")
    .eq("user_id", auth.context.userId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ records: data ?? [] });
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
  const parsed = createRecordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid health record payload" }, { status: 400 });
  }

  const { error } = await auth.context.supabase.from("health_records").insert({
    user_id: auth.context.userId,
    title: parsed.data.title,
    record_type: parsed.data.recordType,
    source: parsed.data.source,
    observed_at: parsed.data.observedAt ?? null,
    payload: parsed.data.payload as Json,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
