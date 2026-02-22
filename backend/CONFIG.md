# Backend Configuration

Required environment variables:

- `ABUSE_IP_KEY`: AbuseIPDB API key.
- `OPENROUTER_API_KEY`: OpenRouter API key.
- `OPENROUTER_MODEL`: Optional model override. Default: `gpt-4o-mini`.
- `CLERK_ISSUER`: Clerk token issuer URL used to verify JWTs.

Optional auth environment variables:- `CLERK_JWKS_URL`: Override JWKS URL (default: `<CLERK_ISSUER>/.well-known/jwks.json`).
- `CLERK_AUDIENCE`: JWT audience claim to enforce if your token template sets an audience.
