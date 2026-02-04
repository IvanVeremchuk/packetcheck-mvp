import Stripe from "stripe";
import { headers } from "next/headers";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, { apiVersion: "2026-01-28.clover" })
  : null;

export async function POST(req: Request) {
  if (!stripe || !stripeWebhookSecret) {
    return new Response("Stripe is not configured.", { status: 500 });
  }

  const body = await req.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return new Response("Missing stripe-signature header.", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret);
  } catch (error) {
    return new Response(
      error instanceof Error ? error.message : "Webhook error",
      { status: 400 }
    );
  }

  // TODO: persist subscription state once a database is added.
  if (event.type === "checkout.session.completed") {
    // Placeholder for future billing entitlements.
  }

  return new Response(null, { status: 200 });
}
