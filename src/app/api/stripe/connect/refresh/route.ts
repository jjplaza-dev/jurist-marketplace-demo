import { NextResponse } from "next/server";
import { createOnboardingLink } from "@/lib/stripe";
import { getAdmin } from "@/lib/supabase-admin";

// Stripe sends the seller here when an onboarding link expired or was already used.
// We mint a fresh link for the same connected account and send them back to Stripe.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const accountId = url.searchParams.get("account") ?? "";
  const fallback = NextResponse.redirect(new URL("/connect", url.origin));

  if (!accountId.startsWith("acct_")) return fallback;

  try {
    const { data: seller } = await getAdmin()
      .from("sellers")
      .select("stripe_account_id")
      .eq("stripe_account_id", accountId)
      .maybeSingle();
    if (!seller) return fallback;

    return NextResponse.redirect(await createOnboardingLink(accountId, url.origin));
  } catch (err) {
    console.error("connect refresh failed", err);
    return fallback;
  }
}
