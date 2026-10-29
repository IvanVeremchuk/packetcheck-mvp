# PacketCheck pricing

Goal: cover running costs (AI tokens, IP lookups, card fees, hosting) with a margin, at a
price an individual will pay without thinking twice.

## The model

| Plan | Price | What you get |
| --- | --- | --- |
| Free | $0 | Scanner + in-browser rule check, unlimited. 3 AI second opinions a month. |
| Check pack | $3 once | 10 more AI checks. Never expire. No subscription. |
| Pro | $5 a month | 150 AI checks a month (fair use), for IT helpers and power users. |

Experienced users pay nothing: they paste `netstat -ano`, `ss -tunap` or `lsof -i` output into
the free checker. The paid part is only the AI explanation + IP reputation lookups.

## What one AI check costs

Model: `gpt-4o-mini` via OpenRouter, $0.15 per 1M input tokens, $0.60 per 1M output tokens.

- Input: system prompt (~450 tokens) + rule findings (~300) + condensed report (capped at 24,000
  characters, usually 2,000–6,000 tokens) → up to ~7,000 tokens → **$0.0011**
- Output: capped at 900 tokens → **$0.0005**
- **About $0.002 per check, worst case.**

IP lookups: AbuseIPDB free plan, 1,000 lookups a day. Each check looks up at most 12 public
IPs (`MAX_IP_LOOKUPS` in `backend/main.py`), so the free plan carries ~80 AI checks a day.
Above that, AbuseIPDB Basic (10,000 a day) is about $19/month (third-party figure, confirm on
their site).

## Margins after card fees (Stripe US: 2.9% + $0.30)

| Plan | You receive | AI cost (worst case) | Left over |
| --- | --- | --- | --- |
| Pack $3 | $2.61 | 10 × $0.002 = $0.02 | **$2.59** |
| Pro $5 | $4.55 | 150 × $0.002 = $0.30 | **$4.25** |
| Free user | $0 | 3 × $0.002 = $0.006 | −$0.006 |

Why $3 and not $1: Stripe's fixed $0.30 would take 33% of a $1 payment. $3 is the smallest
price where fees stay near 13%.

## Fixed monthly costs (estimate)

| Item | Cost |
| --- | --- |
| Render backend (starter, no sleep) | $7 |
| Vercel (Hobby is non-commercial; Pro once you charge) | $0–20 |
| Domain | ~$1 |
| Clerk, PostHog, AbuseIPDB | $0 on free tiers |
| **Total** | **~$8–28** |

Break-even: about **4–11 packs** or **2–7 Pro subscribers a month**. 1,000 free users cost
about $6 in tokens; the AbuseIPDB daily limit is the first thing you'll outgrow.

## Knobs

- `FREE_MONTHLY_CHECKS` (backend, default 3) and `PRO_MONTHLY_CHECKS` (default 150)
- `PACK_CREDITS` (frontend webhook, default 10) — keep in sync with the pricing table copy
- `STRIPE_PACK_PRICE_ID` — a one-time $3 price in Stripe
- Failed AI checks are never charged (`reserve_usage` → `commit_usage` in `backend/main.py`)

Prices checked 2026-10-28. Re-check model and Stripe prices before launch.
