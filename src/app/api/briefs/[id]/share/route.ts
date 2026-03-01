import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";
import { validateRequestOrigin } from "@/lib/server/csrf";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { canViewerAccessBrief, getClientIp, getViewerIdentity } from "@/lib/server/yourdoc/access";
import { createShareToken, hashSharePin } from "@/lib/server/yourdoc/share";
import { logBriefEvent } from "@/lib/server/yourdoc/brief-events";
import { logAnalyticsEvent } from "@/lib/server/yourdoc/analytics";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

const createShareSchema = z.object({
  pin: z
    .string()
    .trim()
    .regex(/^\d{4,8}$/)
    .optional(),
  expiresInHours: z.number().int().min(1).max(720).optional(),
});

export async function POST(request: Request, { params }: Params) {
  const originError = validateRequestOrigin(request);
  if (originError) {
    return originError;
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Supabase admin not configured." }, { status: 503 });
  }

  const { id } = await params;
  const identity = await getViewerIdentity(request);
  const canAccess = await canViewerAccessBrief(admin, id, identity);

  if (!canAccess) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createShareSchema.safeParse(body ?? {});

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid share payload." }, { status: 400 });
  }

  const token = createShareToken();
  const expiresAt =
    typeof parsed.data.expiresInHours === "number"
      ? new Date(Date.now() + parsed.data.expiresInHours * 60 * 60 * 1000).toISOString()
      : null;

  const { error } = await admin
    .from("briefs")
    .update({
      share_token: token,
      share_pin_hash: parsed.data.pin ? hashSharePin(parsed.data.pin) : null,
      share_expires_at: expiresAt,
      revoked_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await Promise.all([
    logBriefEvent(admin, {
      briefId: id,
      actorType: identity.userId ? "user" : "system",
      actorId: identity.userId,
      eventType: "shared",
      ip: getClientIp(request),
      userAgent: request.headers.get("user-agent"),
      metadata: {
        hasPin: Boolean(parsed.data.pin),
        expiresAt,
      },
    }),
    logAnalyticsEvent(admin, {
      eventName: "brief_shared_link",
      briefId: id,
      userId: identity.userId,
      anonSessionId: identity.anonSessionId,
      metadata: {
        hasPin: Boolean(parsed.data.pin),
      },
    }),
  ]);

  return NextResponse.json({
    shareUrl: `${env.NEXT_PUBLIC_APP_URL}/s/${token}`,
    expiresAt,
    hasPin: Boolean(parsed.data.pin),
  });
}

export async function DELETE(request: Request, { params }: Params) {
  const originError = validateRequestOrigin(request);
  if (originError) {
    return originError;
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Supabase admin not configured." }, { status: 503 });
  }

  const { id } = await params;
  const identity = await getViewerIdentity(request);
  const canAccess = await canViewerAccessBrief(admin, id, identity);

  if (!canAccess) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const revokedAt = new Date().toISOString();

  const { error } = await admin
    .from("briefs")
    .update({
      revoked_at: revokedAt,
      updated_at: revokedAt,
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await logBriefEvent(admin, {
    briefId: id,
    actorType: identity.userId ? "user" : "system",
    actorId: identity.userId,
    eventType: "revoked",
    ip: getClientIp(request),
    userAgent: request.headers.get("user-agent"),
  });

  return NextResponse.json({ ok: true });
}
