"use client";

import { useEffect, useState } from "react";

type BillingState = {
  configured: boolean;
  checkoutEnabled: boolean;
  subscription: {
    status: string;
    currentPeriodEnd: string | null;
    stripeCustomerId: string | null;
  } | null;
};

export function BillingPanel() {
  const [state, setState] = useState<BillingState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadInitialState() {
      try {
        const response = await fetch("/api/billing/checkout");
        const body = (await response.json()) as BillingState & { error?: string };

        if (cancelled) {
          return;
        }

        if (!response.ok) {
          setError(body.error ?? "Unable to load billing state");
          return;
        }

        setState(body);
      } catch {
        if (!cancelled) {
          setError("Unable to load billing state");
        }
      }
    }

    void loadInitialState();

    return () => {
      cancelled = true;
    };
  }, []);

  async function startCheckout() {
    setBusy(true);
    setError(null);

    const response = await fetch("/api/billing/checkout", {
      method: "POST",
    });

    const body = (await response.json()) as { url?: string; error?: string };
    setBusy(false);

    if (!response.ok || !body.url) {
      setError(body.error ?? "Unable to create checkout session");
      return;
    }

    window.location.href = body.url;
  }

  async function openPortal() {
    setBusy(true);
    setError(null);

    const response = await fetch("/api/billing/portal", {
      method: "POST",
    });

    const body = (await response.json()) as { url?: string; error?: string };
    setBusy(false);

    if (!response.ok || !body.url) {
      setError(body.error ?? "Unable to open customer portal");
      return;
    }

    window.location.href = body.url;
  }

  return (
    <div className="grid gap-4">
      <div className="rounded-xl border border-[var(--line)] p-4 text-sm">
        {state ? (
          <>
            <p className="font-semibold">Billing configuration</p>
            <p className="mt-1 text-[var(--muted)]">
              {state.configured
                ? "Stripe is configured."
                : "Stripe env vars are missing. Add STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PRICE_MONTHLY_INR."}
            </p>
            <p className="mt-3">
              Subscription status: <span className="font-semibold">{state.subscription?.status ?? "none"}</span>
            </p>
            <p className="text-[var(--muted)]">Current period end: {state.subscription?.currentPeriodEnd ?? "-"}</p>
          </>
        ) : (
          <p>Loading billing status...</p>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={busy || !state?.checkoutEnabled}
          onClick={startCheckout}
          className="rounded-full bg-[var(--brand-500)] px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {busy ? "Working..." : "Subscribe to YourDoc+"}
        </button>
        <button
          type="button"
          disabled={busy || !state?.configured}
          onClick={openPortal}
          className="rounded-full border border-[var(--line)] px-5 py-2 text-sm font-semibold hover:border-[var(--brand-400)] disabled:opacity-60"
        >
          Manage Billing
        </button>
      </div>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
