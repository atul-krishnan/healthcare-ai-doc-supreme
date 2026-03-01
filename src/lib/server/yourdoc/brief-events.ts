import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/lib/supabase/types";

type BriefEventInput = {
  briefId: string;
  actorType: Database["public"]["Enums"]["brief_actor_type"];
  actorId?: string | null;
  eventType: string;
  ip?: string | null;
  userAgent?: string | null;
  metadata?: Json;
};

export async function logBriefEvent(supabase: SupabaseClient<Database>, input: BriefEventInput) {
  const { error } = await supabase.from("brief_events").insert({
    brief_id: input.briefId,
    actor_type: input.actorType,
    actor_id: input.actorId ?? null,
    event_type: input.eventType,
    ip: input.ip ?? null,
    user_agent: input.userAgent ?? null,
    metadata: input.metadata ?? {},
  });

  if (error) {
    console.error("brief_event_insert_failed", error.message);
  }
}
