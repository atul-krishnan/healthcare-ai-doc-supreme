import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/server/request-context";
import { getUserRole } from "@/lib/server/roles";

export async function GET() {
  const auth = await requireApiUser();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  const role = await getUserRole(auth.context.supabase, auth.context.userId);

  if (role !== "doctor" && role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await auth.context.supabase
    .from("consultations")
    .select("id, patient_id, doctor_id, status, priority, chief_complaint, created_at, updated_at")
    .or(`doctor_id.eq.${auth.context.userId},doctor_id.is.null`)
    .in("status", ["open", "assigned", "in_progress"])
    .order("updated_at", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ queue: data ?? [] });
}
