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
- `STRIPE_PRICE_ID`
- `STRIPE_WEBHOOK_SECRET` (required for webhook verification)
