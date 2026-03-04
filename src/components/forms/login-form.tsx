"use client";

import { FormEvent, useMemo, useState, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type AuthMethod = "otp" | "password";
type StatusTone = "info" | "success" | "error";

function mapAuthError(message: string, method: AuthMethod) {
  const lower = message.toLowerCase();

  if (lower.includes("over_email_send_rate_limit") || lower.includes("rate limit")) {
    return "Too many attempts right now. Please wait a minute and try again.";
  }

  if (method === "password" && lower.includes("invalid login credentials")) {
    return "Invalid email or password. Please try again.";
  }

  if (method === "otp" && (lower.includes("email_address_invalid") || lower.includes("email address"))) {
    return "This email cannot receive magic links. Use password sign-in for this account.";
  }

  return message;
}

export function LoginForm() {
  const searchParams = useSearchParams();
  const symptoms = searchParams.get("symptoms") ?? "";
  const redirectTarget = searchParams.get("redirect") ?? "/dashboard";
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMethod, setAuthMethod] = useState<AuthMethod>("otp");
  const [status, setStatus] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<StatusTone>("info");
  const [loading, setLoading] = useState(false);
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const nextPath = useMemo(() => {
    if (typeof window === "undefined") {
      return "/dashboard";
    }

    const next = new URL(redirectTarget, window.location.origin);
    if (symptoms) {
      next.searchParams.set("symptoms", symptoms);
    }
    return next.pathname + next.search;
  }, [redirectTarget, symptoms]);

  const callbackUrl = useMemo(() => {
    if (typeof window === "undefined") {
      return "";
    }

    const url = new URL("/auth/callback", window.location.origin);
    // Pass symptoms through the auth callback so we can pre-fill intake flow.
    url.searchParams.set("next", nextPath);
    return url.toString();
  }, [nextPath]);

  async function handleEmailOtp(normalizedEmail: string) {
    if (normalizedEmail.endsWith("@example.com")) {
      setAuthMethod("password");
      setStatusTone("info");
      setStatus("Magic links are disabled for @example.com test accounts. Sign in with password.");
      return;
    }

    if (!supabase) {
      setStatusTone("error");
      setStatus("Supabase auth is not configured yet.");
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        emailRedirectTo: callbackUrl,
      },
    });

    if (error) {
      setStatusTone("error");
      setStatus(mapAuthError(error.message, "otp"));
      return;
    }

    setStatusTone("success");
    setStatus("Check your email for the magic link ✉️");
  }

  async function handlePasswordSignIn(normalizedEmail: string) {
    if (!supabase) {
      setStatusTone("error");
      setStatus("Supabase auth is not configured yet.");
      return;
    }

    if (!password) {
      setStatusTone("error");
      setStatus("Enter your password to continue.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      setStatusTone("error");
      setStatus(mapAuthError(error.message, "password"));
      return;
    }

    if (typeof window !== "undefined") {
      window.location.assign(nextPath);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setStatusTone("error");
      setStatus("Enter a valid email address.");
      return;
    }

    setLoading(true);
    setStatus(null);
    setStatusTone("info");

    if (authMethod === "password") {
      await handlePasswordSignIn(normalizedEmail);
    } else {
      await handleEmailOtp(normalizedEmail);
    }

    setLoading(false);
  }

  async function handleGoogleSignIn() {
    if (!supabase) {
      setStatusTone("error");
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
      setStatusTone("error");
      setStatus(error.message);
    }
  }

  return (
    <div className="space-y-4">
      {/* Show symptom context if present */}
      {symptoms && (
        <div className="rounded-xl bg-[#F0F8FF] border border-[#D8E6E6] p-3 text-center">
          <p className="text-xs text-[#94a3b8]">Sign in to check:</p>
          <p className="mt-1 text-sm text-[#1D3557] font-medium">&ldquo;{symptoms}&rdquo;</p>
        </div>
      )}

      {/* Google sign in */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        className="w-full flex items-center justify-center gap-3 rounded-xl border border-[#D8E6E6] bg-white px-4 py-3 text-sm font-semibold text-[#1D3557] hover:border-[#2A9D8F] hover:shadow-[0_4px_12px_rgba(42,157,143,0.08)] transition-all cursor-pointer"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        Continue with Google
      </button>

      {/* OR divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-[#D8E6E6]" />
        <span className="text-xs text-[#64748B] font-medium">OR</span>
        <div className="flex-1 h-px bg-[#D8E6E6]" />
      </div>

      <div className="rounded-xl border border-[#D8E6E6] bg-[#F7FCFF] p-1 flex gap-1">
        <button
          type="button"
          onClick={() => setAuthMethod("otp")}
          className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
            authMethod === "otp" ? "bg-white text-[#1D3557] shadow-sm" : "text-[#64748B]"
          }`}
        >
          Email Link
        </button>
        <button
          type="button"
          onClick={() => setAuthMethod("password")}
          className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
            authMethod === "password" ? "bg-white text-[#1D3557] shadow-sm" : "text-[#64748B]"
          }`}
        >
          Password
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <svg viewBox="0 0 20 20" fill="none" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4">
            <rect x="2" y="4" width="16" height="12" rx="2" stroke="#64748B" strokeWidth="1.5" fill="none" />
            <path d="M2 6l8 5 8-5" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email address"
            className="w-full rounded-xl border border-[#D8E6E6] pl-10 pr-4 py-3 text-sm text-[#1D3557] placeholder:text-[#64748B] outline-none focus:border-[#2A9D8F] transition-colors"
          />
        </div>
        {authMethod === "password" ? (
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            className="w-full rounded-xl border border-[#D8E6E6] px-4 py-3 text-sm text-[#1D3557] placeholder:text-[#64748B] outline-none focus:border-[#2A9D8F] transition-colors"
          />
        ) : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[#1D3557] px-4 py-3 text-sm font-semibold text-white hover:bg-[#1D3557] disabled:opacity-70 transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          {loading ? "Please wait..." : authMethod === "password" ? "Continue with Password" : "Continue with Email"}
          {!loading && (
            <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
        <p className="text-center text-[11px] text-[#64748B]">
          {authMethod === "password"
            ? "Use password for temporary test accounts."
            : "We&apos;ll email you a magic link. No password needed."}
        </p>
      </form>

      {isHydrated && !supabase ? (
        <p className="rounded-xl bg-[#F0F8FF] border border-[#D8E6E6] p-3 text-xs text-[#94a3b8] text-center">
          Auth requires <code className="text-[#2A9D8F]">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="text-[#2A9D8F]">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> env vars.
        </p>
      ) : null}

      {status ? (
        <p
          className={`text-sm text-center rounded-xl p-3 ${
            statusTone === "error"
              ? "text-[#7A1B1B] bg-[#FDF0F0] border border-[#F6CACA]"
              : statusTone === "success"
                ? "text-[#255D3D] bg-[#EEFBF3] border border-[#D0F0DC]"
                : "text-[#4a4742] bg-[#F4F9FF] border border-[#D8E6E6]"
          }`}
        >
          {status}
        </p>
      ) : null}
    </div>
  );
}
