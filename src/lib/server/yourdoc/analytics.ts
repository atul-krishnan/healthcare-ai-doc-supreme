import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/lib/supabase/types";

export const analyticsEventNames = [
  "intake_started",
  "intake_completed",
  "brief_generated",
  "brief_shared_link",
  "brief_shared_pdf",
  "quickcheck_clicked",
  "slot_selected",
  "booking_confirmed",
  "doctor_call_started",
  "doctor_call_completed",
  "outcome_selected",
  "refund_requested/support_ticket",
] as const;

export type AnalyticsEventName = (typeof analyticsEventNames)[number];

export type AnalyticsPayload = {
  eventName: AnalyticsEventName;
  briefId?: string | null;
  userId?: string | null;
  anonSessionId?: string | null;
  metadata?: Json;
};

export async function logAnalyticsEvent(
  supabase: SupabaseClient<Database>,
  payload: AnalyticsPayload,
) {
  const { error } = await supabase.from("analytics_events").insert({
    event_name: payload.eventName,
    brief_id: payload.briefId ?? null,
    user_id: payload.userId ?? null,
    anon_session_id: payload.anonSessionId ?? null,
    metadata: payload.metadata ?? {},
  });

  if (error) {
    // Non-fatal by design.
    console.error("analytics_insert_failed", error.message);
  }
}
