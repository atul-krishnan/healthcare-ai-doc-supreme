import { NextResponse } from "next/server";
import { validateRequestOrigin } from "@/lib/server/csrf";
import { computeClinicalDriftAlerts } from "@/lib/server/monitoring/drift";
import { writeAuditEvent } from "@/lib/server/audit";
import { requireApiUser } from "@/lib/server/request-context";
import type { Json } from "@/lib/supabase/types";

export async function POST(request: Request) {
  const originError = validateRequestOrigin(request);
  if (originError) {
    return originError;
  }

  const auth = await requireApiUser();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  const { data: records, error } = await auth.context.supabase
    .from("health_records")
    .select("id, observed_at, payload")
    .eq("user_id", auth.context.userId)
    .eq("record_type", "fhir_observation")
    .order("observed_at", { ascending: false })
    .limit(300);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const alerts = computeClinicalDriftAlerts(records ?? []);

  if (alerts.length > 0) {
    const alertRows = alerts.map((alert) => ({
      user_id: auth.context.userId,
      record_type: "clinical_alert",
      source: "drift_engine",
      title: `Drift alert: ${alert.metric}`,
      observed_at: new Date().toISOString(),
      payload: alert as unknown as Json,
    }));

    const { error: insertError } = await auth.context.supabase.from("health_records").insert(alertRows);

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
  }

  await writeAuditEvent(auth.context.supabase, {
    actorUserId: auth.context.userId,
    action: "drift_analysis_executed",
    resourceType: "health_record",
    resourceId: auth.context.userId,
    metadata: {
      sourceObservations: records?.length ?? 0,
      alertCount: alerts.length,
    },
  }).catch(() => {
    // Ignore audit write errors for this endpoint response.
  });

  return NextResponse.json({
    observationCount: records?.length ?? 0,
    alertCount: alerts.length,
    alerts,
  });
}
