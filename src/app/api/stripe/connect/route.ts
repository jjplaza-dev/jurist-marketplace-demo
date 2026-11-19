import { NextResponse } from "next/server";
import { EMAIL_RE } from "@/lib/format";
import { normalizeEmail } from "@/lib/payments";
import { createConnectedAccount, createOnboardingLink } from "@/lib/stripe";
import { getAdmin } from "@/lib/supabase-admin";

// POST { email } -> { url } : Stripe-hosted onboarding link for that seller.
// No login in v1: the seller is identified by the email on their listings.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email = normalizeEmail(String(body?.email ?? ""));
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  try {
    const admin = getAdmin();
    const origin = new URL(req.url).origin;

    // Reuse the connected account if this email already started onboarding.
    const { data: existing } = await admin
      .from("sellers")
      .select("stripe_account_id")
      .eq("email", email)
      .maybeSingle();

    let accountId: string | undefined = existing?.stripe_account_id;

    if (!accountId) {
      const newId = await createConnectedAccount(email);

      const { error } = await admin.from("sellers").insert({
        email,
        stripe_account_id: newId,
        charges_enabled: false,
        details_submitted: false,
      });

      if (error) {
        // Two simultaneous clicks: the other request won, use its account.
        if (error.code === "23505") {
          const { data: winner } = await admin
            .from("sellers")
            .select("stripe_account_id")
            .eq("email", email)
            .maybeSingle();
          accountId = winner?.stripe_account_id;
        }
        if (!accountId) throw new Error(`Saving seller failed: ${error.message}`);
      } else {
        accountId = newId;
      }
    }

    return NextResponse.json({ url: await createOnboardingLink(accountId, origin) });
  } catch (err) {
    console.error("connect failed", err);
    return NextResponse.json({ error: "Could not start Stripe onboarding. Try again." }, { status: 500 });
  }
}
