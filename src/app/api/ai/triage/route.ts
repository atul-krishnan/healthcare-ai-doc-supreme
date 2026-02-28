import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/server/request-context";
import { runTriage, triageRequestSchema } from "@/lib/server/triage";
import { validateRequestOrigin } from "@/lib/server/csrf";

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
  const parsed = triageRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid triage request payload.",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const { output, model } = await runTriage(parsed.data);

  const { data: inserted, error } = await auth.context.supabase
    .from("triage_sessions")
    .insert({
      user_id: auth.context.userId,
      symptom_text: parsed.data.symptomText,
      severity: output.severity,
      recommendation: output.recommendation,
      red_flags: output.redFlags,
      ai_model: model,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json(
      {
        error: error.message,
        severity: output.severity,
        recommendation: output.recommendation,
        redFlags: output.redFlags,
        model,
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    severity: output.severity,
    recommendation: output.recommendation,
    redFlags: output.redFlags,
    model,
    triageId: inserted.id,
  });
}
