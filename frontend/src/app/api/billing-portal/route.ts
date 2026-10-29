import Stripe from "stripe";
import { auth } from "@clerk/nextjs/server";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, { apiVersion: "2026-01-28.clover" })
  : null;

// Opens Stripe's customer portal so Pro users can cancel or update their card.
// The webhook stores the Clerk user id on the Stripe customer at checkout.
export async function POST() {
  if (!stripe) {
    return new Response("Stripe is not configured.", { status: 500 });
  }
  const { userId } = await auth();
  if (!userId) {
    return new Response("Sign in first.", { status: 401 });
  }

  const found = await stripe.customers.search({
    query: `metadata['clerk_user_id']:'${userId.replace(/'/g, "")}'`,
    limit: 1,
  });
  const customer = found.data[0];
  if (!customer) {
    return new Response("No billing account yet. It appears after your first Pro payment.", { status: 404 });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customer.id,
    return_url: `${appUrl}/app`,
  });
  return Response.json({ url: session.url });
}
