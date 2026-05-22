# Vercel environment variables (copy-paste checklist)

Open: **https://vercel.com** → your **tailr** project → **Settings** → **Environment Variables**

Add or update these for **Production** (and **Preview** if you test PRs):

| Name | Value |
|------|--------|
| `STRIPE_PRO_PRICE_ID` | `price_1Ta19F37lmp3KwPtOr1dIcq3` |
| `NEXT_PUBLIC_PRO_PRICE_MONTHLY` | `4` |
| `NEXT_PUBLIC_PRO_PRICE_CURRENCY` | `CAD` |
| `NEXT_PUBLIC_APP_URL` | `https://tailr.space` |

Confirm these already exist (same values as your `.env.local`):

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY`

Then: **Deployments** → latest deployment → **⋯** → **Redeploy** (so new vars apply).

## Test Pro checkout

1. Open https://tailr.space/auth/login
2. Sign in → go to `/app`
3. Use all 3 free runs or click **Upgrade**
4. Complete Stripe checkout (CA$4/month)
5. You should return to the app as **Pro**
6. **Manage subscription** should open the Stripe portal (cancel at period end)
