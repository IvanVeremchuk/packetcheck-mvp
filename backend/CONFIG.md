# Backend Configuration

Required environment variables:

- `ABUSE_IP_KEY`: AbuseIPDB API key.
- `OPENROUTER_API_KEY`: OpenRouter API key.
- `OPENROUTER_MODEL`: Optional model override. Default: `gpt-4o-mini`.
- `CLERK_ISSUER`: Clerk token issuer URL used to verify JWTs.

Optional auth environment variables:
- `CLERK_JWKS_URL`: Override JWKS URL (default: `<CLERK_ISSUER>/.well-known/jwks.json`).
- `CLERK_AUDIENCE`: JWT audience claim to enforce if your token template sets an audience.
- `CLERK_SECRET_KEY`: Required for free-tier usage limits. Used to fetch/update user metadata via Clerk API.

Usage limits (optional):
- `FREE_MONTHLY_CHECKS`: AI checks included per month on the free plan. Default: 3.
- `PRO_MONTHLY_CHECKS`: AI checks per month on Pro (fair use). Default: 150.

Endpoints:
- `POST /analyze`: IP reputation for a server log (existing).
- `POST /scan`: AI second opinion on a remote-access scan report. Body: `report_text`, `local_findings`, `local_verdict`. Charges one check only on success.
