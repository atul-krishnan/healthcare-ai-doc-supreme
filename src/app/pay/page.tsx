import { PageShell } from "@/components/page-shell";
import { BillingPanel } from "@/components/panels/billing-panel";
import { requireUser } from "@/lib/server/require-user";

export default async function PayPage() {
  await requireUser();

  return (
    <PageShell
      title="Billing and Subscriptions"
      description="Manage your subscription and payment details."
    >
      <BillingPanel />
    </PageShell>
  );
}
