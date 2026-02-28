"use client";

import { createBrowserClient } from "@supabase/ssr";
import { hasSupabaseClientEnv, readSupabaseAnonKey, readSupabaseUrl } from "@/lib/env";
import type { Database } from "@/lib/supabase/types";

let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createSupabaseBrowserClient() {
  if (!hasSupabaseClientEnv) {
    return null;
  }

  if (!browserClient) {
    browserClient = createBrowserClient<Database>(readSupabaseUrl(), readSupabaseAnonKey());
  }

  return browserClient;
}
