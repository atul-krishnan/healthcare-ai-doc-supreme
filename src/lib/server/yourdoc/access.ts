import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import type { SupabaseClient } from "@supabase/supabase-js";

export type ViewerIdentity = {
  userId: string | null;
  anonSessionId: string | null;
};

export async function getViewerIdentity(request: Request): Promise<ViewerIdentity> {
  const supabase = await createSupabaseServerClient();
  const authUser = supabase ? await supabase.auth.getUser() : null;
  const userId = authUser?.data.user?.id ?? null;

  const anonSessionId = readAnonSessionId(request);

  return {
    userId,
    anonSessionId,
  };
}

export function readAnonSessionId(request: Request) {
  const fromHeader = request.headers.get("x-anon-session-id")?.trim();
  if (fromHeader) {
    return fromHeader;
  }

  const cookieHeader = request.headers.get("cookie") ?? "";
  const parts = cookieHeader.split(";").map((part) => part.trim());
  const anonCookie = parts.find((part) => part.startsWith("yd_anon_session="));

  if (!anonCookie) {
    return null;
  }

  const [, value] = anonCookie.split("=");
  return value ? decodeURIComponent(value) : null;
}

export function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? null;
  }

  return request.headers.get("x-real-ip");
}

export async function canViewerAccessBrief(
  admin: SupabaseClient<Database>,
  briefId: string,
  identity: ViewerIdentity,
  options?: { allowAssignedDoctor?: boolean },
) {
  const { data: brief, error } = await admin
    .from("briefs")
    .select("id, user_id, anon_session_id")
    .eq("id", briefId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!brief) {
    return false;
  }

  if (identity.userId && brief.user_id === identity.userId) {
    return true;
  }

  if (!brief.user_id && identity.anonSessionId && brief.anon_session_id === identity.anonSessionId) {
    return true;
  }

  if (options?.allowAssignedDoctor && identity.userId) {
    const { data: doctor } = await admin
      .from("doctors")
      .select("id")
      .eq("auth_user_id", identity.userId)
      .eq("active", true)
      .maybeSingle();

    if (doctor?.id) {
      const { data: booking } = await admin
        .from("quickcheck_bookings")
        .select("id")
        .eq("brief_id", briefId)
        .eq("doctor_id", doctor.id)
        .in("status", ["booked", "completed", "rescheduled", "no_show"])
        .maybeSingle();

      if (booking?.id) {
        return true;
      }
    }
  }

  return false;
}
