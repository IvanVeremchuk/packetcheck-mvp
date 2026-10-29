import Stripe from "stripe";
import { headers } from "next/headers";
import { clerkClient } from "@clerk/nextjs/server";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
// AI checks added by one pack purchase. Keep in sync with the pricing page.
const PACK_CREDITS = Number(process.env.PACK_CREDITS ?? 10);

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
      const user = await client.users.getUser(clerkUserId);
      const current = (user.publicMetadata || {}) as Record<string, unknown>;
      const isPack = session.metadata?.kind === "pack";

      if (isPack) {
        // Stripe can deliver the same event twice; credit each session once.
        const privateMeta = (user.privateMetadata || {}) as Record<string, unknown>;
        const credited = Array.isArray(privateMeta.credited_sessions)
          ? (privateMeta.credited_sessions as string[])
          : [];
        if (!credited.includes(session.id)) {
          const credits = Number(current.credits ?? 0) || 0;
          await client.users.updateUser(clerkUserId, {
            publicMetadata: { ...current, credits: credits + PACK_CREDITS },
            privateMetadata: {
              ...privateMeta,
              credited_sessions: [...credited, session.id].slice(-25),
            },
          });
        }
      } else {
        // Keep credits and usage counters; only switch the plan.
        await client.users.updateUser(clerkUserId, {
          publicMetadata: { ...current, plan: "pro" },
        });
      }

      const customerId =
        typeof session.customer === "string"
          ? session.customer
          : session.customer?.id;
      if (customerId) {
        await stripe.customers.update(customerId, {
          metadata: { clerk_user_id: clerkUserId },
        });
      }
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId =
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer?.id;
    if (!customerId) {
      return new Response("ok", { status: 200 });
    }

    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted) {
      return new Response("ok", { status: 200 });
    }

    const clerkUserId = customer.metadata?.clerk_user_id;
    if (clerkUserId) {
      const client = await clerkClient();
      const user = await client.users.getUser(clerkUserId);
      const current = (user.publicMetadata || {}) as Record<string, unknown>;
      await client.users.updateUser(clerkUserId, {
        publicMetadata: { ...current, plan: "free" },
      });
    }
  }

  return new Response("ok", { status: 200 });
}
