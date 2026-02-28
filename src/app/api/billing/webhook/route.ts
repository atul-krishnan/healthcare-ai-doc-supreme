import Stripe from "stripe";
import { NextResponse } from "next/server";
import { env, readStripeWebhookSecret } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStripeServerClient } from "@/lib/server/stripe";

function unixToIso(timestamp?: number | null) {
  if (!timestamp) {
    return null;
  }

  return new Date(timestamp * 1000).toISOString();
}

async function upsertSubscriptionFromStripe(subscription: Stripe.Subscription) {
  const admin = createSupabaseAdminClient();
  if (!admin) {
    return;
  }

  const userId =
    subscription.metadata.userId ||
    (typeof subscription.customer === "string" ? undefined : undefined);

  if (!userId) {
    return;
  }

  const currentPeriodEnd = unixToIso(
    (subscription as unknown as { current_period_end?: number | null }).current_period_end,
  );

  await admin.from("subscriptions").upsert(
    {
      user_id: userId,
      provider: "stripe",
      status: subscription.status,
      stripe_customer_id:
        typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id,
      stripe_subscription_id: subscription.id,
      stripe_price_id: subscription.items.data[0]?.price.id ?? null,
      current_period_end: currentPeriodEnd,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id",
    },
  );
}

export async function POST(request: Request) {
  const stripe = getStripeServerClient();
  const admin = createSupabaseAdminClient();

  if (!stripe || !admin || !env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe webhook is not configured." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header." }, { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, readStripeWebhookSecret());
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Invalid webhook signature.",
      },
      { status: 400 },
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const customerId = typeof session.customer === "string" ? session.customer : null;

      if (userId) {
        await admin.from("subscriptions").upsert(
          {
            user_id: userId,
            provider: "stripe",
            status: "active",
            stripe_customer_id: customerId,
            stripe_subscription_id:
              typeof session.subscription === "string" ? session.subscription : null,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id",
          },
        );
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await upsertSubscriptionFromStripe(subscription);
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
