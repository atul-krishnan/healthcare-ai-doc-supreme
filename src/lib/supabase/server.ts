import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { hasSupabaseClientEnv, readSupabaseAnonKey, readSupabaseUrl } from "@/lib/env";
import type { Database } from "@/lib/supabase/types";

export async function createSupabaseServerClient() {
  if (!hasSupabaseClientEnv) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(readSupabaseUrl(), readSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server components may not allow cookie writes; middleware handles session writes.
        }
      },
    },
  });
}
