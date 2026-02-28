import { createClient } from "@supabase/supabase-js";
import {
  hasSupabaseAdminEnv,
  readSupabaseServiceRoleKey,
  readSupabaseUrl,
} from "@/lib/env";
import type { Database } from "@/lib/supabase/types";

let adminClient: ReturnType<typeof createClient<Database>> | null = null;

export function createSupabaseAdminClient() {
  if (!hasSupabaseAdminEnv) {
    return null;
  }

  if (!adminClient) {
    adminClient = createClient<Database>(readSupabaseUrl(), readSupabaseServiceRoleKey(), {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return adminClient;
}
