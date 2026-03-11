import Stripe from "stripe";
import { headers } from "next/headers";
import { clerkClient } from "@clerk/nextjs/server";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, { apiVersion: "2026-01-28.clover" })
  : null;

export async function POST(req: Request) {
  if (!stripe || !stripeWebhookSecret) {
    return new Response("Stripe webhook is not configured.", { status: 500 });
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
      error instanceof Error ? error.message : "Invalid webhook signature.",
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const clerkUserId =
      session.client_reference_id ?? session.metadata?.clerkUserId ?? null;

    if (clerkUserId) {
      const client = await clerkClient();
      await client.users.updateUser(clerkUserId, {
        publicMetadata: {
          plan: "pro",
        },
      });
    }
  }

  return new Response("ok", { status: 200 });
}
