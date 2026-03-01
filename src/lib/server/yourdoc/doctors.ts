import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { getUserRole } from "@/lib/server/roles";

export async function getOrCreateDoctorRow(admin: SupabaseClient<Database>, authUserId: string) {
  const role = await getUserRole(admin, authUserId);

  if (role !== "doctor" && role !== "admin") {
    return null;
  }

  const { data: existing } = await admin
    .from("doctors")
    .select("id, auth_user_id, name, role, active")
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (existing) {
    return existing;
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("full_name")
    .eq("id", authUserId)
    .maybeSingle();

  const { data: inserted, error } = await admin
    .from("doctors")
    .insert({
      auth_user_id: authUserId,
      name: profile?.full_name ?? "Doctor",
      role: role === "admin" ? "admin" : "doctor",
      active: true,
    })
    .select("id, auth_user_id, name, role, active")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return inserted;
}
