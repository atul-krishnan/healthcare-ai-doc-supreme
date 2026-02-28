import { NextResponse } from "next/server";
import { validateRequestOrigin } from "@/lib/server/csrf";
import { resourceToHealthRecordTitle, resourceToObservedAt, resourceToRecordType } from "@/lib/server/fhir/mappers";
import { syncWearableData } from "@/lib/server/integrations/wearables";
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

  const syncResult = await syncWearableData(auth.context.userId);

  const records = syncResult.resources.map((resource) => ({
    user_id: auth.context.userId,
    record_type: resourceToRecordType(resource),
    source: syncResult.provider,
    title: resourceToHealthRecordTitle(resource),
    observed_at: resourceToObservedAt(resource),
    payload: resource as unknown as Json,
  }));

  if (records.length > 0) {
    const { error } = await auth.context.supabase.from("health_records").insert(records);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  await writeAuditEvent(auth.context.supabase, {
    actorUserId: auth.context.userId,
    action: "wearable_sync_executed",
    resourceType: "health_record",
    resourceId: auth.context.userId,
    metadata: {
      provider: syncResult.provider,
      mode: syncResult.mode,
      importedCount: records.length,
      warnings: syncResult.warnings,
    },
  }).catch(() => {
    // Ignore audit write errors for this endpoint response.
  });

  return NextResponse.json({
    provider: syncResult.provider,
    mode: syncResult.mode,
    importedCount: records.length,
    warnings: syncResult.warnings,
  });
}
