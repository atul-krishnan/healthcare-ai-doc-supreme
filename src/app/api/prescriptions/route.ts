import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/server/request-context";

export async function GET() {
  const auth = await requireApiUser();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  const { data, error } = await auth.context.supabase
    .from("prescriptions")
    .select("id, consultation_id, patient_id, doctor_id, medication, dosage, instructions, status, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ prescriptions: data ?? [] });
}
