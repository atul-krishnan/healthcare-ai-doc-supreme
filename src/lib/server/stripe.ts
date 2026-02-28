import Stripe from "stripe";
import { hasStripeEnv, readStripeSecretKey } from "@/lib/env";

let stripeClient: Stripe | null = null;

export function getStripeServerClient() {
  if (!hasStripeEnv) {
    return null;
  }

  if (!stripeClient) {
    stripeClient = new Stripe(readStripeSecretKey());
  }

  return stripeClient;
}
