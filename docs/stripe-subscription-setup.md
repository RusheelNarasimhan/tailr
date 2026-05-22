# Stripe monthly subscription setup

## 1. Create product & price

1. [Stripe Dashboard](https://dashboard.stripe.com/) → **Product catalog** → **Add product**
2. Name: `Tailr Pro`
3. Pricing: **Recurring** → **Monthly** → amount (e.g. `$9.00 USD`)
4. Save and copy the **Price ID** (`price_...`)

## 2. Environment variables

```env
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_PRO_PRICE_ID=price_xxxxxxxx
NEXT_PUBLIC_PRO_PRICE_MONTHLY=9
```

`NEXT_PUBLIC_PRO_PRICE_MONTHLY` should match the dollar amount shown in the app UI.

## 3. Webhook events

**Developers → Webhooks → Add endpoint** → `https://yourdomain.com/api/stripe/webhook`

Enable:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

(past_due / canceled states are handled via `customer.subscription.updated`)


## 4. Billing portal (cancel / update card)

**Settings → Billing → Customer portal** → enable and save.

Users with Pro see **Manage billing** in the app.

## 5. Supabase migration

Run `supabase/subscription.sql` in the SQL editor (adds Stripe columns to `profiles`).

## 6. Local testing

Use Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Set the printed `whsec_...` as `STRIPE_WEBHOOK_SECRET` in `.env.local`.

After checkout, `/api/stripe/confirm` still unlocks Pro when webhooks do not reach localhost.
