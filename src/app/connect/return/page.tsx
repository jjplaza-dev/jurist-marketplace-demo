import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { refreshSeller } from "@/lib/payments";

export const metadata = { title: "Stripe setup · Marketplace" };

type SearchParams = Promise<{ account?: string }>;

export default function ConnectReturnPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <Suspense fallback={<div className="h-48 animate-pulse rounded-2xl bg-white" />}>
        <ReturnContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function ReturnContent({ searchParams }: { searchParams: SearchParams }) {
  const { account: accountId = "" } = await searchParams;
  await connection(); // always read the latest Stripe state

  let status: "ready" | "incomplete" | "unknown" = "unknown";

  if (accountId.startsWith("acct_")) {
    try {
      // Only accounts we created for a seller are ever looked up (null otherwise).
      const seller = await refreshSeller(accountId);
      if (seller) status = seller.charges_enabled ? "ready" : "incomplete";
    } catch (err) {
      console.error("connect return failed", err);
    }
  }

  if (status === "ready") {
    return (
      <div role="status" className="rounded-2xl bg-white p-6 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-green-700">You&apos;re connected</h1>
        <p className="mt-2 text-sm text-gray-700">
          Stripe onboarding is complete. Your listings now show a Buy Now button.
        </p>
        <Link href="/" className="mt-6 inline-block rounded-md bg-fb px-4 py-2 font-semibold text-white hover:bg-fb-dark">
          Back to Marketplace
        </Link>
      </div>
    );
  }

  if (status === "incomplete") {
    return (
      <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
        <h1 className="text-2xl font-bold">Almost there</h1>
        <p className="mt-2 text-sm text-gray-700">
          Stripe still needs a few details before you can take payments. Pick up where you left off.
        </p>
        <a
          href={`/api/stripe/connect/refresh?account=${encodeURIComponent(accountId)}`}
          className="mt-6 inline-block rounded-md bg-fb px-4 py-2 font-semibold text-white hover:bg-fb-dark"
        >
          Continue on Stripe
        </a>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
      <h1 className="text-2xl font-bold">We couldn&apos;t find that setup</h1>
      <p className="mt-2 text-sm text-gray-700">Start again from the Connect with Stripe page.</p>
      <Link href="/connect" className="mt-6 inline-block rounded-md bg-fb px-4 py-2 font-semibold text-white hover:bg-fb-dark">
        Connect with Stripe
      </Link>
    </div>
  );
}
