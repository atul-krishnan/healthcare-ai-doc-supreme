"use client";

import { FormEvent, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") ?? "/dashboard";
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const callbackUrl = useMemo(() => {
    if (typeof window === "undefined") {
      return "";
    }

    const url = new URL("/auth/callback", window.location.origin);
    url.searchParams.set("next", redirectTarget);
    return url.toString();
  }, [redirectTarget]);

  async function handleEmailOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      setStatus("Supabase auth is not configured yet.");
      return;
    }

    setLoading(true);
    setStatus(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: callbackUrl,
      },
    });

    setLoading(false);

    if (error) {
      setStatus(error.message);
      return;
    }

    setStatus("Check your email for the magic link or OTP.");
  }

  async function handleGoogleSignIn() {
    if (!supabase) {
      setStatus("Supabase auth is not configured yet.");
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl,
      },
    });

    if (error) {
      setStatus(error.message);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleEmailOtp} className="grid gap-3 rounded-xl border border-[var(--line)] p-4">
        <label className="text-sm font-medium" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--brand-500)]"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-[var(--brand-500)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-70"
        >
          {loading ? "Sending..." : "Continue with Email"}
        </button>
      </form>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        className="w-full rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold hover:border-[var(--brand-400)]"
      >
        Continue with Google
      </button>

      {!supabase ? (
        <p className="rounded-lg bg-[var(--surface-alt)] p-3 text-xs text-[var(--muted)]">
          Missing `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Auth flows are ready but need env
          values.
        </p>
      ) : null}

      {status ? <p className="text-sm text-[var(--muted)]">{status}</p> : null}
    </div>
  );
}
