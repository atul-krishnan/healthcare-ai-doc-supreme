import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/server/request-context";
import { retrieveClinicalEvidence } from "@/lib/server/clinical-knowledge";
import { validateRequestOrigin } from "@/lib/server/csrf";

const searchSchema = z.object({
  query: z.string().min(3).max(500),
  limit: z.number().int().min(1).max(8).optional(),
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
  const parsed = searchSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid knowledge search payload." }, { status: 400 });
  }

  const result = await retrieveClinicalEvidence(parsed.data.query, parsed.data.limit ?? 4);

  return NextResponse.json(result);
}
