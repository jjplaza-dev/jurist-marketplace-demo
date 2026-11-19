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

// ---------------------------------------------------------------------------
// Connected accounts use Accounts v2 (the sandbox platform has Stripe as the losses
// collector, so the legacy v1 `type: "express"` call is rejected). Express Dashboard +
// Stripe-managed losses currently needs the preview API version, passed per request.
// Payments themselves (Checkout, fees, webhooks) are unchanged v1 calls.
// Docs: https://docs.stripe.com/connect/risk-management/connected-accounts-with-managed-risk
// ---------------------------------------------------------------------------
export const CONNECT_API_VERSION = "2026-10-28.preview";

// `as never` keeps these calls compiling whichever stripe-node version is installed,
// since preview-only fields may not be in its generated types yet.
const v2Options = { apiVersion: CONNECT_API_VERSION } as never;

export async function createConnectedAccount(email: string): Promise<string> {
  const account = await getStripe().v2.core.accounts.create(
    {
      contact_email: email,
      dashboard: "express",
      identity: { country: "US" },
      defaults: {
        responsibilities: { fees_collector: "stripe", losses_collector: "stripe" },
      },
      configuration: {
        merchant: { capabilities: { card_payments: { requested: true } } },
      },
    } as never,
    v2Options,
  );
  return account.id;
}

export async function createOnboardingLink(accountId: string, origin: string): Promise<string> {
  const link = await getStripe().v2.core.accountLinks.create(
    {
      account: accountId,
      use_case: {
        type: "account_onboarding",
        account_onboarding: {
          configurations: ["merchant"],
          refresh_url: `${origin}/api/stripe/connect/refresh?account=${accountId}`,
          return_url: `${origin}/connect/return?account=${accountId}`,
        },
      },
    } as never,
    v2Options,
  );
  return (link as unknown as { url: string }).url;
}

/** True once the connected account's card_payments capability is active. */
export async function isAccountReady(accountId: string): Promise<boolean> {
  const account = (await getStripe().v2.core.accounts.retrieve(
    accountId,
    { include: ["configuration.merchant"] } as never,
    v2Options,
  )) as unknown as {
    configuration?: { merchant?: { capabilities?: { card_payments?: { status?: string } } } };
  };
  return account.configuration?.merchant?.capabilities?.card_payments?.status === "active";
}

export function toCents(price: number | string): number {
  return Math.round(Number(price) * 100);
}

export function platformFeeCents(amountCents: number): number {
  return Math.max(1, Math.round((amountCents * PLATFORM_FEE_PERCENT) / 100));
}
