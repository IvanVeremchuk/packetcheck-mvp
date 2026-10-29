# Frontend Configuration

Required environment variables:

- `NEXT_PUBLIC_API_BASE_URL`: Backend API base URL (e.g. `https://api.packetcheck.ai`).
- `NEXT_PUBLIC_APP_URL`: Public app URL (e.g. `https://packetcheck.ai`).
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk publishable key.
- `CLERK_SECRET_KEY`: Clerk secret key.
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`: `/sign-in`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL`: `/sign-up`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`: `/app`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`: `/app`

PostHog:

- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST`

Stripe (for Checkout):

- `STRIPE_SECRET_KEY`
- `STRIPE_PRICE_ID` (monthly Pro subscription, $5)
- `STRIPE_PACK_PRICE_ID` (one-time price, $3 for a 10-check pack)
- `PACK_CREDITS` (optional, default 10: checks added per pack)
- `STRIPE_WEBHOOK_SECRET` (required for webhook verification)
- Webhook events: `checkout.session.completed`, `customer.subscription.deleted`

## Deployment (Render backend + Vercel frontend)

1. After deploying backend on Render, note the service URL (e.g. `https://packetcheck-mvp.onrender.com`).
2. In Vercel: Project → Settings → Environment Variables.
3. Set `NEXT_PUBLIC_API_BASE_URL` to your Render URL (e.g. `https://packetcheck-mvp.onrender.com`).
4. Redeploy the frontend (Deployments → ⋮ on latest → Redeploy, or push a commit).
