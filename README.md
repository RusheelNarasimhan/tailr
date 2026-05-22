# Tailr

AI resume tailor — paste bullets and a job description, get three ATS-friendly full resume variants as LaTeX (PDF) and Word (.docx).

## Stack

- Next.js 14 (App Router)
- Supabase (auth + Postgres)
- Anthropic Claude
- Stripe (one-time Pro upgrade)

## Setup

1. Copy `.env.example` to `.env.local` and fill in values.
2. Run SQL in Supabase:
   - `supabase/schema.sql` — profiles + trigger + RLS
   - `supabase/resume_cache.sql` — generation cache (optional; needs `SUPABASE_SERVICE_ROLE_KEY`)
3. **Auth:** Supabase → Authentication → Providers → **Email** → enable Email, set **Confirm email** as you prefer (off = instant sign-in after signup).
4. **Redirect URLs:** Site URL + `http://localhost:3000/auth/callback` (match your dev port).
5. `npm install` then `npm run dev`.

### Environment variables

See `.env.example`. Important:

- `NEXT_PUBLIC_APP_URL` must be the **origin only** (e.g. `http://localhost:3000`), not `/app`.
- `SUPABASE_SERVICE_ROLE_KEY` enables generation cache (model JSON only; exports re-render with your profile).
- `TAILOR_MOCK_RESPONSE=1` works only in **development** (skips the LLM).

## Scripts

- `npm run dev` — local dev
- `npm run build` — production build
- `npm run start` — run production server

## Routes

| Path | Description |
|------|-------------|
| `/` | Landing |
| `/auth/login` | Email + password sign in / sign up |
| `/auth/update-password` | Set new password after reset email |
| `/app` | Resume tailor (protected) |
| `/api/tailor` | Generate 3 variants (LaTeX + DOCX) |
| `/api/stripe/checkout` | Start Pro checkout |
| `/api/stripe/confirm` | Confirm payment after redirect (local dev) |
| `/api/stripe/webhook` | Stripe webhook (production) |

## Resume layouts

- **Compact** — dense, targets 1–2 pages; trims long content automatically.
- **Modern** — balanced spacing.
- **Academic** — section-heavy.

## Deploy

Deploy on Vercel. Set the same env vars. Register Stripe webhook: `https://yourdomain.com/api/stripe/webhook` (`checkout.session.completed`).

For local Pro upgrades, returning from Stripe hits `/api/stripe/confirm` (webhooks do not reach localhost).
