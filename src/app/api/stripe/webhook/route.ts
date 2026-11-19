import type Stripe from "stripe";
import { NextResponse } from "next/server";
import { fulfillCheckoutSession, saveAccountState } from "@/lib/payments";
import { getStripe } from "@/lib/stripe";

// Connect webhook (registered with connect: true). Events come from the seller's
// connected account, so `event.account` tells us which one.
//
// The sandbox is shared with other apps: events for accounts/orders we don't recognise
// are ignored and answered with 200. Only a bad signature (400) or a failure of our own
// storage (500, so Stripe retries) are non-2xx.
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return new NextResponse("Webhook not configured", { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) return new NextResponse("Missing signature", { status: 400 });

  // The signature is computed over the exact raw body, so read text, not JSON.
  const payload = await req.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(payload, signature, secret);
  } catch {
    return new NextResponse("Invalid signature", { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        if (!event.account) break; // not a connected-account payment
        await fulfillCheckoutSession(event.data.object as Stripe.Checkout.Session, event.account);
        break;
      }
      case "account.updated": {
        await saveAccountState(event.data.object as Stripe.Account); // no-op for unknown accounts
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error(`webhook ${event.type} failed`, err);
    return new NextResponse("Webhook handler failed", { status: 500 });
  }

  return NextResponse.json({ received: true });
}
