import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireApiUser } from "@/lib/server/request-context";
import type { Database } from "@/lib/supabase/types";
import { validateRequestOrigin } from "@/lib/server/csrf";

const createMessageSchema = z.object({
  threadId: z.string().uuid().optional(),
  content: z.string().min(1).max(5000),
});

function buildAssistantReply(content: string) {
  const lower = content.toLowerCase();

  if (lower.includes("pain") || lower.includes("fever") || lower.includes("breath")) {
    return "I noted potentially important symptoms. A doctor consult is recommended soon, especially if symptoms worsen. I can help summarize this for the clinician.";
  }

  return "Thanks, I captured that update. If symptoms persist or worsen, escalate to a doctor consult for clinical evaluation.";
}

async function ensureThread(
  supabase: SupabaseClient<Database>,
  userId: string,
  requestedThreadId?: string,
) {
  if (requestedThreadId) {
    const { data: existing } = await supabase
      .from("chat_threads")
      .select("id")
      .eq("id", requestedThreadId)
      .eq("user_id", userId)
      .single();

    if (existing) {
      return existing.id;
    }
  }

  const { data: latest } = await supabase
    .from("chat_threads")
    .select("id")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();

  if (latest?.id) {
    return latest.id;
  }

  const { data: created, error: createError } = await supabase
    .from("chat_threads")
    .insert({
      user_id: userId,
      status: "open",
    })
    .select("id")
    .single();

  if (createError || !created) {
    throw new Error(createError?.message ?? "Unable to create chat thread");
  }

  return created.id;
}

async function fetchMessages(supabase: SupabaseClient<Database>, threadId: string) {
  const { data: messages, error } = await supabase
    .from("chat_messages")
    .select("id, role, content, created_at")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return messages ?? [];
}

export async function GET(request: Request) {
  const auth = await requireApiUser();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  const requestUrl = new URL(request.url);
  const threadIdParam = requestUrl.searchParams.get("threadId") ?? undefined;

  const threadId = await ensureThread(auth.context.supabase, auth.context.userId, threadIdParam);
  const messages = await fetchMessages(auth.context.supabase, threadId);

  return NextResponse.json({
    threadId,
    messages,
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
  const parsed = createMessageSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid chat payload" }, { status: 400 });
  }

  const threadId = await ensureThread(auth.context.supabase, auth.context.userId, parsed.data.threadId);

  const { error: patientMessageError } = await auth.context.supabase.from("chat_messages").insert({
    thread_id: threadId,
    user_id: auth.context.userId,
    role: "patient",
    content: parsed.data.content,
  });

  if (patientMessageError) {
    return NextResponse.json({ error: patientMessageError.message }, { status: 500 });
  }

  const assistantReply = buildAssistantReply(parsed.data.content);

  await auth.context.supabase.from("chat_messages").insert({
    thread_id: threadId,
    user_id: auth.context.userId,
    role: "assistant",
    content: assistantReply,
  });

  await auth.context.supabase
    .from("chat_threads")
    .update({
      updated_at: new Date().toISOString(),
    })
    .eq("id", threadId)
    .eq("user_id", auth.context.userId);

  const messages = await fetchMessages(auth.context.supabase, threadId);

  return NextResponse.json({
    threadId,
    messages,
  });
}
