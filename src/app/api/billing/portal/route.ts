import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { requireApiUser } from "@/lib/server/request-context";
import { getStripeServerClient } from "@/lib/server/stripe";
import { validateRequestOrigin } from "@/lib/server/csrf";

export async function POST(request: Request) {
  const originError = validateRequestOrigin(request);
  if (originError) {
    return originError;
  }

  const auth = await requireApiUser();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  const stripe = getStripeServerClient();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 503 });
  }

  const { data: subscription } = await auth.context.supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", auth.context.userId)
    .maybeSingle();

  if (!subscription?.stripe_customer_id) {
    return NextResponse.json({ error: "No Stripe customer found for this user." }, { status: 404 });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripe_customer_id,
    return_url: `${env.NEXT_PUBLIC_APP_URL}/pay`,
  });

  return NextResponse.json({ url: session.url });
}
