import { NextResponse } from "next/server";
import { canSellerBePaid, getSeller, UUID_RE } from "@/lib/payments";
import { CURRENCY, getStripe, MIN_CHARGE_CENTS, platformFeeCents, toCents } from "@/lib/stripe";
import { getAdmin } from "@/lib/supabase-admin";

// POST { listingId } -> { url } : Stripe Checkout for one listing.
// Direct charge: the payment is created ON the seller's connected account, and the
// marketplace keeps `application_fee_amount`.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const listingId = String(body?.listingId ?? "");
  if (!UUID_RE.test(listingId)) {
    return NextResponse.json({ error: "Unknown listing." }, { status: 400 });
  }

  try {
    const { data: listing } = await getAdmin()
        .from("listings")
        .select("id, title, description, price, seller_email, image_url, status")
        .eq("id", listingId)
        .maybeSingle();

    if (!listing) return NextResponse.json({ error: "Listing not found." }, { status: 404 });
    if (listing.status === "sold") {
      return NextResponse.json({ error: "This item has already been sold." }, { status: 409 });
    }

    const amount = toCents(listing.price);
    if (amount < MIN_CHARGE_CENTS) {
      return NextResponse.json({ error: "This item can't be bought online." }, { status: 400 });
    }

    // The price always comes from the database, never from the browser.
    const seller = await getSeller(listing.seller_email);
    if (!canSellerBePaid(seller)) {
      return NextResponse.json({ error: "This seller hasn't finished Stripe onboarding yet." }, { status: 400 });
    }

    const fee = platformFeeCents(amount);
    const origin = new URL(req.url).origin;
    const accountId = seller.stripe_account_id;

    const session = await getStripe().checkout.sessions.create(
        {
          mode: "payment",
          line_items: [
            {
              quantity: 1,
              price_data: {
                currency: CURRENCY,
                unit_amount: amount,
                product_data: {
                  name: listing.title,
                  ...(listing.description ? { description: listing.description.slice(0, 300) } : {}),
                  ...(listing.image_url ? { images: [listing.image_url] } : {}),
                },
              },
            },
          ],
          payment_intent_data: {
            application_fee_amount: fee,
            metadata: { listing_id: listing.id },
          },
          metadata: { listing_id: listing.id, application_fee_amount: String(fee) },
          success_url: `${origin}/purchase/success?session_id={CHECKOUT_SESSION_ID}&account=${accountId}`,
          cancel_url: `${origin}/item/${listing.id}`,
        },
        { stripeAccount: accountId },
    );

    if (!session.url) throw new Error("Stripe did not return a Checkout URL.");
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("checkout failed", err);
    return NextResponse.json({ error: "Could not start checkout. Try again." }, { status: 500 });
  }
}