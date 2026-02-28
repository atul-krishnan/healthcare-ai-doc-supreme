import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/lib/supabase/types";

type AuditInput = {
  actorUserId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  metadata?: Json;
};

export async function writeAuditEvent(supabase: SupabaseClient<Database>, input: AuditInput) {
  const { error } = await supabase.from("audit_events").insert({
    actor_user_id: input.actorUserId,
    action: input.action,
    resource_type: input.resourceType,
    resource_id: input.resourceId,
    metadata: input.metadata ?? {},
  });

  if (error) {
    throw new Error(error.message);
  }
}
