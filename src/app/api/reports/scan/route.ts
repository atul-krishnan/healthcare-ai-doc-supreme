import { NextResponse } from "next/server";
import { z } from "zod";
import { validateRequestOrigin } from "@/lib/server/csrf";
import { requireApiUser } from "@/lib/server/request-context";
import { scanMedicalReport } from "@/lib/server/report-scan";
import { writeAuditEvent } from "@/lib/server/audit";

const reportSchema = z.object({
  reportText: z.string().min(30).max(40000),
  reportName: z.string().min(2).max(200).optional(),
});

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
  const parsed = reportSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid report scan payload." }, { status: 400 });
  }

  const output = await scanMedicalReport(parsed.data.reportText);

  await writeAuditEvent(auth.context.supabase, {
    actorUserId: auth.context.userId,
    action: "report_scanned",
    resourceType: "health_record",
    resourceId: auth.context.userId,
    metadata: {
      reportName: parsed.data.reportName ?? "unnamed",
      findingCount: output.findings.length,
      model: output.model,
    },
  }).catch(() => {
    // Non-blocking audit failure.
  });

  return NextResponse.json(output);
}
