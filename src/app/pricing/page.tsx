import Link from "next/link";
import { PageShell } from "@/components/page-shell";

const plans = [
  {
    name: "Starter",
    price: "Free",
    details: [
      "AI symptom check-ups",
      "Your symptom history",
      "5 free checks per month",
      "Upgrade anytime",
    ],
  },
  {
    name: "YourDoc+",
    price: "INR 999 / month",
    details: [
      "Priority doctor access",
      "Health records & export",
      "Easy subscription management",
      "Ongoing doctor follow-ups",
    ],
  },
];

export default function PricingPage() {
  return (
    <PageShell
      title="Simple, honest pricing"
      description="Start free. Upgrade when you want priority access to doctors and smarter health tools."
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
    </PageShell>
  );
}
