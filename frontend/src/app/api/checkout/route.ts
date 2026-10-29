import Stripe from "stripe";
import { auth } from "@clerk/nextjs/server";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
// Monthly Pro subscription.
const stripePriceId = process.env.STRIPE_PRICE_ID;
// One-time pack of AI checks (a one-off price in Stripe, e.g. $3 for 10).
const stripePackPriceId = process.env.STRIPE_PACK_PRICE_ID;
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, { apiVersion: "2026-01-28.clover" })
  : null;

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { kind?: string };
  const kind = body.kind === "pack" ? "pack" : "pro";
  const priceId = kind === "pack" ? stripePackPriceId : stripePriceId;

  if (!stripe || !priceId) {
    return new Response("Stripe is not configured.", { status: 500 });
  }
  const { userId } = await auth();
  if (!userId) {
    return new Response("Sign in first.", { status: 401 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: kind === "pack" ? "payment" : "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    client_reference_id: userId,
    metadata: {
      clerkUserId: userId,
      kind,
      plan: kind === "pro" ? "pro" : "",
    },
    success_url: `${appUrl}/app?checkout=${kind}`,
    cancel_url: `${appUrl}/pricing?checkout=cancel`,
  });

  return Response.json({ url: session.url });
}
