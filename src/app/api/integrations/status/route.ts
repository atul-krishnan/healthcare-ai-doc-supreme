import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/server/request-context";

export async function GET() {
  const auth = await requireApiUser();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  const { data, error } = await auth.context.supabase
    .from("health_records")
    .select("source, created_at")
    .eq("user_id", auth.context.userId)
    .order("created_at", { ascending: false })
    .limit(400);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const latestBySource: Record<string, string> = {};
  const countsBySource: Record<string, number> = {};

  for (const item of data ?? []) {
    countsBySource[item.source] = (countsBySource[item.source] ?? 0) + 1;

    if (!latestBySource[item.source]) {
      latestBySource[item.source] = item.created_at;
    }
  }

  return NextResponse.json({
    countsBySource,
    latestBySource,
  });
}
