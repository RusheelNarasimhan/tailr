# Tailr

AI resume tailor — paste bullets and a job description, get three ATS-friendly variants as LaTeX (PDF) and Word (.docx).

## Stack

- Next.js 14 (App Router)
- Supabase (auth + Postgres)
- Anthropic Claude
- Stripe (one-time Pro upgrade)

## Setup

1. Copy env vars into `.env.local` (see keys below).
2. Run SQL in Supabase:
   - `supabase/schema.sql` — profiles + trigger + RLS
   - `supabase/resume_cache.sql` — generation cache (optional, needs service role)
3. **Auth:** Supabase → Authentication → Providers → **Email** → enable Email, set **Confirm email** as you prefer (off = instant sign-in after signup).
4. **Redirect URLs:** Site URL + `http://localhost:3000/auth/callback` (match your dev port).
5. `npm install` then `npm run dev`.

### Environment variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Optional: `TAILOR_MOCK_RESPONSE=1` skips the LLM for API testing.

## Scripts

- `npm run dev` — local dev
- `npm run build` — production build
- `npm run start` — run production server

## Routes

| Path | Description |
|------|-------------|
| `/` | Landing |
| `/auth/login` | Email + password sign in / sign up |
| `/app` | Resume tailor (protected) |
| `/api/tailor` | Generate 3 variants (LaTeX + DOCX) |

## Deploy

Deploy on Vercel. Set the same env vars. Register Stripe webhook: `https://yourdomain.com/api/stripe/webhook` (`checkout.session.completed`).
