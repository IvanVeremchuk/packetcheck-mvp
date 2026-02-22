import Stripe from "stripe";
import { auth } from "@clerk/nextjs/server";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripePriceId = process.env.STRIPE_PRICE_ID;
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, { apiVersion: "2026-01-28.clover" })
  : null;

export async function POST() {
  if (!stripe || !stripePriceId) {
    return new Response("Stripe is not configured.", { status: 500 });
  }
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: stripePriceId, quantity: 1 }],
    client_reference_id: userId,
    metadata: {
      clerkUserId: userId,
      plan: "pro",
    },
    success_url: `${appUrl}/app?checkout=success`,
    cancel_url: `${appUrl}/pricing?checkout=cancel`,
  });

  return Response.json({ url: session.url });
}
