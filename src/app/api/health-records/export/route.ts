import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/server/request-context";

function escapeCsv(value: string | null) {
  const normalized = value ?? "";
  if (normalized.includes(",") || normalized.includes("\n") || normalized.includes('"')) {
    return `"${normalized.replaceAll('"', '""')}"`;
  }
  return normalized;
}

export async function GET() {
  const auth = await requireApiUser();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  const { data, error } = await auth.context.supabase
    .from("health_records")
    .select("title, record_type, source, observed_at, created_at")
    .eq("user_id", auth.context.userId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const header = "title,record_type,source,observed_at,created_at";
  const rows = (data ?? []).map((row) =>
    [
      escapeCsv(row.title),
      escapeCsv(row.record_type),
      escapeCsv(row.source),
      escapeCsv(row.observed_at),
      escapeCsv(row.created_at),
    ].join(","),
  );

  return new NextResponse([header, ...rows].join("\n"), {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=yourdoc-health-records.csv",
    },
  });
}
