import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { fulfillCheckoutSession, formatCents } from "@/lib/payments";
import { getStripe } from "@/lib/stripe";
import { getAdmin } from "@/lib/supabase-admin";

export const metadata = { title: "Order confirmation · Marketplace" };

type SearchParams = Promise<{ session_id?: string; account?: string }>;

export default function PurchaseSuccessPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-white" />}>
        <SuccessContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

type Order = {
  listing_title: string | null;
  amount_total: number;
  currency: string;
  buyer_email: string | null;
};

async function SuccessContent({ searchParams }: { searchParams: SearchParams }) {
  const { session_id: sessionId = "", account: accountId = "" } = await searchParams;
  await connection();

  let paid = false;
  let order: Order | null = null;

  if (sessionId.startsWith("cs_") && accountId.startsWith("acct_")) {
    try {
      const admin = getAdmin();

      // Only accounts that belong to one of our sellers are ever queried.
      const { data: seller } = await admin
        .from("sellers")
        .select("stripe_account_id")
        .eq("stripe_account_id", accountId)
        .maybeSingle();

      if (seller) {
        const session = await getStripe().checkout.sessions.retrieve(sessionId, {}, { stripeAccount: accountId });
        paid = session.payment_status === "paid";

        // The webhook is the main path. This is idempotent and only covers the (rare)
        // case where the buyer lands here before the webhook has been delivered.
        if (paid) await fulfillCheckoutSession(session, accountId);

        const { data } = await admin
          .from("orders")
          .select("listing_title, amount_total, currency, buyer_email")
          .eq("stripe_session_id", sessionId)
          .maybeSingle();
        order = (data as Order | null) ?? null;
      }
    } catch (err) {
      console.error("success page failed", err);
    }
  }

  if (!paid) {
    return (
      <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
        <h1 className="text-2xl font-bold">We couldn&apos;t confirm a payment</h1>
        <p className="mt-2 text-sm text-gray-700">
          If you were charged, the order will still be recorded once Stripe confirms it. Otherwise you can try again.
        </p>
        <Link href="/" className="mt-6 inline-block rounded-md bg-fb px-4 py-2 font-semibold text-white hover:bg-fb-dark">
          Back to Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div role="status" className="rounded-2xl bg-white p-6 text-center shadow-sm">
      <div aria-hidden className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-2xl text-green-700">
        ✓
      </div>
      <h1 className="text-2xl font-bold text-green-700">Purchase successful</h1>
      <p className="mt-2 text-sm text-gray-700">Thank you! Your payment has been processed.</p>

      {order ? (
        <dl className="mt-5 space-y-1 rounded-xl bg-surface p-4 text-left text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-gray-600">Item</dt>
            <dd className="min-w-0 break-words text-right font-medium">{order.listing_title ?? "Listing"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-gray-600">Total paid</dt>
            <dd className="font-medium">{formatCents(order.amount_total, order.currency)}</dd>
          </div>
          {order.buyer_email ? (
            <div className="flex justify-between gap-4">
              <dt className="text-gray-600">Receipt to</dt>
              <dd className="break-all text-right font-medium">{order.buyer_email}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}

      <p className="mt-4 break-all text-xs text-gray-500">Order reference: {sessionId}</p>

      <Link href="/" className="mt-6 inline-block rounded-md bg-fb px-4 py-2 font-semibold text-white hover:bg-fb-dark">
        Continue shopping
      </Link>
    </div>
  );
}
