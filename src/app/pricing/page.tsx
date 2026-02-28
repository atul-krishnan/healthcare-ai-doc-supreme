import Link from "next/link";
import { PageShell } from "@/components/page-shell";

const plans = [
  {
    name: "Starter",
    price: "Free",
    details: [
      "AI triage with safety constraints",
      "Basic symptom history",
      "Limited monthly checks",
      "Upgrade required for premium support",
    ],
  },
  {
    name: "YourDoc+",
    price: "INR 999 / month",
    details: [
      "Priority doctor consult pathways",
      "Health records timeline and export",
      "Subscription management via Stripe",
      "Ongoing follow-up notes",
    ],
  },
];

export default function PricingPage() {
  return (
    <PageShell
      title="Pricing"
      description="Hybrid monetization: free AI entry with paid premium care and subscription upgrades."
      primaryCta={{ label: "Open Billing", href: "/pay" }}
      secondaryCta={{ label: "Log in", href: "/login" }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {plans.map((plan) => (
          <article key={plan.name} className="rounded-xl border border-[var(--line)] p-5">
            <h2 className="text-xl font-semibold">{plan.name}</h2>
            <p className="mt-1 text-sm text-[var(--brand-700)]">{plan.price}</p>
            <ul className="mt-4 grid gap-2 text-sm text-[var(--muted)]">
              {plan.details.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
      <p className="mt-5 text-sm text-[var(--muted)]">
        Billing setup requires Stripe keys in environment variables. Once configured, users can subscribe from
        <Link href="/pay" className="font-semibold text-[var(--brand-700)]">
          {" "}/pay
        </Link>
        .
      </p>
    </PageShell>
  );
}
