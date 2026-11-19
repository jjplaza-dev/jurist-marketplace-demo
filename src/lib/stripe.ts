import Stripe from "stripe";

// Marketplace cut of every sale, taken as a Stripe application fee.
export const PLATFORM_FEE_PERCENT = 10;

// Stripe rejects charges below this amount for USD.
export const MIN_CHARGE_CENTS = 50;

export const CURRENCY = "usd";

let client: Stripe | null = null;

/** Server-only Stripe client. Never import this from a "use client" file. */
export function getStripe(): Stripe {
  if (client) return client;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set.");
  client = new Stripe(key);
  return client;
}

export function toCents(price: number | string): number {
  return Math.round(Number(price) * 100);
}

export function platformFeeCents(amountCents: number): number {
  return Math.max(1, Math.round((amountCents * PLATFORM_FEE_PERCENT) / 100));
}
