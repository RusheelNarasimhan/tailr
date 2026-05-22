# Stripe monthly subscription setup (4 CAD)

## 1. Create product & price

1. [Stripe Dashboard](https://dashboard.stripe.com/) → **Product catalog** → **Add product**
2. Name: `Tailr Pro`
3. Pricing: **Recurring** → **Monthly** → **CA$4.00 CAD**
4. Save and copy the **Price ID** (`price_...`)

## 2. Environment variables

Add to `.env.local` and **Vercel** (Production):

```env
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_PRO_PRICE_ID=price_xxxxxxxx
NEXT_PUBLIC_PRO_PRICE_MONTHLY=4
NEXT_PUBLIC_PRO_PRICE_CURRENCY=CAD
```

The Price ID must be your **4 CAD/month** price. Display vars must match (`4` + `CAD`).

## 3. Webhook events

**Developers → Webhooks → Add endpoint** → `https://yourdomain.com/api/stripe/webhook`

Enable:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

(past_due / canceled states sync via `customer.subscription.updated`)

## 4. Billing portal (cancel / update card)

**Settings → Billing → Customer portal** → enable and save.

## 5. Supabase migration

Run `supabase/subscription.sql` in the SQL editor if `profiles` lacks Stripe columns.

## 6. Local testing

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Use the printed `whsec_...` as `STRIPE_WEBHOOK_SECRET`. After checkout, `/api/stripe/confirm` still unlocks Pro when webhooks do not reach localhost.
