# Tailr

AI resume tailor — paste bullets and a job description, get three ATS-friendly full resume variants as LaTeX (PDF) and Word (.docx).

## Stack

- Next.js 14 (App Router)
- Supabase (auth + Postgres)
- Anthropic Claude
- Stripe (monthly Pro subscription)

## Setup

1. Copy `.env.example` to `.env.local` and fill in values.
2. Run SQL in Supabase:
   - `supabase/schema.sql` — profiles + trigger + RLS
   - `supabase/resume_cache.sql` — generation cache (optional; needs `SUPABASE_SERVICE_ROLE_KEY`)
   - `supabase/subscription.sql` — Stripe subscription columns on `profiles` (if not using fresh `schema.sql`)
3. **Auth:**
   - **Email:** Authentication → Providers → Email → enable; set **Confirm email** as you prefer (off = instant sign-in after signup).
   - **Google:** Follow [docs/google-auth-setup.md](docs/google-auth-setup.md) (Google Cloud OAuth client + Supabase Google provider).
4. **Redirect URLs:** Authentication → URL Configuration → add `http://localhost:3000/auth/callback` and your production `/auth/callback` URL.
5. `npm install` then `npm run dev`.

### Environment variables

See `.env.example`. Important:

- `STRIPE_PRO_PRICE_ID` — monthly price ID from Stripe (`price_...`). Setup: [docs/stripe-subscription-setup.md](docs/stripe-subscription-setup.md)
- `NEXT_PUBLIC_PRO_PRICE_MONTHLY` — display price in UI (e.g. `9` for $9/mo)
- `NEXT_PUBLIC_APP_URL` must be the **origin only** (e.g. `http://localhost:3000`), not `/app`.
- `SUPABASE_SERVICE_ROLE_KEY` enables generation cache and subscription webhooks.
- `TAILOR_MOCK_RESPONSE=1` works only in **development** (skips the LLM).

## Scripts

- `npm run dev` — local dev
- `npm run build` — production build
- `npm run start` — run production server

## Routes

| Path | Description |
|------|-------------|
| `/` | Landing |
| `/auth/login` | Google OAuth + email/password sign in / sign up |
| `/auth/callback` | OAuth / email confirmation callback |
| `/auth/update-password` | Set new password after reset email |
| `/app` | Resume tailor (protected) |
| `/api/tailor` | Generate 3 variants (LaTeX + DOCX) |
| `/api/stripe/checkout` | Start Pro subscription checkout |
| `/api/stripe/confirm` | Confirm subscription after redirect (local dev) |
| `/api/stripe/portal` | Stripe billing portal (manage / cancel) |
| `/api/stripe/webhook` | Stripe webhook (subscription lifecycle) |

## Resume layouts

- **Compact** — dense, targets 1–2 pages; trims long content automatically.
- **Modern** — balanced spacing.
- **Academic** — section-heavy.
- **Prefer ~1 page** (checkbox in app) — tighter trim and shorter LLM sections.

Drafts auto-save in the browser (`localStorage`) so bullets and job text persist across refreshes.

## Deploy

Deploy on Vercel. Set the same env vars. Configure Stripe per [docs/stripe-subscription-setup.md](docs/stripe-subscription-setup.md).

Webhook URL: `https://yourdomain.com/api/stripe/webhook` (subscription + checkout events).

For local testing, use Stripe CLI or `/api/stripe/confirm` after checkout redirect.
