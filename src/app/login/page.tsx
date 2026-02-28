import { Suspense } from "react";
import { PageShell } from "@/components/page-shell";
import { LoginForm } from "@/components/forms/login-form";

export default function LoginPage() {
  return (
    <PageShell
      title="Log in to YourDoc"
      description="Use email OTP or Google OAuth. Session management and protected routing are now wired through Supabase."
    >
      <Suspense fallback={<p className="text-sm text-[var(--muted)]">Loading login flow...</p>}>
        <LoginForm />
      </Suspense>
    </PageShell>
  );
}
