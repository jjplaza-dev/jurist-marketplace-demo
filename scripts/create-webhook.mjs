// Registers this app's Connect webhook endpoint in the Stripe sandbox. Run ONCE after deploying:
//
//   node --env-file=.env.local scripts/create-webhook.mjs https://YOUR-APP.vercel.app
//
// Use the public production URL (preview URLs are login-protected, so Stripe can't reach them).
// Stripe prints the signing secret only this once: save it as STRIPE_WEBHOOK_SECRET in
// .env.local and in Vercel, then redeploy.
import Stripe from "stripe";

const base = process.argv[2] ?? process.env.APP_URL;
if (!base || !/^https:\/\//.test(base)) {
  console.error("Usage: node --env-file=.env.local scripts/create-webhook.mjs https://YOUR-APP.vercel.app");
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const endpoint = await stripe.webhookEndpoints.create({
  url: `${base.replace(/\/$/, "")}/api/stripe/webhook`,
  connect: true, // payments are created on the seller's connected account (direct charges)
  enabled_events: ["checkout.session.completed", "account.updated"],
});

console.log("Endpoint:       ", endpoint.id, endpoint.url);
console.log("Signing secret: ", endpoint.secret);
