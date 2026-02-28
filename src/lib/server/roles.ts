import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export type UserRole = "patient" | "doctor" | "admin";

export async function getUserRole(supabase: SupabaseClient<Database>, userId: string) {
  const { data, error } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();

  if (error) {
    if (error.message.includes("column") && error.message.includes("role")) {
      return "patient";
    }
    throw new Error(error.message);
  }

  return (data?.role ?? "patient") as UserRole;
}

export async function requireUserRole(
  supabase: SupabaseClient<Database>,
  user: User,
  allowedRoles: UserRole[],
) {
  const role = await getUserRole(supabase, user.id);

  if (!allowedRoles.includes(role)) {
    throw new Error("Forbidden");
  }

  return role;
}
