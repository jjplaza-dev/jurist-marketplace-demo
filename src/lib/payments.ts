import type Stripe from "stripe";
import { getAdmin } from "@/lib/supabase-admin";
import { isAccountReady, MIN_CHARGE_CENTS, toCents } from "@/lib/stripe";

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export type SellerRow = {
  email: string;
  stripe_account_id: string;
  charges_enabled: boolean;
  details_submitted: boolean;
};

export function formatCents(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(cents / 100);
}

/** True when the price is high enough to be charged through Stripe Checkout. */
export function isChargeable(price: number | string): boolean {
  return toCents(price) >= MIN_CHARGE_CENTS;
}

/**
 * Looks up the seller for an email. If they started onboarding but are not yet marked
 * as able to take payments, ask Stripe for the latest state (and save it), so a seller
 * who just finished onboarding gets Buy Now even before the account.updated webhook lands.
 * Returns null when the seller never connected.
 */
export async function getSeller(email: string): Promise<SellerRow | null> {
  const admin = getAdmin();
  const { data } = await admin
    .from("sellers")
    .select("email, stripe_account_id, charges_enabled, details_submitted")
    .eq("email", normalizeEmail(email))
    .maybeSingle();
  const seller = (data as SellerRow | null) ?? null;
  if (!seller || seller.charges_enabled) return seller;

  try {
    return (await refreshSeller(seller.stripe_account_id)) ?? seller;
  } catch (err) {
    console.error("seller refresh failed", err);
    return seller;
  }
}

/**
 * Asks Stripe whether a connected account can take card payments and saves the answer.
 * Accounts that aren't one of our sellers are skipped without calling Stripe (the sandbox
 * is shared, so webhooks can mention accounts that belong to other apps).
 */
export async function refreshSeller(accountId: string): Promise<SellerRow | null> {
  const admin = getAdmin();
  const { data: known } = await admin
    .from("sellers")
    .select("stripe_account_id")
    .eq("stripe_account_id", accountId)
    .maybeSingle();
  if (!known) return null;

  const ready = await isAccountReady(accountId);
  const { data } = await admin
    .from("sellers")
    .update({ charges_enabled: ready, details_submitted: ready })
    .eq("stripe_account_id", accountId)
    .select("email, stripe_account_id, charges_enabled, details_submitted")
    .maybeSingle();
  return (data as SellerRow | null) ?? null;
}

/** A seller can be paid only once Stripe says their account can accept charges. */
export function canSellerBePaid(seller: SellerRow | null): seller is SellerRow {
  return Boolean(seller && seller.charges_enabled);
}

/**
 * Records the order and marks the listing sold. Safe to call more than once for the same
 * session (the webhook, its retries, and the success page may all call it): the order is
 * keyed on the Checkout session id.
 *
 * Returns "ignored" for sessions that are not ours: unpaid, no/unknown listing, or paid to
 * a connected account that is not the listing's seller. The sandbox is shared with other
 * apps, so unknown events are expected and must not be treated as errors.
 */
export async function fulfillCheckoutSession(
  session: Stripe.Checkout.Session,
  accountId: string,
): Promise<"fulfilled" | "ignored"> {
  if (session.payment_status !== "paid") return "ignored";

  const listingId = session.metadata?.listing_id;
  if (!listingId || !UUID_RE.test(listingId)) return "ignored";

  const admin = getAdmin();

  const { data: listing } = await admin
    .from("listings")
    .select("id, title, seller_email")
    .eq("id", listingId)
    .maybeSingle();
  if (!listing) return "ignored";

  const { data: seller } = await admin
    .from("sellers")
    .select("stripe_account_id")
    .eq("email", normalizeEmail(listing.seller_email))
    .maybeSingle();
  if (!seller || seller.stripe_account_id !== accountId) return "ignored";

  const paymentIntent =
    typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null;

  const { error: orderError } = await admin.from("orders").upsert(
    {
      listing_id: listing.id,
      listing_title: listing.title,
      seller_email: normalizeEmail(listing.seller_email),
      buyer_email: session.customer_details?.email ?? null,
      stripe_account_id: accountId,
      stripe_session_id: session.id,
      stripe_payment_intent_id: paymentIntent,
      amount_total: session.amount_total ?? 0,
      application_fee_amount: Number(session.metadata?.application_fee_amount ?? 0) || 0,
      currency: session.currency ?? "usd",
      status: "paid",
    },
    { onConflict: "stripe_session_id", ignoreDuplicates: true },
  );
  if (orderError) throw new Error(`Saving order failed: ${orderError.message}`);

  const { error: listingError } = await admin
    .from("listings")
    .update({ status: "sold", sold_at: new Date().toISOString() })
    .eq("id", listing.id)
    .eq("status", "active");
  if (listingError) throw new Error(`Marking listing sold failed: ${listingError.message}`);

  return "fulfilled";
}
