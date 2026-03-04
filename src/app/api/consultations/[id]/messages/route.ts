import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/server/request-context";
import { getUserRole } from "@/lib/server/roles";
import { writeAuditEvent } from "@/lib/server/audit";
import { validateRequestOrigin } from "@/lib/server/csrf";

const createMessageSchema = z.object({
  content: z.string().min(1).max(5000),
});

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_: Request, { params }: Params) {
  const auth = await requireApiUser();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  const { id } = await params;

  const { data: consultation, error: consultationError } = await auth.context.supabase
    .from("consultations")
    .select("id")
    .eq("id", id)
    .maybeSingle();

  if (consultationError) {
    return NextResponse.json({ error: consultationError.message }, { status: 500 });
  }

  if (!consultation) {
    return NextResponse.json({ error: "Consultation not found." }, { status: 404 });
  }

  const { data: messages, error } = await auth.context.supabase
    .from("consultation_messages")
    .select("id, consultation_id, sender_id, sender_role, content, created_at")
    .eq("consultation_id", id)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ messages: messages ?? [] });
}

export async function POST(request: Request, { params }: Params) {
  const originError = validateRequestOrigin(request);
  if (originError) {
    return originError;
  }

  const auth = await requireApiUser();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = createMessageSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid message payload." }, { status: 400 });
  }

  const { data: consultation, error: consultationError } = await auth.context.supabase
    .from("consultations")
    .select("id, status, doctor_id")
    .eq("id", id)
    .maybeSingle();

  if (consultationError) {
    return NextResponse.json({ error: consultationError.message }, { status: 500 });
  }

  if (!consultation) {
    return NextResponse.json({ error: "Consultation not found." }, { status: 404 });
  }

  const role = await getUserRole(auth.context.supabase, auth.context.userId);
  const senderRole = role === "doctor" || role === "admin" ? "doctor" : "patient";

  if (senderRole === "doctor" && role === "doctor" && consultation.doctor_id !== auth.context.userId) {
    return NextResponse.json({ error: "This consultation is not assigned to you." }, { status: 403 });
  }

  if (senderRole === "doctor" && role === "admin" && !consultation.doctor_id) {
    return NextResponse.json({ error: "Assign a doctor before sending doctor-side messages." }, { status: 400 });
  }

  const { error: insertError } = await auth.context.supabase.from("consultation_messages").insert({
    consultation_id: consultation.id,
    sender_id: auth.context.userId,
    sender_role: senderRole,
    content: parsed.data.content,
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  if (senderRole === "doctor") {
    await auth.context.supabase
      .from("consultations")
      .update({
        status: consultation.status === "open" ? "in_progress" : consultation.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", consultation.id);
  }

  await writeAuditEvent(auth.context.supabase, {
    actorUserId: auth.context.userId,
    action: "consultation_message_created",
    resourceType: "consultation",
    resourceId: consultation.id,
    metadata: {
      senderRole,
    },
  });

  const { data: messages } = await auth.context.supabase
    .from("consultation_messages")
    .select("id, consultation_id, sender_id, sender_role, content, created_at")
    .eq("consultation_id", consultation.id)
    .order("created_at", { ascending: true });

  return NextResponse.json({ messages: messages ?? [] });
}
