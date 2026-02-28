import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { requireApiUser } from "@/lib/server/request-context";
import { getStripeServerClient } from "@/lib/server/stripe";
import { validateRequestOrigin } from "@/lib/server/csrf";

export async function GET() {
  const auth = await requireApiUser();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  const { data: subscription, error } = await auth.context.supabase
    .from("subscriptions")
    .select("status, current_period_end, stripe_customer_id")
    .eq("user_id", auth.context.userId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const configured = Boolean(env.STRIPE_SECRET_KEY);
  const checkoutEnabled = configured && Boolean(env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY_INR);

  return NextResponse.json({
    configured,
    checkoutEnabled,
    subscription: subscription
      ? {
          status: subscription.status,
          currentPeriodEnd: subscription.current_period_end,
          stripeCustomerId: subscription.stripe_customer_id,
        }
      : null,
  });
}

export async function POST(request: Request) {
  const originError = validateRequestOrigin(request);
  if (originError) {
    return originError;
  }

  const auth = await requireApiUser();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  if (!env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY_INR) {
    return NextResponse.json(
      {
        error: "Missing NEXT_PUBLIC_STRIPE_PRICE_MONTHLY_INR.",
      },
      { status: 503 },
    );
  }

  const stripe = getStripeServerClient();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 503 });
  }

  const { data: existing } = await auth.context.supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", auth.context.userId)
    .maybeSingle();

  let customerId = existing?.stripe_customer_id ?? null;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: auth.context.email ?? undefined,
      metadata: {
        userId: auth.context.userId,
      },
    });

    customerId = customer.id;
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    success_url: `${env.NEXT_PUBLIC_APP_URL}/pay?checkout=success`,
    cancel_url: `${env.NEXT_PUBLIC_APP_URL}/pricing?checkout=cancelled`,
    line_items: [
      {
        price: env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY_INR,
        quantity: 1,
      },
    ],
    metadata: {
      userId: auth.context.userId,
    },
    subscription_data: {
      metadata: {
        userId: auth.context.userId,
      },
    },
  });

  await auth.context.supabase.from("subscriptions").upsert(
    {
      user_id: auth.context.userId,
      provider: "stripe",
      status: "pending_checkout",
      stripe_customer_id: customerId,
      stripe_price_id: env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY_INR,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id",
    },
  );

  return NextResponse.json({ url: checkoutSession.url });
}
